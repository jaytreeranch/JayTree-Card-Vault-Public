"""Real browser CSV download and source integrity for each sourced public missing checklist."""
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
                    download_dir=Path(profile)/"csv_downloads";download_dir.mkdir()
                    rpc("Browser.setDownloadBehavior",{"behavior":"allow","downloadPath":str(download_dir)})
                    def capture_csv():
                        import csv,io
                        for _ in range(130):
                            ready=[f for f in download_dir.glob("*.csv") if f.stat().st_size>0]
                            if ready:
                                f=ready[0]
                                try:
                                    raw=f.read_text(encoding="utf-8-sig")
                                    rows=list(csv.DictReader(io.StringIO(raw)))
                                    return f,rows,raw
                                except (PermissionError,csv.Error,UnicodeDecodeError):pass
                            time.sleep(.1)
                        raise AssertionError("Missing CSV download after visitor click")
                    def clear_csv():
                        for f in download_dir.iterdir():
                            if f.is_file():f.unlink()
                    for width in (320,390,1366):
                        rpc("Emulation.setDeviceMetricsOverride",
                            {"width":width,"height":844,"mobile":True,"deviceScaleFactor":2})
                        rpc("Page.navigate",{"url":"about:blank"})
                        wait("location.href==='about:blank'")
                        rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#wantlist"})
                        wait("document.querySelectorAll('.want-set-card').length===27")
                        # Circle K: two real published missing numbered slots, neither independently named.
                        js("""(()=>{let row=[...document.querySelectorAll('.want-set-card')].find(x=>x.textContent.includes('Circle K'));
                             row.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        assert "2 matching missing cards" in js("document.querySelector('#wantlist-export-csv').textContent")
                        js("document.querySelector('#wantlist-export-csv').click()")
                        f,rows,raw=capture_csv()
                        assert f.name.startswith("JayTree_Missing_1985_"),f.name
                        assert len(rows)==2,rows
                        assert {x["Printed number"] for x in rows}=={"2","6"},rows
                        assert all(x["Published player reference"]=="" for x in rows)
                        assert all("not independently named" in x["Identity caution"] for x in rows)
                        assert all("#want-card=" in x["Public missing card link"] for x in rows)
                        assert raw.startswith('"Sport","Year","Brand","Set"'),raw[:90]
                        assert "Prepared 2 missing numbered cards" in js("document.querySelector('#wantlist-export-status').textContent")
                        clear_csv()
                        js("""(()=>{let f=document.querySelector('#wantlist-missing-search');
                             f.value='#6';f.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        assert "1 matching missing card" in js("document.querySelector('#wantlist-export-csv').textContent")
                        js("document.querySelector('#wantlist-export-csv').click()")
                        _,rows,_=capture_csv()
                        assert len(rows)==1 and rows[0]["Printed number"]=="6",rows
                        clear_csv()
                        js("""(()=>{let f=document.querySelector('#wantlist-missing-search');
                             f.value='__no_matching_card__';f.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        assert js("document.querySelector('#wantlist-export-csv').disabled") is True
                        js("document.querySelector('#wantlist-close').click()")
                        # Large sourced set: export every 1991 Upper Deck missing number, not just the first 40 visible.
                        js("""(()=>{let row=[...document.querySelectorAll('.want-set-card')].find(x=>
                             x.textContent.includes('1991 Upper Deck - Base Set'));
                             row.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-missing-list').children.length")==40
                        assert "785 matching missing cards" in js("document.querySelector('#wantlist-export-csv').textContent")
                        js("document.querySelector('#wantlist-export-csv').click()")
                        _,rows,_=capture_csv()
                        assert len(rows)==785,len(rows)
                        assert len({x["Printed number"] for x in rows})==785
                        assert all(x["Sport"]=="Baseball" and x["Year"]=="1991" for x in rows)
                        assert all("Upper Deck" in x["Set"] for x in rows)
                        assert all(x["Public checklist source"].startswith("https://") for x in rows)
                        clear_csv()
                        dims=js("""(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"download real CSV 2/1/785 numbered missing slots, no guessed names or 40-row cap")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
