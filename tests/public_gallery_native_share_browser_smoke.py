"""Real Chrome v0.9.19 safe shared public gallery views and copy fallback."""
from pathlib import Path
import functools,http.server,json,subprocess,tempfile,threading,time,urllib.request,urllib.parse
import websocket

ROOT=Path(__file__).resolve().parent.parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix="jt-public-low-data-") as profile:
            proc=subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                "--headless=new","--disable-gpu","--no-first-run","--disable-extensions",
                "--disable-background-networking","--remote-debugging-port=0",
                "--remote-allow-origins=http://localhost","--user-data-dir="+profile,"about:blank"],
                stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                pf=Path(profile)/"DevToolsActivePort"
                for _ in range(120):
                    if pf.exists():break
                    time.sleep(.1)
                else:raise AssertionError("Chrome DevToolsActivePort unavailable")
                port=int(pf.read_text().splitlines()[0])
                tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=4))
                ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in tabs if t["type"]=="page"),
                    timeout=15,origin="http://localhost")
                try:
                    seq=[0]
                    def rpc(method,params=None):
                        seq[0]+=1;ident=seq[0]
                        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
                        while True:
                            obj=json.loads(ws.recv())
                            if obj.get("id")==ident:
                                if "error" in obj:raise AssertionError(obj["error"])
                                return obj.get("result",{})
                    def js(expr):
                        out=rpc("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
                        if out.get("exceptionDetails"):raise AssertionError(out["exceptionDetails"])
                        return out.get("result",{}).get("value")
                    def wait(expr):
                        for _ in range(120):
                            result=js(expr)
                            if result:return result
                            time.sleep(.1)
                        raise AssertionError("Timeout "+expr)
                    rpc("Page.enable")
                    from urllib.parse import unquote,quote,urlsplit
                    for width in (320,390,1366):
                        rpc("Emulation.setDeviceMetricsOverride",
                            {"width":width,"height":850,"mobile":True,"deviceScaleFactor":2})
                        rpc("Page.addScriptToEvaluateOnNewDocument",{"source":"""
                           Object.defineProperty(navigator,'connection',{
                             configurable:true,value:{saveData:true}});
                        """})
                        def navigate(url):
                            rpc("Page.navigate",{"url":"about:blank"})
                            wait("location.href==='about:blank'")
                            rpc("Page.navigate",{"url":url})
                            wait("document.querySelector('#stat-count')?.textContent==='1,006'")
                        base=f"http://127.0.0.1:{server.server_port}/"
                        navigate(base+"#collection")
                        def alter(id,value,kind="input"):
                            js("(()=>{const el=document.getElementById("+json.dumps(id)+
                               ");el.value="+json.dumps(value)+
                               ";el.dispatchEvent(new Event("+json.dumps(kind)+",{bubbles:true}));})()")
                        def mock_clipboard():
                            js("""Object.defineProperty(navigator,'clipboard',{configurable:true,
                              value:{writeText:async text=>{window.__copiedBrowse=text;}}})""")
                        mock_clipboard()
                        js("document.querySelector('#collection-view-link').click()")
                        wait("Boolean(window.__copiedBrowse)")
                        assert js("window.__copiedBrowse").endswith("#collection")
                        assert js("document.querySelector('#gallery-low-data-toggle').checked") is True
                        assert js("document.querySelectorAll('#grid img').length")==0
                        js("window.__copiedBrowse=null")
                        alter("search","Brock Bowers")
                        alter("sport","Football","change")
                        alter("year","2025","change")
                        alter("sort","new","change")
                        js("""(()=>{const c=document.querySelector('input[data-feature][value=rookie]');
                             c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        before=js("document.querySelector('#result-count').textContent")
                        assert "matching cards shown" in before
                        js("document.querySelector('#collection-view-link').click()")
                        wait("Boolean(window.__copiedBrowse)")
                        url=js("window.__copiedBrowse")
                        assert "#browse=" in url,url
                        parts=json.loads(unquote(urlsplit(url).fragment.split("=",1)[1]))
                        assert len(parts)==11 and parts[0]=="jt.public.browse.v1",parts
                        assert parts[1]=="Brock Bowers" and parts[2]=="Football" and parts[4]=="2025"
                        assert parts[8]=="new" and parts[10]==["rookie"],parts
                        assert "gallery-low-data" not in url
                        navigate(url)
                        assert js("document.querySelector('#search').value")=="Brock Bowers"
                        assert js("document.querySelector('#sport').value")=="Football"
                        assert js("document.querySelector('#year').value")=="2025"
                        assert js("document.querySelector('#sort').value")=="new"
                        assert js("document.querySelector('input[data-feature][value=rookie]').checked") is True
                        assert js("document.querySelector('#gallery-low-data-toggle').checked") is True
                        assert js("document.querySelector('#result-count').textContent")==before
                        assert "Opened shared published collection view" in js(
                            "document.querySelector('#collection-view-link-status').textContent")
                        # NEW optional native Web Share: no automatic sending, public filter only.
                        # Chrome versions may expose native Share even in headless mode.
                        js("Object.defineProperty(navigator,'share',{configurable:true,value:undefined})")
                        alter("search","Brock Bowers")
                        assert js("document.querySelector('#collection-native-share').hidden") is True
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                          value:async data=>{window.__sharedGallery=data}})""")
                        alter("search","Brock Bowers")
                        assert js("document.querySelector('#collection-native-share').hidden") is False
                        assert js("document.querySelector('#collection-native-share').disabled") is False
                        count=int(js("document.querySelector('#result-count').textContent.split(' of ')[1].split(' matching')[0]"))
                        js("document.querySelector('#collection-native-share').click()")
                        wait("Boolean(window.__sharedGallery)")
                        shared=js("window.__sharedGallery")
                        assert shared["url"]==url,shared
                        assert shared["title"]=="JayTree Card Vault - collection view"
                        assert str(count)+" matching published card" in shared["text"],shared
                        assert "out of 1,006" in shared["text"]
                        assert "Needs review identifications are provisional" in shared["text"]
                        assert "read-only collection snapshot" in shared["text"]
                        assert "Low-data" not in shared["text"]
                        assert "chosen app controls whether anything was sent" in js(
                            "document.querySelector('#collection-view-link-status').textContent")
                        # The OS/browser decides cancellation or delivery, never this static site.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:()=>Promise.reject(Object.assign(new Error('cancel'),{name:'AbortError'}))})""")
                        js("document.querySelector('#collection-native-share').click()")
                        wait("document.querySelector('#collection-view-link-status').textContent.includes('canceled')")
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:()=>Promise.reject(new Error('unavailable'))})""")
                        js("document.querySelector('#collection-native-share').click()")
                        wait("document.querySelector('#collection-view-link-status').textContent.includes('Device sharing was unavailable')")
                        # Delayed result after filter change must not show a stale success.
                        js("""Object.defineProperty(navigator,'share',{configurable:true,
                            value:()=>new Promise(resolve=>window.__resolveGalleryShare=resolve)})""")
                        js("document.querySelector('#collection-native-share').click()")
                        wait("typeof window.__resolveGalleryShare==='function'")
                        alter("search","Brock")
                        js("window.__resolveGalleryShare()")
                        assert js("document.querySelector('#collection-view-link-status').textContent")==""
                        # Unsafe overlength filter disables native Share; Copy remains a fallback action.
                        alter("search","Z"*101)
                        assert js("document.querySelector('#collection-native-share').disabled") is True
                        assert js("document.querySelector('#collection-view-link').disabled") is False
                        # Absence of API hides Share even on feature-filtered collections.
                        js("Object.defineProperty(navigator,'share',{configurable:true,value:undefined})")
                        alter("search","Brock Bowers")
                        assert js("document.querySelector('#collection-native-share').hidden") is True
                        assert js("document.querySelector('#collection-view-link').disabled") is False
                        # Share a more complex, possibly zero-result set view; all controls must survive.
                        alter("set-finder","Circle K")
                        alter("set-sort","closest","change")
                        keys=js("""[...document.querySelectorAll('#set option')].map(o=>o.value).filter(Boolean)""")
                        assert len(keys)==1,keys
                        chosen=keys[0]
                        alter("set",chosen,"change")
                        alter("review","Verified","change")
                        js("""(()=>{const c=document.querySelector('#offers');
                             c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));})()""")
                        assert js("document.querySelector('#set').value")==chosen
                        mock_clipboard()
                        js("window.__copiedBrowse=null")
                        js("document.querySelector('#collection-view-link').click()")
                        wait("Boolean(window.__copiedBrowse)")
                        complexurl=js("window.__copiedBrowse")
                        complexparts=json.loads(unquote(urlsplit(complexurl).fragment.split("=",1)[1]))
                        assert complexparts[5]==chosen and complexparts[6]=="Circle K"
                        assert complexparts[7]=="closest" and complexparts[9] is True
                        navigate(complexurl)
                        assert js("document.querySelector('#set').value")==chosen
                        assert js("document.querySelector('#set-finder').value")=="Circle K"
                        assert js("document.querySelector('#set-sort').value")=="closest"
                        assert js("document.querySelector('#review').value")=="Verified"
                        assert js("document.querySelector('#offers').checked") is True
                        # Blocked clipboard -> selected readonly input, and changing filters clears it.
                        js("Object.defineProperty(navigator,'clipboard',{configurable:true,value:null})")
                        js("document.querySelector('#collection-view-link').click()")
                        wait("document.querySelector('#collection-view-link-fallback').hidden===false")
                        fallback=js("""(()=>{const x=document.querySelector('#collection-view-link-fallback');
                            return {value:x.value,selected:x.selectionStart===0&&x.selectionEnd===x.value.length,
                              focused:document.activeElement===x,readonly:x.readOnly}})()""")
                        assert fallback["value"]==complexurl and fallback["selected"] and fallback["focused"] and fallback["readonly"],fallback
                        alter("search","New query")
                        assert js("document.querySelector('#collection-view-link-fallback').hidden") is True
                        assert js("document.querySelector('#collection-view-link-status').textContent")==""
                        # Do not announce an outdated link after an asynchronous clipboard resolves.
                        js("""Object.defineProperty(navigator,'clipboard',{configurable:true,
                          value:{writeText:value=>new Promise(resolve=>window.__resolveBrowse=resolve)}})""")
                        js("document.querySelector('#collection-view-link').click()")
                        wait("typeof window.__resolveBrowse==='function'")
                        alter("search","Latest query")
                        js("window.__resolveBrowse()")
                        wait("document.querySelector('#collection-view-link-fallback').hidden===true")
                        assert js("document.querySelector('#collection-view-link-status').textContent")==""
                        # Invalid/stale/malformed share-link values fail closed and don't hide normal catalog.
                        bad=[["old.schema",*parts[1:]],parts[:5]+["unknown-set",*parts[6:]],
                             parts[:1]+["x"*101]+parts[2:],parts[:10]+[["autograph"]],
                             parts[:10]+[["rookie","rookie"]],parts[:2]+["unsupported sport"]+parts[3:]]
                        for item in bad:
                            invalid=base+"#browse="+quote(json.dumps(item,separators=(",",":")),safe="")
                            navigate(invalid)
                            assert js("document.querySelector('#search').value")==""
                            assert js("document.querySelector('#result-count').textContent.includes('1006 in collection')")
                            assert js("document.querySelector('#gallery-low-data-toggle').checked") is True
                        navigate(base+"#browse=%7Binvalid")
                        assert js("document.querySelector('#search').value")==""
                        assert js("document.querySelectorAll('#grid .card').length")==48
                        # Valid in-session hash navigation restores a new view.
                        js("location.hash="+json.dumps(urlsplit(url).fragment))
                        wait("document.querySelector('#search').value==='Brock Bowers'")
                        assert js("document.querySelector('#sport').value")=="Football"
                        dims=js("""(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))()""")
                        assert dims["scroll"]<=width+1,(width,dims)
                        print("PASS Chrome",width,"native gallery Share supported/canceled/error/stale, existing links/filters, no overflow")
                    # No Save-Data on fresh new Chrome page: keep ordinary gallery as default.
                    rpc("Page.addScriptToEvaluateOnNewDocument",{"source":"""
                        Object.defineProperty(navigator,'connection',{
                         configurable:true,value:{saveData:false}});
                    """})
                    rpc("Page.navigate",{"url":"about:blank"})
                    wait("location.href==='about:blank'")
                    rpc("Page.navigate",{"url":f"http://127.0.0.1:{server.server_port}/#collection"})
                    wait("document.querySelector('#stat-count')?.textContent==='1,006'")
                    assert js("document.querySelector('#gallery-low-data-toggle').checked") is False
                    assert js("document.querySelectorAll('#grid img').length")==48
                    print("PASS Chrome normal gallery defaults to visible lazy photos")
                finally:ws.close()
            finally:
                proc.terminate()
                try:proc.wait(timeout=8)
                except subprocess.TimeoutExpired:proc.kill()
    finally:server.shutdown();server.server_close()

if __name__=="__main__":main()
