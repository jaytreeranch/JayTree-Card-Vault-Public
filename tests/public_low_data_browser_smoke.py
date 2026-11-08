"""Real Chrome low-data mode: Save-Data auto, manual override, image network avoidance and full-photo-on-demand."""
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
                        rpc("Emulation.setDeviceMetricsOverride",{"width":width,"height":850,"mobile":True,"deviceScaleFactor":2})
                        # Separate documents; fake a real user/browser Save-Data preference BEFORE app.js runs.
                        rpc("Page.addScriptToEvaluateOnNewDocument",{"source":"""
                           Object.defineProperty(navigator,'connection',{
                            configurable:true,value:{saveData:true}});
                        """})
                        rpc("Page.navigate",{"url":"about:blank"})
                        wait("location.href==='about:blank'")
                        rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#collection"})
                        wait("document.querySelector('#stat-count')?.textContent==='1,006'")
                        assert js("document.querySelector('#gallery-low-data-toggle').checked") is True
                        assert js("document.querySelectorAll('#grid .card').length")==48
                        assert js("document.querySelectorAll('#grid img').length")==0
                        assert js("document.querySelectorAll('#grid .card-photo-deferred').length")==48
                        # No photos load without deliberate user action; catalog/checklist remain fully present.
                        loaded=js("""performance.getEntriesByType('resource').filter(x=>x.name.includes('/assets/')&&x.name.endsWith('.jpg')).length""")
                        assert loaded==0,(width,loaded)
                        assert js("document.querySelectorAll('#wantlist-sets .want-set-card').length")==27
                        assert js("document.querySelector('#gallery-low-data-help').textContent.includes('full photo')")
                        assert "browser requested data saving" in js("document.querySelector('#gallery-low-data-status').textContent")
                        # Opening one gallery card must request its full original photo and keep unverified status visible.
                        js("document.querySelector('#grid .card button').click()")
                        assert js("document.querySelector('#details').open") is True
                        assert js("Boolean(document.querySelector('#details img.detail-photo')||document.querySelector('#details .detail-photo-status:not([hidden])'))") is True
                        assert js("""(()=>{const img=document.querySelector('#details img.detail-photo');
                           return !img||img.getAttribute('src').startsWith('assets/')})()""") is True
                        wait("document.querySelector('#details img.detail-photo')?.complete||Boolean(document.querySelector('#details .detail-photo-status:not([hidden])'))")
                        req=js("""performance.getEntriesByType('resource').filter(x=>x.name.includes('/assets/')&&x.name.endsWith('.jpg')).length""")
                        assert req>=1,(width,req)
                        js("document.querySelector('#close').click()")
                        # The visitor may opt back into pictures. Existing search/filter/more count must persist.
                        js("""(()=>{const t=document.querySelector('#gallery-low-data-toggle');
                         t.checked=false;t.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelectorAll('#grid .card-pic img, #grid .card-pic .card-photo-unavailable').length")==48
                        assert js("document.querySelectorAll('#grid .card').length")==48
                        assert js("document.querySelector('#gallery-low-data-status').textContent.includes('restored')")
                        js("document.querySelector('#load-more').click()")
                        assert js("document.querySelectorAll('#grid .card').length")==96
                        js("""(()=>{const t=document.querySelector('#gallery-low-data-toggle');
                         t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelectorAll('#grid img').length")==0
                        assert js("document.querySelectorAll('#grid .card').length")==96
                        assert js("document.querySelector('#gallery-low-data-status').textContent.includes('enabled')")
                        js("""(()=>{let a=document.querySelector('#search');a.value='Brock Bowers';a.dispatchEvent(new Event('input',{bubbles:true}));})()""")
                        assert js("document.querySelector('#result-count').textContent.includes('matching cards')")
                        assert js("document.querySelectorAll('#grid img').length")==0
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"Save-Data, zero initial JPG network, full-photo on demand, manual 48->96, search, bounds")
                    # No Save-Data on fresh new Chrome page: keep ordinary gallery as default.
                    rpc("Page.addScriptToEvaluateOnNewDocument",{"source":"""
                        Object.defineProperty(navigator,'connection',{
                         configurable:true,value:{saveData:false}});
                    """})
                    rpc("Page.navigate",{"url":"about:blank"})
                    wait("location.href==='about:blank'")
                    rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#collection"})
                    wait("document.querySelector('#stat-count')?.textContent==='1,006'")
                    assert js("document.querySelector('#gallery-low-data-toggle').checked") is False
                    assert js("document.querySelectorAll('#grid .card-pic img, #grid .card-pic .card-photo-unavailable').length")==48
                    print("PASS Chrome normal gallery defaults to visible lazy photos")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
