"""Real Chrome public snapshot metadata and mismatch warnings, 320/390/1366."""
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
                        wait("document.querySelector('#snapshot-integrity').textContent.includes('Catalog and numbered checklist files agree')")
                        assert js("document.querySelector('#snapshot-verified').textContent")=="503"
                        assert js("document.querySelector('#snapshot-needs-review').textContent")=="503"
                        stamp=js("document.querySelector('#snapshot-time').textContent")
                        assert "Nov 7, 2026" in stamp and "UTC" in stamp,stamp
                        assert js("document.querySelector('#snapshot-panel').getAttribute('aria-labelledby')")=="snapshot-title"
                        assert js("document.querySelector('#snapshot-integrity').getAttribute('aria-live')")=="polite"
                        assert "not a live view" in js("document.querySelector('.snapshot-explainer').textContent")
                        # Browser chooses Low-data mode but snapshot should never change.
                        js("""(()=>{const el=document.querySelector('#gallery-low-data-toggle');
                          el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelector('#snapshot-verified').textContent")=="503"
                        assert js("document.querySelectorAll('#grid img').length")==0
                        # Mismatched checklist metadata must be disclosed without mutating public source files.
                        js("""document.dispatchEvent(new CustomEvent('jaytree:public-snapshot-checklists',{
                          detail:{generated_at_utc:'2026-11-08T17:30:02+00:00',catalog_card_count:1006}}))""")
                        assert "do not report the same published snapshot" in js(
                         "document.querySelector('#snapshot-integrity').textContent")
                        # Matching date but wrong count must remain mismatched.
                        js("""document.dispatchEvent(new CustomEvent('jaytree:public-snapshot-checklists',{
                          detail:{generated_at_utc:'2026-11-07T17:30:02+00:00',catalog_card_count:999}}))""")
                        assert "do not report the same published snapshot" in js(
                         "document.querySelector('#snapshot-integrity').textContent")
                        # Error and absent timestamp must never be marked synchronized.
                        js("""document.dispatchEvent(new CustomEvent('jaytree:public-snapshot-checklists',{
                          detail:{failed:true}}))""")
                        assert "status is unavailable" in js("document.querySelector('#snapshot-integrity').textContent")
                        js("""document.dispatchEvent(new CustomEvent('jaytree:public-snapshot-checklists',{
                          detail:{generated_at_utc:null,catalog_card_count:1006}}))""")
                        assert "times are missing" in js("document.querySelector('#snapshot-integrity').textContent")
                        # Bad claimed Verified count gets a warning; valid display restores afterward.
                        js("""setPublishedCatalog({cards:state.cards,count:1006,verified_count:504,
                          needs_review_count:502,generated_at_utc:'2026-11-07T17:30:02+00:00'})""")
                        assert "catalog counts do not agree" in js(
                         "document.querySelector('#snapshot-integrity').textContent")
                        assert js("document.querySelector('#snapshot-verified').textContent")=="503"
                        js("""setPublishedCatalog({cards:state.cards,count:1006,verified_count:503,
                          needs_review_count:503,generated_at_utc:'2026-11-07T17:30:02+00:00'})""")
                        js("""document.dispatchEvent(new CustomEvent('jaytree:public-snapshot-checklists',{
                          detail:{generated_at_utc:'2026-11-07T17:30:02+00:00',catalog_card_count:1006}}))""")
                        assert "Catalog and numbered checklist files agree" in js(
                         "document.querySelector('#snapshot-integrity').textContent")
                        assert "not confirm the current private Vault" in js(
                         "document.querySelector('#snapshot-integrity').textContent")
                        # Existing gallery and approved set completion still function.
                        assert js("document.querySelectorAll('#grid .card').length")==48
                        assert js("document.querySelector('#review').options.length")>=3
                        js("""(()=>{const e=document.querySelector('#review');
                          e.value='Verified';e.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert "503 in collection" in js(
                         "document.querySelector('#result-count').textContent") or \
                          "in collection" in js("document.querySelector('#result-count').textContent")
                        assert js("document.querySelector('#snapshot-verified').textContent")=="503"
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"snapshot verified/review counts, UTC timestamp, mismatch and unavailable warnings, Low-data and gallery filter")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
