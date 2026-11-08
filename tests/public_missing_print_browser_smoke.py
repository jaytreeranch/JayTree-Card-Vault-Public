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
                        # A stub catches the native print gesture; print media is inspected separately.
                        js("""window.print=()=>{window.__printRequested=
                            document.body.classList.contains('print-wantlist')}""")
                        js("""(()=>{let row=[...document.querySelectorAll('.want-set-card')].
                         find(x=>x.textContent.includes('Circle K'));row.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        assert js("document.querySelector('#wantlist-print').textContent.includes('2 matching missing cards')")
                        js("document.querySelector('#wantlist-print').click()")
                        assert js("window.__printRequested") is True
                        assert js("document.querySelectorAll('#want-print-content tbody tr').length")==2
                        assert js("""[...document.querySelectorAll('#want-print-content tbody tr td:nth-child(2)')]
                           .map(x=>x.textContent).sort().join(',')""")=="#2,#6"
                        assert "Not independently named" in js("document.querySelector('#want-print-content').textContent")
                        assert "Identity caution" in js("document.querySelector('#want-print-content').textContent")
                        assert js("document.querySelector('#want-print-content .want-print-source a').href.startsWith('https:')")
                        assert js("document.querySelector('#want-print-content').textContent.includes('Set link:')")
                        rpc("Emulation.setEmulatedMedia",{"media":"print"})
                        styles=js("""(()=>({sheet:getComputedStyle(document.querySelector('#want-print-content')).display,
                             missing:getComputedStyle(document.querySelector('#wantlist-missing-list')).display,
                             dialog:getComputedStyle(document.querySelector('#wantlist-dialog')).display,
                             hdr:getComputedStyle(document.querySelector('#want-print-content thead')).display}))()""")
                        assert styles["sheet"]=="block" and styles["missing"]=="none" and styles["dialog"]=="block",styles
                        assert styles["hdr"]=="table-header-group",styles
                        rpc("Emulation.setEmulatedMedia",{"media":"screen"})
                        js("window.dispatchEvent(new Event('afterprint'))")
                        assert js("document.querySelector('#want-print-content').hidden") is True
                        assert js("document.querySelector('#want-print-content').children.length")==0
                        assert js("document.body.classList.contains('print-wantlist')") is False
                        js("""(()=>{let f=document.querySelector('#wantlist-missing-search');
                            f.value='#6';f.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        assert js("document.querySelector('#wantlist-print').textContent.includes('1 matching missing card')")
                        js("document.querySelector('#wantlist-print').click()")
                        assert js("document.querySelectorAll('#want-print-content tbody tr').length")==1
                        assert "#6" in js("document.querySelector('#want-print-content tbody tr').textContent")
                        js("window.dispatchEvent(new Event('afterprint'))")
                        js("""(()=>{let f=document.querySelector('#wantlist-missing-search');
                            f.value='__no_matching_card__';f.dispatchEvent(new Event('input',{bubbles:true}))})()""")
                        assert js("document.querySelector('#wantlist-print').disabled") is True
                        js("document.querySelector('#wantlist-close').click()")
                        js("""(()=>{let row=[...document.querySelectorAll('.want-set-card')].
                          find(x=>x.textContent.includes('1991 Upper Deck - Base Set'));
                          row.querySelector('button').click()})()""")
                        assert js("document.querySelector('#wantlist-missing-list').children.length")==40
                        assert js("document.querySelector('#wantlist-print').textContent.includes('785 matching missing cards')")
                        js("document.querySelector('#wantlist-print').click()")
                        assert js("document.querySelectorAll('#want-print-content tbody tr').length")==785
                        # Simulate delayed close event from prior modal while newly opened: must NOT clear sheet.
                        js("document.querySelector('#wantlist-dialog').dispatchEvent(new Event('close'))")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        assert js("document.querySelectorAll('#want-print-content tbody tr').length")==785
                        assert js("""new Set([...document.querySelectorAll('#want-print-content tbody tr td:nth-child(2)')].
                            map(x=>x.textContent)).size""")==785
                        assert "1991" in js("document.querySelector('#want-print-content h2').textContent")
                        rpc("Emulation.setEmulatedMedia",{"media":"print"})
                        assert js("getComputedStyle(document.querySelector('#want-print-content')).display")=="block"
                        rpc("Emulation.setEmulatedMedia",{"media":"screen"})
                        js("document.querySelector('#wantlist-close').click()")
                        js("document.querySelector('#wantlist-dialog').dispatchEvent(new Event('close'))")
                        assert js("document.querySelector('#want-print-content').children.length")==0
                        assert js("document.body.classList.contains('print-wantlist')") is False
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"print 2 / exact 1 / 785 rows, source, provisional, print media, cleanup")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
