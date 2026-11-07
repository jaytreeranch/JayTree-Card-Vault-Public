"""Real Chrome / Chrome DevTools protocol acceptance for public set completion labels.
Runs only against a local read-only static preview; no private LAN edit or publication.
Requires a local Chrome installation and Python websocket-client.
"""
from __future__ import annotations
import functools,http.server,json,subprocess,tempfile,threading,time,urllib.parse,urllib.request
from pathlib import Path
import websocket

ROOT=Path(__file__).resolve().parent.parent
CHROME=Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
BASE_KEY=["Football","2025","Panini","2025 Panini Absolute - Base Set"]
WRONG_BRAND=["Football","2025","Donruss","2025 Panini Absolute - Base Set"]
CIRCLE_K=["Baseball","1985","Topps","1985 Topps Circle K - Base Set"]

class Quiet(http.server.SimpleHTTPRequestHandler):
    block_checklist=False
    slow_catalog=False
    def do_GET(self):
        file=urllib.parse.urlparse(self.path).path
        if file=="/set-checklists.json" and self.block_checklist:
            self.send_error(503,"Checklist temporarily unavailable")
            return
        if file=="/catalog.json" and self.slow_catalog:
            time.sleep(.35)
        super().do_GET()
    def log_message(self,*args):pass

def browser_scenario(block_checklist=False,slow_catalog=False):
    class Handler(Quiet):
        pass
    Handler.block_checklist=block_checklist
    Handler.slow_catalog=slow_catalog
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix="jt-public-set-fraction-cdp-") as profile:
            proc=subprocess.Popen([str(CHROME),"--headless=new","--disable-gpu","--no-first-run",
                "--disable-extensions","--disable-background-networking",
                "--remote-debugging-port=0","--remote-allow-origins=http://localhost",
                "--user-data-dir="+profile,"about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                port_file=Path(profile)/"DevToolsActivePort"
                for _ in range(120):
                    if port_file.exists():break
                    if proc.poll() is not None:raise RuntimeError("Chrome exited unexpectedly")
                    time.sleep(.1)
                else:raise RuntimeError("Chrome DevTools port did not start")
                port=int(port_file.read_text().splitlines()[0])
                targets=json.loads(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=3).read())
                ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in targets if t["type"]=="page"),timeout=10,origin="http://localhost")
                try:
                    seq=[0]
                    def rpc(method,params=None):
                        seq[0]+=1
                        ident=seq[0]
                        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
                        while True:
                            reply=json.loads(ws.recv())
                            if reply.get("id")==ident:
                                if reply.get("error"):raise AssertionError(reply["error"])
                                return reply.get("result",{})
                    def evaluate(expr):
                        resp=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
                        if resp.get("exceptionDetails"):raise AssertionError(resp["exceptionDetails"])
                        return resp.get("result",{}).get("value")
                    def wait_until(expr):
                        for _ in range(120):
                            result=evaluate(expr)
                            if result:return result
                            time.sleep(.1)
                        raise AssertionError("Timed out waiting for "+expr)
                    rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/"})
                    wait_until("document.querySelector('#stat-count')?.textContent==='1,006'")
                    assert evaluate("document.querySelectorAll('select#set option').length")==49
                    if block_checklist:
                        wait_until("document.querySelector('#wantlist-count')?.textContent==='Checklists unavailable'")
                        assert evaluate("Array.from(document.querySelectorAll('#set option')).slice(1).every(o=>o.textContent.includes('total unknown'))")
                        assert evaluate("document.querySelector('#result-count').textContent").startswith("48 of 1006")
                        print("PASS local Chrome: missing checklist safely degrades without breaking collection")
                        return
                    wait_until("Array.from(document.querySelectorAll('#set option')).some(o=>o.textContent.startsWith('138/200 owned'))")
                    option_labels=evaluate("Array.from(document.querySelectorAll('select#set option')).map(o=>({key:o.value,label:o.textContent}))")
                    option_lookup={x["key"]:x["label"] for x in option_labels}
                    assert option_lookup[json.dumps(BASE_KEY,separators=(",",":"))].startswith("138/200 owned (69%)"),option_lookup
                    assert option_lookup[json.dumps(WRONG_BRAND,separators=(",",":"))].startswith("2 unique / total unknown")
                    assert option_lookup[json.dumps(CIRCLE_K,separators=(",",":"))].startswith("31/33 owned (94%)")
                    known=sum(" owned (" in o["label"] for o in option_labels)
                    unknown=sum("total unknown" in o["label"] for o in option_labels)
                    assert (known,unknown)==(27,21),(known,unknown)
                    # Selecting a sourced set reuses exact checklist data and links to the proper missing cards.
                    def select(key):
                        encoded=json.dumps(key,separators=(",",":"))
                        return evaluate("(()=>{const s=document.querySelector('#set');s.value="+json.dumps(encoded)+";s.dispatchEvent(new Event('change',{bubbles:true}));return {summary:document.querySelector('#set-summary').textContent,link:document.querySelector('#set-summary a')?.getAttribute('href')||null,results:document.querySelector('#result-count').textContent};})()")
                    chosen=select(BASE_KEY)
                    assert "138 / 200 owned (69% complete)" in chosen["summary"],chosen
                    assert "62 missing" in chosen["summary"],chosen
                    assert "245 catalog entries" in chosen["summary"],chosen
                    assert chosen["link"] and chosen["link"].startswith("#want-set="),chosen
                    assert "245 matching cards" in chosen["results"],chosen
                    evaluate("document.querySelector('#set-summary a').click()")
                    wait_until("document.querySelector('#wantlist-dialog')?.open===true")
                    assert "62 missing" in evaluate("document.querySelector('#wantlist-dialog-content').textContent")
                    evaluate("document.querySelector('#wantlist-close').click()")
                    unknown_set=select(WRONG_BRAND)
                    assert "No sourced total checklist yet" in unknown_set["summary"],unknown_set
                    assert "2 distinct numbered entries across 2 catalog entries" in unknown_set["summary"],unknown_set
                    assert unknown_set["link"] is None
                    circle=select(CIRCLE_K)
                    assert "31 / 33 owned (94% complete)" in circle["summary"],circle
                    assert "2 missing" in circle["summary"],circle
                    assert "32 catalog entries" in circle["summary"],circle
                    print("PASS local Chrome: 27 known / 21 unknown sets, 138/200 vs 245, brand isolation, Circle K, live missing-card deep link"+(" (slow-catalog race)" if slow_catalog else ""))
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":
    browser_scenario()
    browser_scenario(block_checklist=True)
    browser_scenario(slow_catalog=True)
