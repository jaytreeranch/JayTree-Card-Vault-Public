"""Real Chrome public site coverage widget integration acceptance (local static HTTP)."""
from pathlib import Path
import functools,http.server,json,subprocess,tempfile,threading,time,urllib.request
import websocket
ROOT=Path(__file__).resolve().parent.parent
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
def main():
 server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with tempfile.TemporaryDirectory(prefix="jt-public-checklist-coverage-") as profile:
   proc=subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new","--disable-gpu","--no-first-run","--disable-extensions","--disable-background-networking",
    "--remote-debugging-port=0","--remote-allow-origins=http://localhost","--user-data-dir="+profile,
    "about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   try:
    portfile=Path(profile)/"DevToolsActivePort"
    for _ in range(120):
     if portfile.exists():break
     time.sleep(.1)
    else:raise RuntimeError("Chrome DevTools unavailable")
    port=int(portfile.read_text().splitlines()[0])
    tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=4))
    ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in tabs if t["type"]=="page"),timeout=10,origin="http://localhost")
    try:
     i=[0]
     def rpc(method,params=None):
      i[0]+=1;id=i[0]
      ws.send(json.dumps({"id":id,"method":method,"params":params or {}}))
      while True:
       res=json.loads(ws.recv())
       if res.get("id")==id:
        if res.get("error"):raise AssertionError(res["error"])
        return res.get("result",{})
     def js(expr):
      ans=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
      if ans.get("exceptionDetails"):raise AssertionError(ans["exceptionDetails"])
      return ans.get("result",{}).get("value")
     def wait(expr):
      for _ in range(120):
       val=js(expr)
       if val:return val
       time.sleep(.1)
      raise AssertionError("Timeout: "+expr)
     for width in (390,320,1366):
      rpc("Emulation.setDeviceMetricsOverride",{"width":width,"height":844,"mobile":True,"deviceScaleFactor":2})
      rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#wantlist"})
      wait("document.querySelector('#stat-count')?.textContent==='1,006'")
      wait("document.querySelectorAll('#coverage-grid .coverage-card').length===21")
      assert js("document.querySelectorAll('.want-set-card').length")==27
      assert js("document.querySelector('#coverage-summary-count').textContent")=="21 awaiting sources"
      assert js("document.querySelector('#coverage-search').disabled") is False
      assert js("document.querySelectorAll('#set option').length")==49
      assert js("document.querySelector('#coverage-grid .coverage-card').textContent.includes('total unknown')")
      assert js("document.querySelectorAll('#coverage-grid .coverage-card a[href^=mailto]').length")==21
      assert js("document.querySelectorAll('#coverage-grid .coverage-card a[href*=checklist-source]').length")==21
      urls=js("""(()=>{let a=document.querySelector('.coverage-card .coverage-actions a[href*=github]');return {href:a?.href,rel:a?.rel,target:a?.target}})()""")
      assert "checklist-source.yml" in urls["href"] and urls["rel"]=="noopener noreferrer" and urls["target"]=="_blank",urls
      sizes=js("""(()=>({layout:innerWidth,visual:visualViewport.width,scroll:document.documentElement.scrollWidth,card:document.querySelector('.coverage-card').getBoundingClientRect().right}))()""")
      assert sizes["layout"]<=width+1 and sizes["scroll"]<=width+1 and sizes["card"]<=width+1,(width,sizes)
      js("document.querySelector('#coverage-pending').open=true")
      js("""(()=>{let i=document.querySelector('#coverage-search');i.value='Super Diamond Kings';i.dispatchEvent(new Event('input',{bubbles:true}));})()""")
      assert js("document.querySelectorAll('#coverage-grid .coverage-card').length")==1
      assert "Super Diamond Kings" in js("document.querySelector('.coverage-card h3').textContent")
      assert "1 of 21" in js("document.querySelector('#coverage-status').textContent")
      js("""(()=>{let i=document.querySelector('#coverage-search');i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));})()""")
      assert js("document.querySelectorAll('#coverage-grid .coverage-card').length")==21
      assert js("document.querySelector('#coverage-pending').open") is True
      print("PASS local Chrome",width,"px: 21 unknown + 27 sourced, no fabricated totals, suggestion links, search, bounds")
    finally:ws.close()
   finally:
    proc.terminate()
    try:proc.wait(timeout=8)
    except subprocess.TimeoutExpired:proc.kill()
 finally:server.shutdown();server.server_close()
if __name__=="__main__":main()
