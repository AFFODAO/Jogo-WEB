"""Native Chrome input and a gallery of all 40 code-drawn equipment scenes."""
import base64, functools, http.server, json, subprocess, tempfile, threading, time
from pathlib import Path
from chrome_cdp import CDP, page_endpoint, close_chrome

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/repairs-v2-gallery'

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
    def do_GET(self):
        if self.path.split('?')[0]=='/tests/repair-lab.js':
            source=(ROOT/'tests/repair-lab.js').read_text(encoding='utf-8')
            source=source.replace('panel.dataset.repairType=spec.type;','window.__labSession=session;panel.dataset.repairType=spec.type;')
            data=source.encode('utf-8');self.send_response(200);self.send_header('Content-Type','text/javascript; charset=utf-8');self.end_headers();self.wfile.write(data);return
        super().do_GET()

def main():
    OUTPUT.mkdir(exist_ok=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    process=None;cdp=None
    with tempfile.TemporaryDirectory(prefix='byte-repairs-v2-ui-',ignore_cleanup_errors=True) as folder:
        try:
            profile=Path(folder)/'chrome'
            process=subprocess.Popen(['C:/Program Files/Google/Chrome/Application/chrome.exe','--headless','--disable-gpu','--no-first-run','--remote-debugging-port=0',f'--user-data-dir={profile}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            deadline=time.monotonic()+20
            while not (profile/'DevToolsActivePort').exists():
                if time.monotonic()>deadline:raise TimeoutError('Chrome startup')
                time.sleep(.05)
            cdp=CDP(page_endpoint(int((profile/'DevToolsActivePort').read_text().splitlines()[0])))
            def evaluate(js):return cdp.evaluate(js)
            cdp.call('Page.enable')
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1280,'height':1000,'deviceScaleFactor':1,'mobile':False})
            url=f'http://127.0.0.1:{server.server_port}/tests/minigames.html'
            cdp.call('Page.navigate',{'url':url})
            deadline=time.monotonic()+25
            while not evaluate('Boolean(window.__labSession)'):
                if time.monotonic()>deadline:raise TimeoutError('Laboratory did not load')
                time.sleep(.05)
            evaluate("window.__beforeStorage=JSON.stringify(Object.entries(localStorage).sort())")
            entries=evaluate("""(()=>{const rows=[];for(let phase=0;phase<10;phase++){
              const p=document.getElementById('phase');p.value=phase;p.dispatchEvent(new Event('change'));
              for(const o of document.getElementById('component').options)rows.push({phase,id:o.value});}
              return rows;})()""")
            gallery=[];seen=set()
            def choose(phase,cid):
                evaluate("""(()=>{const p=document.getElementById('phase');p.value=%s;p.dispatchEvent(new Event('change'));
                  const c=document.getElementById('component');c.value=%s;c.dispatchEvent(new Event('change'));})()"""%(phase,json.dumps(cid)))
            for row in entries:
                choose(row['phase'],row['id'])
                kind=evaluate('document.getElementById("repairPanel").dataset.repairType')
                if kind in seen:continue
                seen.add(kind)
                data=evaluate('document.querySelector(".repair-v2-canvas").toDataURL().split(",")[1]')
                filename=kind+'.png';(OUTPUT/filename).write_bytes(base64.b64decode(data))
                gallery.append({'id':kind,'name':evaluate('__labSession.label()'),'file':filename})
            assert len(seen)==40,len(seen)
            geometry=[]
            for width,height in [(1280,1000),(390,844),(844,390)]:
                cdp.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':False})
                for row in entries:
                    choose(row['phase'],row['id'])
                    # Browser layout and resize observers run before evaluating native geometry.
                    measure=evaluate("""(()=>{const stage=document.querySelector('.repair-scene-stage');
                      const r=stage.getBoundingClientRect();const controls=[...stage.querySelectorAll('button')];
                      return {overflow:document.documentElement.scrollWidth>innerWidth+1,minTarget:Math.min(...controls.map(b=>Math.min(b.getBoundingClientRect().width,b.getBoundingClientRect().height))),width:r.width};})()""")
                    assert not measure['overflow'],(row,width,measure)
                    assert measure['minTarget']>=44,(row,width,measure)
                geometry.append({'width':width,'height':height,'components':len(entries)})
            # A real native mouse inserts a DIMM; no synthetic capture registration.
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1280,'height':1000,'deviceScaleFactor':1,'mobile':False})
            choose(0,'ram-base:ram-relay')
            def point(selector):
                return evaluate("""(()=>{const b=document.querySelector(%s);const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()"""%json.dumps(selector))
            def mouse(kind,p):cdp.call('Input.dispatchMouseEvent',{'type':kind,**p,'button':'left','buttons':0 if kind=='mouseReleased' else 1,'clickCount':1})
            slot=evaluate('__labSession.model.slotTypes.indexOf(0)')
            p=point('[data-control="ram0"]');q=point(f'[data-control="dimm-slot{slot}"]')
            mouse('mousePressed',p);mouse('mouseMoved',{'x':p['x']+12,'y':p['y']+10});mouse('mouseMoved',q);mouse('mouseReleased',q)
            assert evaluate('__labSession.model.slots.includes(0)'),'native DIMM insertion failed'
            # Repeat using actual emulated touch at mobile width.
            choose(0,'ram-base:ram-relay')
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':2,'mobile':True})
            cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':True})
            def touch(kind,p=None):cdp.call('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if p is None else [p]})
            slot=evaluate('__labSession.model.slotTypes.indexOf(0)')
            p=point('[data-control="ram0"]');q=point(f'[data-control="dimm-slot{slot}"]')
            touch('touchStart',p);touch('touchMove',{'x':p['x']+10,'y':p['y']+10});touch('touchMove',q);touch('touchEnd')
            assert evaluate('__labSession.model.slots.includes(0)'),'native touch insertion failed'
            cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':False})
            choose(0,'bus-west:bus-relay')
            evaluate('document.querySelector("[data-control=cpu]").focus()')
            before=evaluate('__labSession.model.orientation')
            for kind in ['keyDown','keyUp']:cdp.call('Input.dispatchKeyEvent',{'type':kind,'key':'ArrowRight','code':'ArrowRight','windowsVirtualKeyCode':39})
            assert evaluate('__labSession.model.orientation')==(before+1)%4,'native keyboard rotation failed'
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1280,'height':1000,'deviceScaleFactor':1,'mobile':False})
            choose(2,'port04:connector')
            p=point('[data-control="lead0"][data-target="false"]');q=point('[data-control="lead0"][data-target="true"]')
            mouse('mousePressed',p);mouse('mouseMoved',{'x':p['x']+40,'y':p['y']+20});mouse('mouseMoved',q);mouse('mouseReleased',q)
            assert evaluate('__labSession.model.links[0]>=0'),'native cable connection failed'
            choose(7,'com-records:records')
            bounds=evaluate("document.querySelector('.repair-scene-stage').getBoundingClientRect().toJSON()")
            points=evaluate('__labSession.model.points')
            def screen(p):return {'x':bounds['x']+p[0]*bounds['width']/640,'y':bounds['y']+p[1]*bounds['height']/560}
            mouse('mousePressed',screen(points[0]))
            for a,b in zip(points,points[1:]):
                for step in range(1,21):mouse('mouseMoved',screen([a[0]+(b[0]-a[0])*step/20,a[1]+(b[1]-a[1])*step/20]))
            mouse('mouseReleased',screen(points[-1]))
            assert evaluate('__labSession.model.stroke')==6,'native stencil trace failed'
            assert evaluate('JSON.stringify(Object.entries(localStorage).sort())===window.__beforeStorage'),'laboratory changed save'
            result={'concepts':len(gallery),'components':len(entries),'geometry':geometry,'nativeMouseInsertion':True,'emulatedTouchInsertion':True,'nativeKeyboardRotation':True,'nativeCableConnection':True,'nativeStencilTrace':True,'minimumTargetPx':44,'storageUnchanged':True,'limitations':['Touch is browser-emulated; a physical mobile device has not been tested.']}
            (OUTPUT/'results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
            html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>BYTE RUNNER - Equipamentos de reparo</title><style>body{margin:16px;background:#080f19;color:#cbdcde;font:14px monospace}main{display:grid;grid-template-columns:repeat(4,320px);gap:12px}figure{margin:0}img{width:320px;height:280px;image-rendering:pixelated}figcaption{height:40px}</style><h1>40 equipamentos de reparo</h1><main>'
            for item in gallery:html+=f'<figure><img src="{item["file"]}"><figcaption>{item["name"]}</figcaption></figure>'
            (OUTPUT/'index.html').write_text(html+'</main></html>',encoding='utf-8')
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1380,'height':3320,'deviceScaleFactor':1,'mobile':False})
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/tests/repairs-v2-gallery/index.html'})
            time.sleep(.5)
            capture=cdp.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})
            (OUTPUT/'contact.png').write_bytes(base64.b64decode(capture['data']))
            print(json.dumps(result,indent=2))
        finally:
            close_chrome(process,cdp);server.shutdown();server.server_close()

if __name__=='__main__':main()
