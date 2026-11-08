"""Chrome filtered sourced-set share message, clipboard, hash and fallback acceptance."""
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
                        rpc("Page.navigate",{"url":"about:blank"})
                        wait("location.href==='about:blank'")
                        base=f"http://127.0.0.1:{server.server_port}/#wantlist"
                        rpc("Page.navigate",{"url":base})
                        wait("document.querySelectorAll('.want-set-card').length===27")
                        # Two missing numbered spots; share ONLY exact printed #6.
                        js("""(()=>{const s=[...document.querySelectorAll('.want-set-card')]
                          .find(x=>x.textContent.includes('Circle K'));s.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        js("""(()=>{const q=document.querySelector('#wantlist-missing-search');
                          q.value='#6';q.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        assert js("document.querySelector('#wantlist-share-matching').textContent.includes('1 matching missing card')")
                        assert js("document.querySelector('#wantlist-share-matching').disabled") is False
                        js("""Object.defineProperty(navigator,'clipboard',{configurable:true,
                          value:{writeText:async t=>{window.__copiedText=t;}}})""")
                        js("document.querySelector('#wantlist-share-matching').click()")
                        wait("Boolean(window.__copiedText)")
                        message=js("window.__copiedText")
                        assert "1 matching missing numbered spots for filter: #6" in message,message[:300]
                        assert "Published checklist source: https://" in message
                        assert "names" in message.lower() or "name" in message.lower()
                        assert "#6 (name not independently verified)" in message
                        assert "No message was sent" in js("document.querySelector('#wantlist-share-status').textContent")
                        filtered_url=next(x.split(": ",1)[1] for x in message.splitlines()
                            if x.startswith("Open the complete matching public list: "))
                        assert "#want-filter=" in filtered_url
                        parts=json.loads(unquote(urlsplit(filtered_url).fragment.split("=",1)[1]))
                        assert parts==circle["key"]+["#6"],parts
                        assert js("document.querySelector('#wantlist-share-manual').hidden") is True
                        # Navigating the shared link restores exact matching filter and one printed card.
                        js("document.querySelector('#wantlist-close').click()")
                        rpc("Page.navigate",{"url":filtered_url})
                        wait("document.querySelector('#wantlist-dialog').open===true")
                        assert js("document.querySelector('#wantlist-missing-search').value")=="#6"
                        assert js("document.querySelectorAll('#wantlist-missing-list .want-missing-row').length")==1
                        assert "#6" in js("document.querySelector('#wantlist-missing-list .want-missing-row').textContent")
                        assert js("document.querySelector('#wantlist-print').textContent.includes('1 matching missing card')")
                        # Clipboard unavailable: accessible visible manual text with selection and focus.
                        js("Object.defineProperty(navigator,'clipboard',{configurable:true,value:null})")
                        js("document.querySelector('#wantlist-share-matching').click()")
                        wait("document.querySelector('#wantlist-share-manual').hidden===false")
                        fallback=js("""(()=>{const t=document.querySelector('#wantlist-share-manual');
                          return {value:t.value,readOnly:t.readOnly,focused:document.activeElement===t,
                             selected:t.selectionStart===0&&t.selectionEnd===t.value.length}})()""")
                        assert filtered_url in fallback["value"] and fallback["readOnly"],fallback
                        assert fallback["focused"] and fallback["selected"],fallback
                        # A delayed clipboard resolution must not say Copied after the filter changed.
                        js("""Object.defineProperty(navigator,'clipboard',{configurable:true,
                          value:{writeText:t=>new Promise(resolve=>{window.__resolveShare=resolve;})}})""")
                        js("document.querySelector('#wantlist-share-matching').click()")
                        wait("typeof window.__resolveShare==='function'")
                        js("""(()=>{const q=document.querySelector('#wantlist-missing-search');
                            q.value='#2';q.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        js("window.__resolveShare()")
                        wait("document.querySelector('#wantlist-share-manual').hidden===true")
                        assert js("document.querySelector('#wantlist-share-status').textContent")==""
                        js("""(()=>{const q=document.querySelector('#wantlist-missing-search');
                          q.value='__does_not_exist__';q.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        assert js("document.querySelector('#wantlist-share-matching').disabled") is True
                        assert js("document.querySelector('#wantlist-share-manual').hidden") is True
                        js("document.querySelector('#wantlist-close').click()")
                        # Large set produces a bounded, honest 12-number preview, not a 785-line message.
                        js("""(()=>{const s=[...document.querySelectorAll('.want-set-card')]
                          .find(x=>x.textContent.includes('1991 Upper Deck - Base Set'));
                          s.querySelector('button').click()})()""")
                        assert "785 matching missing cards" in js("document.querySelector('#wantlist-share-matching').textContent")
                        js("""Object.defineProperty(navigator,'clipboard',{configurable:true,
                          value:{writeText:async t=>{window.__copiedText=t;}}})""")
                        js("window.__copiedText=null")
                        js("document.querySelector('#wantlist-share-matching').click()")
                        wait("Boolean(window.__copiedText)")
                        large=js("window.__copiedText")
                        assert "785 matching missing numbered spots" in large
                        assert "plus 773 more matching numbered spots" in large
                        assert len([x for x in large.splitlines() if x.startswith("#")])==12
                        assert "#want-set=" in large and "#want-filter=" not in large
                        assert len(large)<2500,len(large)
                        js("document.querySelector('#wantlist-close').click()")
                        # Invalid/stale/tampered filter hash fails closed, existing gallery remains.
                        prefix=filtered_url.split("#")[0]
                        invalid=[
                          "#want-filter=%7Bbad",
                          "#want-filter="+quote(json.dumps(circle["key"]+[""],separators=(",",":")),safe=""),
                          "#want-filter="+quote(json.dumps(circle["key"]+["Q"*101],separators=(",",":")),safe=""),
                          "#want-filter="+quote(json.dumps(circle["key"]+["__missing__"],separators=(",",":")),safe=""),
                          "#want-filter="+quote(json.dumps(["wrong",*circle["key"][1:],"#6"],separators=(",",":")),safe="")]
                        for hashpart in invalid:
                            rpc("Page.navigate",{"url":"about:blank"});wait("location.href==='about:blank'")
                            rpc("Page.navigate",{"url":prefix+hashpart})
                            wait("document.querySelectorAll('.want-set-card').length===27")
                            assert js("document.querySelector('#wantlist-dialog').open") is False,hashpart[:70]
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"filtered #6 link, clipboard/manual, 12-of-785 preview, invalid links fail closed")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
