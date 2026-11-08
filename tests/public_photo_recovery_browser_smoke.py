"""Real Chrome public photo load failures, bounded user retries and Low-data preservation."""
from pathlib import Path
import functools,http.server,json,subprocess,tempfile,threading,time,urllib.request,urllib.parse
import websocket

ROOT=Path(__file__).resolve().parent.parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix="jt-public-low-data-") as profile:
            proc=subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                "--headless=new","--disable-gpu","--no-first-run","--disable-extensions",
                "--disable-background-networking","--remote-debugging-port=0",
                "--remote-allow-origins=http://localhost","--user-data-dir="+profile,"about:blank"],
                stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                pf=Path(profile)/"DevToolsActivePort"
                for _ in range(120):
                    if pf.exists():break
                    time.sleep(.1)
                else:raise AssertionError("Chrome DevToolsActivePort unavailable")
                port=int(pf.read_text().splitlines()[0])
                tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=4))
                ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in tabs if t["type"]=="page"),
                    timeout=15,origin="http://localhost")
                try:
                    seq=[0]
                    def rpc(method,params=None):
                        seq[0]+=1;ident=seq[0]
                        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
                        while True:
                            obj=json.loads(ws.recv())
                            if obj.get("id")==ident:
                                if "error" in obj:raise AssertionError(obj["error"])
                                return obj.get("result",{})
                    def js(expr):
                        out=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
                        if out.get("exceptionDetails"):raise AssertionError(out["exceptionDetails"])
                        return out.get("result",{}).get("value")
                    def wait(expr):
                        for _ in range(120):
                            result=js(expr)
                            if result:return result
                            time.sleep(.1)
                        raise AssertionError("Timeout "+expr)
                    rpc("Page.enable")
                    for width in (320,390,1366):
                        rpc("Emulation.setDeviceMetricsOverride",
                            {"width":width,"height":850,"mobile":True,"deviceScaleFactor":2})
                        rpc("Page.navigate",{"url":"about:blank"})
                        wait("location.href==='about:blank'")
                        rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#collection"})
                        wait("document.querySelector('#stat-count')?.textContent==='1,006'")
                        assert js("document.querySelector('#gallery-low-data-toggle').checked") is False
                        assert js("document.querySelectorAll('#grid .card').length")==48
                        # Gallery image may already have failed against a missing local asset.
                        # Explicit image error validates deterministic fallback on both local and live.
                        js("""(()=>{const img=document.querySelector('#grid .card-pic img');
                          if(img)img.dispatchEvent(new Event('error'));})()""")
                        wait("Boolean(document.querySelector('#grid .card-pic .card-photo-unavailable'))")
                        assert "Open card for retry" in js(
                            "document.querySelector('#grid .card-photo-unavailable').textContent")
                        assert "photo temporarily unavailable" in js(
                            "document.querySelector('#grid .card button').getAttribute('aria-label')")
                        js("document.querySelector('#grid .card button').click()")
                        wait("document.querySelector('#details').open===true")
                        assert js("document.querySelector('.detail-title').textContent")!=""
                        assert js("document.querySelectorAll('.details-grid div').length")>=7
                        js("""(()=>{const img=document.querySelector('#details .detail-photo');
                          if(img)img.dispatchEvent(new Event('error'));})()""")
                        wait("document.querySelector('.detail-photo-status').hidden===false")
                        assert js("document.querySelector('#details .detail-photo')") is None
                        assert js("document.querySelector('.detail-photo-retry').hidden") is False
                        assert "Card details remain accessible" in js(
                            "document.querySelector('.detail-photo-status').textContent")
                        # Exactly two explicit cache-busting retries, never an autonomous request loop.
                        for attempt in (1,2):
                            loaded=js("""(()=>{const b=document.querySelector('.detail-photo-retry');
                              b.click();const img=document.querySelector('#details .detail-photo');
                              const url=img?.getAttribute('src')||'';
                              if(img)img.dispatchEvent(new Event('error'));
                              return url;})()""")
                            assert "?retry=" in loaded and loaded.endswith("-"+str(attempt)),loaded
                            assert js("document.querySelector('.detail-photo-status').hidden") is False
                            assert js("document.querySelector('.detail-photo-retry').hidden") is (attempt==2)
                        assert "Please try again later" in js(
                            "document.querySelector('.detail-photo-status').textContent")
                        assert js("document.querySelector('.detail-title').textContent")!=""
                        assert js("document.querySelector('#details .feedback-form')") is not None
                        js("document.querySelector('#close').click()")
                        # Owner can still opt out of gallery photos, and deliberately open detail.
                        js("""(()=>{const el=document.querySelector('#gallery-low-data-toggle');
                          el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelectorAll('#grid img').length")==0
                        assert js("document.querySelectorAll('#grid .card-photo-deferred').length")==48
                        js("document.querySelector('#grid .card button').click()")
                        wait("document.querySelector('#details').open===true")
                        assert js("document.querySelector('.detail-photo-wrap')") is not None
                        js("document.querySelector('#close').click()")
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"photo failure fallback, two explicit retries, readable details and Low-data preservation")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
