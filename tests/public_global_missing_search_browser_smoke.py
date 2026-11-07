"""Local real-Chrome tests of global missing-card search and existing want-list integration."""
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
                    for width in (320,390,1366):
                        rpc("Emulation.setDeviceMetricsOverride",
                            {"width":width,"height":844,"mobile":True,"deviceScaleFactor":2})
                        rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#wantlist"})
                        wait("document.querySelectorAll('.want-set-card').length===27")
                        wait("document.querySelectorAll('.coverage-card').length===21")
                        assert js("document.querySelector('#want-global-results').hidden") is True
                        query("Brock Bowers")
                        assert js("document.querySelectorAll('.want-global-row').length")==2
                        assert "2 of 2" in js("document.querySelector('#want-global-count').textContent")
                        assert js("document.querySelectorAll('.want-global-row a[href^=mailto]').length")==2
                        assert js("document.querySelectorAll('.want-global-row a[href*=missing-card-offer]').length")==2
                        urls=js("""(()=>{let a=document.querySelector('.want-global-row a[href*=missing-card-offer]');return {rel:a.rel,target:a.target}})()""")
                        assert urls=={"rel":"noopener noreferrer","target":"_blank"},urls
                        query("#6")
                        assert "20 of 20" in js("document.querySelector('#want-global-count').textContent")
                        assert js("document.querySelectorAll('.want-global-row').length")==20
                        query("Williams")
                        assert js("document.querySelectorAll('.want-global-row').length")==40
                        assert "40 of 61" in js("document.querySelector('#want-global-count').textContent")
                        js("document.querySelector('#want-global-more').click()")
                        assert js("document.querySelectorAll('.want-global-row').length")==61
                        assert js("document.querySelector('#want-global-more').hidden") is True
                        query("Brock Bowers")
                        js("""(()=>{let s=document.querySelector('#wantlist-sport');s.value='Baseball';s.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert "0 of 0" in js("document.querySelector('#want-global-count').textContent")
                        js("""(()=>{let s=document.querySelector('#wantlist-sport');s.value='';s.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelectorAll('.want-global-row').length")==2
                        js("""(()=>{let btn=[...document.querySelectorAll('.want-global-row .want-global-open')].find(x=>x.parentElement.parentElement.textContent.includes('#6'));btn.click()})()""")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        assert js("document.querySelector('#wantlist-missing-search').value")=="#6"
                        assert "1 of 1" in js("document.querySelector('#wantlist-missing-status').textContent")
                        assert "Brock Bowers" in js("document.querySelector('#wantlist-missing-list').textContent")
                        js("document.querySelector('#wantlist-close').click()")
                        query("XxNoKnownCard9387")
                        assert js("document.querySelectorAll('.want-global-row').length")==0
                        query("")
                        assert js("document.querySelector('#want-global-results').hidden") is True
                        dimension=js("""(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dimension["inner"]<=width+1 and dimension["scroll"]<=width+1,(width,dimension)
                        assert js("document.querySelectorAll('input[data-feature]').length")==6
                        print("PASS Chrome",width,"cross-set player/# exact/pagination/sport/offer/view-in-set/no overflow")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
