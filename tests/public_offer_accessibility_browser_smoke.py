"""Real browser QC for public read-only visitor inquiry builder; no submissions."""
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
                            if out.get("method")=="Runtime.exceptionThrown":
                                print("CHROME_JS_EXCEPTION",json.dumps(out.get("params"),ensure_ascii=False)[:2200])
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
                        rpc("Runtime.enable")
                        rpc("Page.addScriptToEvaluateOnNewDocument",{"source":"""
                            window.__pageErrors=[];
                            window.addEventListener('error',e=>window.__pageErrors.push(String(e.message)+' '+String(e.filename)+':'+e.lineno));
                            window.addEventListener('unhandledrejection',e=>window.__pageErrors.push('REJECTION '+String(e.reason)));
                        """})
                        rpc("Page.navigate",{"url":"about:blank"})
                        wait("location.href==='about:blank'")
                        rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#wantlist"})
                        try:
                            wait("document.querySelectorAll('.want-set-card').length===27")
                        except AssertionError:
                            print("DIAGNOSTIC",js("""(()=>({ready:document.readyState,href:location.href,
                              intro:document.querySelector('#wantlist-intro')?.textContent,
                              count:document.querySelectorAll('.want-set-card').length,
                              offer:!!document.querySelector('#offer-dialog'),
                              scripts:[...document.scripts].map(s=>s.src),
                              errors:window.__pageErrors,
                              ids:["offer-form","offer-dialog","offer-condition","offer-variation","offer-asking-price","offer-photo-url","offer-note","offer-public-ok","offer-email-out","offer-github-out","wantlist-sets"].map(id=>[id,!!document.getElementById(id)])

                            }))()"""))
                            raise
                        try:
                            wait("document.querySelectorAll('.coverage-card').length===21")
                        except AssertionError:
                            print("COVERAGE_DIAG",js("""(()=>({cards:document.querySelectorAll('.coverage-card').length,
                              stat:document.querySelector('#stat-count')?.textContent,
                              coverage:document.querySelector('#coverage-status')?.textContent,
                              errors:window.__pageErrors||null
                            }))()"""))
                            raise
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
                        # v0.9.11: inquiry fields are prepared locally before external drafts.
                        query("Brock Bowers")
                        assert js("document.querySelectorAll('.want-global-row').length")==2
                        js("document.querySelector('.want-global-row .want-offer-link').click()")
                        assert js("document.querySelector('#offer-dialog').open") is True
                        assert "Brock Bowers" in js("document.querySelector('#offer-card-heading').textContent")
                        assert js("document.activeElement.id")=="offer-condition"
                        assert js("document.querySelector('#offer-github-out').hasAttribute('href')") is False
                        assert js("document.querySelector('#offer-email-out').href.startsWith('mailto:')") is True
                        def fill(element,value):
                            js("(()=>{const x=document.querySelector("+json.dumps(element)+
                               ");x.value="+json.dumps(value)+
                               ";x.dispatchEvent(new Event('input',{bubbles:true}));})()")
                        fill("#offer-condition","Excellent")
                        fill("#offer-variation","Silver parallel")
                        fill("#offer-asking-price","$15 plus shipping")
                        fill("#offer-note","See printed number on back")
                        fill("#offer-photo-url","javascript:alert(1)")
                        assert js("document.querySelector('#offer-photo-url').validity.valid") is False
                        assert js("document.querySelector('#offer-email-out').hasAttribute('href')") is False
                        assert js("document.querySelector('#offer-github-out').hasAttribute('href')") is False
                        fill("#offer-photo-url","https://192.168.12.113/private-photo.jpg")
                        assert js("document.querySelector('#offer-photo-url').validity.valid") is False
                        assert js("document.querySelector('#offer-email-out').hasAttribute('href')") is False
                        fill("#offer-photo-url","https://example.org/card-front.jpg")
                        assert js("document.querySelector('#offer-email-out').hasAttribute('href')") is True
                        assert js("document.querySelector('#offer-github-out').hasAttribute('href')") is False
                        js("""(()=>{let c=document.querySelector('#offer-public-ok');c.checked=true;
                         c.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        url=js("document.querySelector('#offer-github-out').href")
                        from urllib.parse import urlparse,parse_qs,unquote
                        params=parse_qs(urlparse(url).query)
                        assert params["template"]==["missing-card-offer.yml"],params
                        assert params["condition"]==["Excellent"]
                        assert params["variation"]==["Silver parallel"]
                        assert params["asking-price"]==["$15 plus shipping"]
                        assert params["photo-url"]==["https://example.org/card-front.jpg"]
                        assert "See printed number on back" in params["offer-details"][0]
                        assert "Brock Bowers" in params["card-name"][0]
                        assert "#want-card=" in params["set-link"][0]
                        mailto=js("document.querySelector('#offer-email-out').href")
                        assert "Silver parallel" in unquote(mailto)
                        assert "$15 plus shipping" in unquote(mailto)
                        assert "https://example.org/card-front.jpg" in unquote(mailto)
                        assert "Brock Bowers" in unquote(mailto)
                        js("document.querySelector('#offer-close').click()")
                        assert js("document.querySelector('#offer-dialog').open") is False
                        wait("document.querySelector('#offer-github-out').hasAttribute('href')===false")
                        # v0.9.12 keyboard and screen-reader-facing semantics, after close/reset.
                        query("Brock Bowers")
                        js("document.querySelector('.want-global-row .want-offer-link').click()")
                        assert js("document.querySelector('#offer-dialog').open") is True
                        assert js("document.activeElement.id")=="offer-condition"
                        assert js("document.querySelector('#offer-github-out').getAttribute('aria-disabled')")=="true"
                        assert js("document.querySelector('#offer-github-out').tabIndex")==0
                        # Chrome accessibility tree should expose a named, described link even when disabled.
                        ax=rpc("Accessibility.getFullAXTree",{})["nodes"]
                        labels=[(n.get("role",{}).get("value"),n.get("name",{}).get("value"),
                                 n.get("description",{}).get("value","")) for n in ax]
                        assert any(role=="link" and name=="Continue on GitHub" and desc
                                   for role,name,desc in labels),labels[:25]
                        assert any(role=="link" and name=="Create email draft" and desc
                                   for role,name,desc in labels)
                        visited=[]
                        for _ in range(18):
                            rpc("Input.dispatchKeyEvent",{"type":"keyDown","key":"Tab","code":"Tab","windowsVirtualKeyCode":9})
                            rpc("Input.dispatchKeyEvent",{"type":"keyUp","key":"Tab","code":"Tab","windowsVirtualKeyCode":9})
                            visited.append(js("document.activeElement.id"))
                        assert "offer-github-out" in visited,visited
                        assert "offer-email-out" in visited,visited
                        fill("#offer-photo-url","https://192.168.12.113/private.jpg")
                        assert js("document.querySelector('#offer-photo-url').getAttribute('aria-invalid')")=="true"
                        assert js("document.querySelector('#offer-github-help').textContent").startswith("Unavailable")
                        assert js("document.querySelector('#offer-email-out').getAttribute('aria-disabled')")=="true"
                        fill("#offer-photo-url","https://example.org/photo.jpg")
                        assert js("document.querySelector('#offer-photo-url').getAttribute('aria-invalid')")=="false"
                        assert js("document.querySelector('#offer-email-out').getAttribute('aria-disabled')")=="false"
                        assert "Check the public-issue notice" in js("document.querySelector('#offer-github-help').textContent")
                        js("document.querySelector('#offer-close').click()")
                        wait("document.querySelector('#offer-dialog').open===false")
                        # Existing set modal must remain usable beneath the optional second dialog.
                        js("""(()=>{let b=[...document.querySelectorAll('.want-global-open')].find(
                         x=>x.parentElement.parentElement.textContent.includes('#6'));b.click()})()""")
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        js("document.querySelector('#wantlist-missing-list .want-offer-link').click()")
                        assert js("document.querySelector('#offer-dialog').open") is True
                        assert js("document.querySelector('#wantlist-dialog').open") is True
                        assert "#6" in js("document.querySelector('#offer-card-heading').textContent")
                        js("document.querySelector('#offer-close').click()")
                        js("document.querySelector('#wantlist-close').click()")
                        dimension=js("""(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dimension["inner"]<=width+1 and dimension["scroll"]<=width+1,(width,dimension)
                        assert js("document.querySelectorAll('input[data-feature]').length")==6
                        print("PASS Chrome",width,"keyboard AX names/help, disabled links, invalid aria, reset, inquiry, no overflow")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
