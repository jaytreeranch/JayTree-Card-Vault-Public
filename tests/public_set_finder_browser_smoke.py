"""Real browser search/sort tests for the public native set picker (local static preview)."""
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
        with tempfile.TemporaryDirectory(prefix="jt-public-set-finder-") as temp:
            chrome=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
            proc=subprocess.Popen([chrome,"--headless=new","--disable-gpu","--no-first-run","--disable-extensions",
              "--disable-background-networking","--remote-debugging-port=0","--remote-allow-origins=http://localhost",
              "--user-data-dir="+temp,"about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                portfile=Path(temp)/"DevToolsActivePort"
                for _ in range(100):
                    if portfile.exists():break
                    if proc.poll() is not None:raise RuntimeError("Chrome unexpectedly exited")
                    time.sleep(.1)
                else:raise RuntimeError("DevTools unavailable")
                port=int(portfile.read_text().splitlines()[0])
                targets=json.loads(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=3).read())
                ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in targets if t["type"]=="page"),timeout=8,origin="http://localhost")
                try:
                    mid=[0]
                    def rpc(method,params=None):
                        mid[0]+=1;ident=mid[0]
                        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
                        while True:
                            data=json.loads(ws.recv())
                            if data.get("id")==ident:
                                if data.get("error"):raise AssertionError(data["error"])
                                return data.get("result",{})
                    def js(expr):
                        v=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
                        if v.get("exceptionDetails"):raise AssertionError(v["exceptionDetails"])
                        return v.get("result",{}).get("value")
                    def wait(expr):
                        for _ in range(120):
                            val=js(expr)
                            if val:return val
                            time.sleep(.1)
                        raise AssertionError("Timed out: "+expr)
                    rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#collection"})
                    wait("document.querySelector('#stat-count')?.textContent==='1,006'")
                    wait("Array.from(document.querySelectorAll('#set option')).some(o=>o.textContent.startsWith('138/200 owned'))")
                    assert js("document.querySelectorAll('#set option').length")==49
                    assert js("document.querySelector('#set-finder-status').textContent.includes('48 cataloged sets')")
                    print("PASS all 48 set choices present, fraction labels remain")
                    js("""(()=>{let i=document.querySelector('#set-finder');i.value='Circle K';i.dispatchEvent(new Event('input'));})()""")
                    assert js("document.querySelectorAll('#set option').length")==2
                    assert js("document.querySelector('#set option:nth-child(2)').textContent.includes('31/33 owned')")
                    assert js("document.querySelector('#set-finder-status').textContent.includes('1 of 48')")
                    print("PASS search Circle K narrows dropdown to one sourced set")
                    js("""(()=>{const s=document.querySelector('#set');s.selectedIndex=1;s.dispatchEvent(new Event('change'));})()""")
                    assert "31 / 33 owned" in js("document.querySelector('#set-summary').textContent")
                    assert "32 matching cards" in js("document.querySelector('#result-count').textContent")
                    print("PASS choosing narrowed set filters collection without losing numbered checklist counts")
                    js("""(()=>{let i=document.querySelector('#set-finder');i.value='Optic';i.dispatchEvent(new Event('input'));})()""")
                    assert js("document.querySelector('#set-finder-status').textContent.includes('current selected set retained')")
                    assert "31 / 33 owned" in js("document.querySelector('#set-summary').textContent")
                    assert js("document.querySelector('#set option:checked').textContent.includes('Circle K')")
                    print("PASS updating search does not reset selected gallery set")
                    js("""(()=>{let i=document.querySelector('#set-finder');i.value='';i.dispatchEvent(new Event('input'));})()""")
                    assert js("document.querySelectorAll('#set option').length")==49
                    js("""(()=>{let s=document.querySelector('#set-sort');s.value='closest';s.dispatchEvent(new Event('change'));})()""")
                    nearest=js("Array.from(document.querySelectorAll('#set option')).slice(1,6).map(o=>o.textContent)")
                    assert all(" owned (" in s for s in nearest),nearest
                    assert js("Array.from(document.querySelectorAll('#set option')).slice(-21).every(o=>o.textContent.includes('total unknown'))")
                    print("PASS fewest-missing sort puts sourced checklists before unknown totals")
                    js("""(()=>{let s=document.querySelector('#set-sort');s.value='percent';s.dispatchEvent(new Event('change'));})()""")
                    pct=js("Array.from(document.querySelectorAll('#set option')).slice(1,6).map(o=>o.textContent)")
                    assert all(" owned (" in s for s in pct),pct
                    js("""(()=>{let s=document.querySelector('#set-sort');s.value='az';s.dispatchEvent(new Event('change'));})()""")
                    names=js("Array.from(document.querySelectorAll('#set option')).slice(1).map(o=>o.textContent.split(' · ').slice(1).join(' · '))")
                    assert all(names[i].casefold()<=names[i+1].casefold() for i in range(len(names)-1)),names[:8]
                    print("PASS completion and alphabetical sorts")
                    assert js("document.querySelector('#set-finder-status a').getAttribute('href')")=="#wantlist"
                    assert js("document.querySelectorAll('input[data-feature]').length")==6
                    print("PASS missing-list link and existing card feature filters retained")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:
        server.shutdown();server.server_close()
if __name__=="__main__":main()
