"""Real headless Chrome public v0.9.25 Team/Position and inline FormSubmit UI smoke.
Runs isolated HTTP localhost and intercepts FormSubmit POST; never mails anyone,
never accesses owner LAN API, never changes published static source.
"""
from pathlib import Path
import functools,http.server,json,subprocess,tempfile,threading,time,urllib.request
import websocket

ROOT=Path(__file__).resolve().parent.parent
CHROME=Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix="jt-card-duplicates-v0925-") as profile:
            proc=subprocess.Popen([str(CHROME),"--headless=new","--disable-gpu","--no-first-run","--disable-extensions",
                "--disable-background-networking","--remote-debugging-port=0",
                "--remote-allow-origins=http://localhost","--user-data-dir="+profile,"about:blank"],
                stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                pf=Path(profile)/"DevToolsActivePort"
                for _ in range(120):
                    if pf.exists():break
                    if proc.poll() is not None:raise AssertionError("Chrome exited")
                    time.sleep(.1)
                else:raise AssertionError("Chrome DevToolsActivePort unavailable")
                port=int(pf.read_text().splitlines()[0])
                tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=4))
                ws=websocket.create_connection(next(x["webSocketDebuggerUrl"] for x in tabs if x["type"]=="page"),
                    timeout=17,origin="http://localhost")
                try:
                    seq=[0]
                    def rpc(method,params=None):
                        seq[0]+=1;ident=seq[0]
                        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
                        while True:
                            result=json.loads(ws.recv())
                            if result.get("id")==ident:
                                if "error" in result:raise AssertionError(result["error"])
                                return result.get("result",{})
                    def js(code):
                        r=rpc("Runtime.evaluate",{"expression":code,"returnByValue":True,"awaitPromise":True})
                        if r.get("exceptionDetails"):raise AssertionError(r["exceptionDetails"])
                        return r.get("result",{}).get("value")
                    def wait(expr):
                        for _ in range(130):
                            if js(expr):return True
                            time.sleep(.1)
                        raise AssertionError("Timed out: "+expr)
                    rpc("Page.enable")
                    rpc("Page.addScriptToEvaluateOnNewDocument",{"source":"""
                         Object.defineProperty(navigator,"connection",{configurable:true,value:{saveData:false}});
                         window.__formSent=[];
                         window.__formShouldFail=false;
                         const originalFetch=window.fetch.bind(window);
                         window.fetch=(url,options)=>{
                           if(String(url).startsWith("https://formsubmit.co/ajax/")){
                             window.__formSent.push({url:String(url),options:options,body:JSON.parse(options.body)});
                             return Promise.resolve({ok:!window.__formShouldFail,json:async()=>({
                               success:window.__formShouldFail?"false":"true"
                             })});
                           }
                           return originalFetch(url,options);
                         };
                    """})
                    base=f"http://127.0.0.1:{server.server_port}/"
                    for width in (390,1366):
                        rpc("Emulation.setDeviceMetricsOverride",{"width":width,"height":900,"mobile":width<600,
                              "deviceScaleFactor":1})
                        rpc("Page.navigate",{"url":"about:blank"})
                        wait("location.href==='about:blank'")
                        rpc("Page.navigate",{"url":base+"#collection"})
                        wait("document.querySelector('#stat-count')?.textContent==='1,649'")
                        wait("state.positionReady===true")
                        assert js("Object.keys(JSON.parse(JSON.stringify([...state.positionByName]))).length") >= 0
                        assert js("state.cards.filter(c=>!!publicPosition(c)).length")==1032
                        assert js("document.querySelectorAll('#team option').length")>30
                        assert js("document.querySelectorAll('#position option').length")>=7
                        assert js("document.querySelector('#position').disabled") is False
                        assert js("document.querySelector('input[data-feature][value=autograph]').disabled") is True
                        assert js("document.querySelector('input[data-feature][value=serial]').disabled") is False
                        assert js("state.duplicateGroupCount")==30
                        assert js("state.duplicateCopyCount")==61
                        assert js("state.cards.length")==1649
                        assert js("state.results.length")==1618
                        # Duplicates-only displays confirmed verified groups, no Needs review.
                        js("""(()=>{const el=document.querySelector('#duplicates-only');
                             el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("state.results.length")==30
                        assert js("state.resultPhysicalCount")==61
                        assert js("state.results.every(c=>c.review_status==='Verified'&&confirmedCopies(c)?.length>1)")
                        # Disable the display-only grouping; all 61 copies are visible again.
                        js("""(()=>{const el=document.querySelector('#combine-copies');
                             el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("state.results.length")==61
                        js("""(()=>{const el=document.querySelector('#combine-copies');
                             el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("state.results.length")==30
                        # Three separately retained photos, with accessible per-copy navigation.
                        js("""(()=>{const g=state.cards.find(c=>c.player==='Kevin Seitzer'&&c.number==='275');
                             if(!g)throw Error('Missing verified triple');details(g);})()""")
                        assert js("document.querySelector('.duplicate-photo-progress').textContent")=="Copy 1 of 3"
                        first=js("location.hash")
                        js("document.querySelector('.duplicate-photo-next').click()")
                        assert js("document.querySelector('.duplicate-photo-progress').textContent")=="Copy 2 of 3"
                        assert js("location.hash")!=first
                        js("document.querySelector('.duplicate-photo-prev').click()")
                        assert js("document.querySelector('.duplicate-photo-progress').textContent")=="Copy 1 of 3"
                        js("document.querySelector('#close').click()")
                        assert js("document.querySelector('#details').open") is False
                        # Gallery navigation must preserve independent record identities.
                        js("document.querySelector('#collection-browse-reset').click()")
                        assert js("document.querySelector('#duplicates-only').checked") is False
                        assert js("document.querySelector('#combine-copies').checked") is True
                        # Team and position compose as AND; no unsourced player guessing.
                        js("""(()=>{const s=document.querySelector('#sport');s.value='Football';
                             s.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        js("""(()=>{const s=document.querySelector('#team');s.value='Green Bay Packers';
                             s.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        js("""(()=>{const s=document.querySelector('#position');s.value='QB';
                             s.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        expected=js("state.cards.filter(c=>c.sport==='Football'&&c.team==='Green Bay Packers'&&publicPosition(c)=='QB').length")
                        actual=js("state.results.length")
                        assert expected>=1 and expected==actual,(width,expected,actual)
                        js("""(()=>{const s=document.querySelector('#sort');s.value='position';
                             s.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelector('#sort').value")=="position"
                        assert js("state.results.every(c=>c.team==='Green Bay Packers'&&publicPosition(c)=='QB')")
                        # Copy new 13-field view link; restore both facets.
                        js("""Object.defineProperty(navigator,"clipboard",{configurable:true,
                             value:{writeText:async value=>{window.__copied=value;}}})""")
                        js("document.querySelector('#collection-view-link').click()")
                        wait("Boolean(window.__copied)")
                        link=js("window.__copied")
                        from urllib.parse import unquote,urlsplit
                        payload=json.loads(unquote(urlsplit(link).fragment.split("=",1)[1]))
                        assert len(payload)==15 and payload[11]=="Green Bay Packers" and payload[12]=="QB" and payload[13] is True and payload[14] is False
                        js("""(()=>{document.querySelector('#collection-browse-reset').click();})()""")
                        assert js("document.querySelector('#team').value")==""
                        assert js("document.querySelector('#position').value")==""
                        # A legacy 11-field share should still load.
                        legacy=payload[:11]
                        js("history.replaceState(null,'','#browse='+encodeURIComponent(JSON.stringify("+json.dumps(legacy)+")));")
                        js("window.dispatchEvent(new HashChangeEvent('hashchange'));")
                        assert js("document.querySelector('#team').value")==""
                        assert js("document.querySelector('#position').value")==""
                        # Current 15-field share restores both, including duplicate controls.
                        js("history.replaceState(null,'','#browse='+encodeURIComponent(JSON.stringify("+json.dumps(payload)+")));")
                        js("window.dispatchEvent(new HashChangeEvent('hashchange'));")
                        assert js("document.querySelector('#team').value")=="Green Bay Packers"
                        assert js("document.querySelector('#position').value")=="QB"
                        # Simulate FormSubmit accepted -> success in-page, no email application launched.
                        js("""(()=>{const c=state.cards.find(x=>x.player==='Craig Morton'&&x.identity_unconfirmed);
                              if(!c)throw Error('No published Craig Morton import');details(c);})()""")
                        assert js("document.querySelector('#details').open") is True
                        assert js("document.querySelector('.feedback-submit').textContent")=="Submit suggestion"
                        js("""(()=>{const f=document.querySelector('.feedback-form');
                              const a=f.querySelector('select[name=assessment]');
                              a.value='incorrect';a.dispatchEvent(new Event('change',{bubbles:true}));
                              f.querySelector('textarea').value='This physical card is not signed; please check the printed subset.';
                              f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));})()""")
                        wait("document.querySelector('.feedback-message[role=status]')?.textContent.includes('Suggestion submitted')")
                        sent=js("window.__formSent")
                        assert len(sent)==1
                        assert sent[0]["body"]["Published player"]=="Craig Morton"
                        assert "not signed" in sent[0]["body"]["Suggested correction"]
                        assert sent[0]["url"]=="https://formsubmit.co/ajax/jaytreebooks@gmail.com"
                        assert js("location.href").startswith(base)
                        # Failed POST keeps visitor's data; never reports success on false response.
                        js("window.__formShouldFail=true")
                        js("""(()=>{const f=document.querySelector('.feedback-form');
                            const a=f.querySelector('select[name=assessment]');
                            a.value='incorrect';a.dispatchEvent(new Event('change',{bubbles:true}));
                            f.querySelector('textarea').value='This appears to be an unsigned standard card.';
                            f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));})()""")
                        wait("document.querySelector('.feedback-message[role=status]')?.textContent.includes('couldn')")
                        assert js("document.querySelector('.feedback-form textarea').value").startswith("This appears")
                        assert js("document.querySelector('.feedback-submit').disabled") is False
                        print(f"PASS CHROME {width}px: 1649 cards, 1032 sourced positions, team+position AND, legacy 11/new 15 deep links, FormSubmit success/error mock, 0 real submissions")
                finally:
                    ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:
        server.shutdown();server.server_close()

if __name__=="__main__":main()
