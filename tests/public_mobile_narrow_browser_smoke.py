"""JayTree public small-screen and keyboard/touch-target regression on local static preview."""
from pathlib import Path
import functools,http.server,threading,tempfile,json,subprocess,time,urllib.request
import websocket

ROOT=Path(__file__).resolve().parent.parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def run():
 server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with tempfile.TemporaryDirectory(prefix="jt-public-mobile-") as td:
   chrome=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
   proc=subprocess.Popen([chrome,"--headless=new","--disable-gpu","--no-first-run","--disable-extensions",
      "--disable-background-networking","--remote-debugging-port=0","--remote-allow-origins=http://localhost",
      "--user-data-dir="+td,"about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   try:
    pf=Path(td)/"DevToolsActivePort"
    for _ in range(100):
     if pf.exists():break
     time.sleep(.1)
    else:raise RuntimeError("Chrome DevTools unavailable")
    port=int(pf.read_text().splitlines()[0])
    tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json"))
    ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in tabs if t["type"]=="page"),timeout=10,origin="http://localhost")
    try:
     seq=[0]
     def rpc(m,p=None):
      seq[0]+=1;n=seq[0];ws.send(json.dumps({"id":n,"method":m,"params":p or {}}))
      while True:
       out=json.loads(ws.recv())
       if out.get("id")==n:
        if "error" in out:raise AssertionError(out["error"])
        return out.get("result",{})
     def js(expr):
      data=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
      if "exceptionDetails" in data:raise AssertionError(data["exceptionDetails"])
      return data.get("result",{}).get("value")
     for width in (320,360,390,768,1366):
      rpc("Emulation.setDeviceMetricsOverride",{"width":width,"height":844,"mobile":True,"deviceScaleFactor":2})
      rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#collection"})
      for _ in range(110):
       if js("document.querySelector('#stat-count')?.textContent")=="1,006":break
       time.sleep(.1)
      else:raise AssertionError("Catalog failed "+str(width))
      result=js("""(()=>{const r=e=>{let x=e.getBoundingClientRect();return {l:x.left,rr:x.right,h:x.height}};return {dev:screen.width,inner:innerWidth,visual:visualViewport.width,scroll:document.documentElement.scrollWidth,nav:[...document.querySelectorAll('nav a')].map(r),picker:r(document.querySelector('#set-finder')),sort:r(document.querySelector('#set-sort')),links:document.querySelectorAll('#set option').length,checklist:document.querySelectorAll('.want-set-card').length}})()""")
      assert result["inner"]<=width+1 and result["scroll"]<=width+1,(width,result)
      assert result["links"]==49 and result["checklist"]==27,(width,result)
      for el in result["nav"]:
       assert el["l"]>=0 and el["rr"]<=width+1,(width,result)
       if width<=490:assert el["h"]>=30,(width,result)
      assert result["picker"]["rr"]<=width+1 and result["sort"]["rr"]<=width+1,(width,result)
      print("PASS screen",width,"viewport",result["inner"],"scroll",result["scroll"],"navigation all visible")
     rpc("Emulation.setDeviceMetricsOverride",{"width":320,"height":744,"mobile":True,"deviceScaleFactor":2})
     rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#wantlist"})
     for _ in range(110):
      if js("document.querySelectorAll('.want-set-card').length")==27:break
      time.sleep(.1)
     js("document.querySelector('.want-set-open').click()")
     result=js("""(()=>{const d=document.querySelector('#wantlist-dialog');const r=d.getBoundingClientRect();return {open:d.open,width:r.width,right:r.right,links:[...d.querySelectorAll('.want-offer-link,.want-email-link')].map(x=>x.getBoundingClientRect().height),focus:document.activeElement?.id}})()""")
     assert result["open"] and result["right"]<=321 and result["width"]<=320,result
     assert result["focus"]=="wantlist-close",result
     assert all(height>=34 for height in result["links"]),result
     print("PASS 320px missing-card modal bounds, initial focus and offer link touch sizes")
    finally:ws.close()
   finally:
    proc.terminate()
    try:proc.wait(timeout=8)
    except subprocess.TimeoutExpired:proc.kill()
 finally:server.shutdown();server.server_close()
if __name__=="__main__":run()
