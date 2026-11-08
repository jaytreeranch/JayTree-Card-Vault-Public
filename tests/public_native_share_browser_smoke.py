"""Real Chrome mocked Web Share support, cancellation, stale completion, offline fallback."""
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
        with tempfile.TemporaryDirectory(prefix="jt-public-missing-global-") as profile:
            proc=subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe","--headless=new",
                 "--disable-gpu","--no-first-run","--disable-extensions","--disable-background-networking",
                 "--remote-debugging-port=0","--remote-allow-origins=http://localhost",
                 "--user-data-dir="+profile,"about:blank"],
                 stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                pf=Path(profile)/"DevToolsActivePort"
                for _ in range(120):
                    if pf.exists():break
                    time.sleep(.1)
                else:raise AssertionError("DevTools did not start")
                port=int(pf.read_text().splitlines()[0])
                pages=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=4))
                ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in pages if t["type"]=="page"),
                                               timeout=12,origin="http://localhost")
                try:
                    seq=[0]
                    def rpc(method,params=None):
                        seq[0]+=1;ident=seq[0]
                        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
                        while True:
                            out=json.loads(ws.recv())
                            if out.get("id")==ident:
                                if out.get("error"):raise AssertionError(out["error"])
                                return out.get("result",{})
                    def js(expr):
                        out=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
                        if out.get("exceptionDetails"):raise AssertionError(out["exceptionDetails"])
                        return out.get("result",{}).get("value")
                    def wait(expr):
                        for _ in range(120):
                            v=js(expr)
                            if v:return v
                            time.sleep(.1)
                        raise AssertionError("Timed out "+expr)
                    def query(s):
                        js("(()=>{let input=document.querySelector('#want-global-search');input.value="+json.dumps(s)+
                           ";input.dispatchEvent(new Event('input',{bubbles:true}))})()")
                    from urllib.parse import urlsplit,unquote,quote
                    source=json.loads((ROOT/"set-checklists.json").read_text(encoding="utf-8"))
                    circle=next(x for x in source["sets"] if "Circle K" in x["set"])
                    for width in (320,390,1366):
                        rpc("Emulation.setDeviceMetricsOverride",
                            {"width":width,"height":850,"mobile":True,"deviceScaleFactor":2})
                        rpc("Page.navigate",{"url":"about:blank"});wait("location.href==='about:blank'")
                        rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#wantlist"})
                        wait("document.querySelectorAll('.want-set-card').length===27")
                        js("""(()=>{const row=[...document.querySelectorAll('.want-set-card')]
                             .find(x=>x.textContent.includes('Circle K'));row.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        # Simulate unsupported browser, then supported Web Share without needing a real phone/app.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,value:undefined})""")
                        def filter_to(value):
                            js("""(()=>{const e=document.querySelector('#wantlist-missing-search');
                                e.value="""+json.dumps(value)+""";e.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        filter_to("#6")
                        assert js("document.querySelector('#wantlist-native-share').hidden") is True
                        assert js("document.querySelector('#wantlist-share-matching').disabled") is False
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                          value:async data=>{window.__sharedPayload=data;}})""")
                        filter_to("#6")
                        assert js("document.querySelector('#wantlist-native-share').hidden") is False
                        assert "1 matching missing card" in js("document.querySelector('#wantlist-native-share').textContent")
                        js("document.querySelector('#wantlist-native-share').click()")
                        wait("Boolean(window.__sharedPayload)")
                        payload=js("window.__sharedPayload")
                        assert payload["title"].startswith("JayTree Card Vault - ")
                        assert "1 matching missing numbered spots for filter: #6" in payload["text"],payload
                        assert "#want-filter=" in payload["text"]
                        assert "Published checklist source: https://" in payload["text"]
                        assert "#6 (name not independently verified)" in payload["text"]
                        assert "Any actual sending is controlled by the app you chose" in js(
                            "document.querySelector('#wantlist-share-status').textContent")
                        assert js("document.querySelector('#wantlist-share-manual').hidden") is True
                        # User cancel is not a sent message, and does not invoke clipboard.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:()=>Promise.reject(Object.assign(new Error('cancel'),{name:'AbortError'}))})""")
                        js("document.querySelector('#wantlist-native-share').click()")
                        wait("document.querySelector('#wantlist-share-status').textContent.includes('canceled')")
                        assert "copy the message" in js("document.querySelector('#wantlist-share-status').textContent")
                        # Unexpected OS rejection is an honest fallback to the existing Copy button.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:()=>Promise.reject(new Error('unavailable'))})""")
                        js("document.querySelector('#wantlist-native-share').click()")
                        wait("document.querySelector('#wantlist-share-status').textContent.includes('Native sharing is unavailable')")
                        # A late native-share result must not update state after filter changes.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:()=>new Promise(resolve=>window.__resolveNative=resolve)})""")
                        js("document.querySelector('#wantlist-native-share').click()")
                        wait("typeof window.__resolveNative==='function'")
                        filter_to("#2")
                        js("window.__resolveNative()")
                        wait("document.querySelector('#wantlist-share-status').textContent===''")
                        assert js("document.querySelector('#wantlist-missing-search').value")=="#2"
                        # No matches disables both sharing paths, regardless of API support.
                        filter_to("__no_matching_number__")
                        assert js("document.querySelector('#wantlist-native-share').disabled") is True
                        assert js("document.querySelector('#wantlist-share-matching').disabled") is True
                        js("document.querySelector('#wantlist-close').click()")
                        js("""(()=>{const row=[...document.querySelectorAll('.want-set-card')]
                          .find(x=>x.textContent.includes('1991 Upper Deck - Base Set'));
                          row.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-missing-list').children.length")==40
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:async data=>{window.__sharedPayload=data;}})""")
                        filter_to("")
                        js("window.__sharedPayload=null")
                        js("document.querySelector('#wantlist-native-share').click()")
                        wait("Boolean(window.__sharedPayload)")
                        large=js("window.__sharedPayload.text")
                        assert "785 matching missing numbered spots" in large
                        assert "plus 773 more matching numbered spots" in large
                        assert len([row for row in large.splitlines() if row.startswith("#")])==12
                        assert "#want-set=" in large and "#want-filter=" not in large
                        assert len(large)<2500
                        # Browser without Web Share must always retain the old Copy message UI.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,value:undefined})""")
                        filter_to("")
                        assert js("document.querySelector('#wantlist-native-share').hidden") is True
                        assert js("document.querySelector('#wantlist-share-matching').disabled") is False
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"native Share supported/unsupported/cancel/error/stale, 12-of-785 and no overflow")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
