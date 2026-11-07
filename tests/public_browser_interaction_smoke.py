"""Optional real Chrome UI smoke for the public gallery.
Requires Python websocket-client and a local Chrome installation. No network publishing."""
from pathlib import Path
from contextlib import contextmanager
import functools,http.server,json,subprocess,tempfile,threading,time,urllib.request
import websocket

ROOT=Path(__file__).resolve().parent.parent
CHROME=Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def run():
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    try:
        with tempfile.TemporaryDirectory(prefix="jt-pub-cdp-") as profile:
            proc=subprocess.Popen([str(CHROME),"--headless=new","--disable-gpu","--no-first-run","--disable-extensions","--disable-background-networking","--remote-debugging-port=0","--remote-allow-origins=http://localhost","--user-data-dir="+profile,"about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                portfile=Path(profile)/"DevToolsActivePort"
                for _ in range(80):
                    if portfile.exists():break
                    if proc.poll() is not None:raise RuntimeError("Chrome exited early")
                    time.sleep(.1)
                else:raise RuntimeError("Chrome debugging port did not start")
                port=int(portfile.read_text().splitlines()[0])
                tabs=json.loads(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=3).read())
                tab=next(x for x in tabs if x["type"]=="page")
                ws=websocket.create_connection(tab["webSocketDebuggerUrl"],timeout=8,origin="http://localhost")
                try:
                    seq=[0]
                    def rpc(method,params=None):
                        seq[0]+=1;rid=seq[0]
                        ws.send(json.dumps({"id":rid,"method":method,"params":params or {}}))
                        for _ in range(200):
                            v=json.loads(ws.recv())
                            if v.get("id")==rid:
                                if "error" in v:raise AssertionError(v["error"])
                                return v.get("result",{})
                        raise TimeoutError(method)
                    def js(expr):
                        res=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
                        if "exceptionDetails" in res:raise AssertionError(res["exceptionDetails"])
                        return res.get("result",{}).get("value")
                    rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/"})
                    for _ in range(80):
                        if js("document.getElementById('stat-count')?.textContent")== "1,006" and js("document.querySelectorAll('.want-set-card').length")==27:break
                        time.sleep(.1)
                    else:raise AssertionError("UI did not load")
                    assert js("document.querySelectorAll('input[data-feature]').length")==6
                    assert js("document.querySelector('input[data-feature][value=autograph]').disabled") is True
                    assert js("document.querySelector('input[data-feature][value=serial]').disabled") is False
                    assert js("document.querySelector('#result-count').textContent").startswith("48 of 1006")
                    js("document.querySelector('input[data-feature][value=serial]').click()")
                    assert js("document.querySelector('#result-count').textContent").startswith("1 of 1")
                    js("document.querySelector('#grid .card button').click()")
                    assert js("document.querySelector('#details').open") is True
                    assert js("document.querySelector('#detail-content').textContent.includes('Serial edition/325')") is True
                    assert js("document.querySelector('#detail-content').textContent.includes('Owned stamped copyNot published')") is True
                    js("document.querySelector('#close').click()")
                    js("document.querySelector('input[data-feature][value=parallel]').click()")
                    assert js("document.querySelector('#result-count').textContent").startswith("26 of 26")
                    js("document.querySelector('#feature-clear').click()")
                    assert js("document.querySelector('#result-count').textContent").startswith("48 of 1006")
                    # Confirm existing year filter and new checkboxes compose as AND of groups.
                    js("document.querySelector('#year').value='1988';document.querySelector('#year').dispatchEvent(new Event('change'))")
                    year_total=js("document.querySelector('#result-count').textContent")
                    assert "249 matching cards" in year_total,year_total
                    js("document.querySelector('input[data-feature][value=parallel]').click()")
                    assert js("document.querySelector('#result-count').textContent").startswith("0 of 0")
                    js("document.querySelector('#year').value='';document.querySelector('#year').dispatchEvent(new Event('change'))")
                    assert js("document.querySelector('#result-count').textContent").startswith("26 of 26")
                    js("document.querySelector('#feature-clear').click()")
                    # Open missing card list without altering main collection.
                    js("document.querySelector('.want-set-open').click()")
                    assert js("document.querySelector('#wantlist-dialog').open") is True
                    assert js("document.querySelector('.want-share-link').textContent").startswith("Copy a link")
                    print("PASS Chrome real interaction: initial load, 6 controls, unavailable categories, single + OR filters, clear, year composition, modal")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:
        server.shutdown();server.server_close()

if __name__=="__main__":run()
