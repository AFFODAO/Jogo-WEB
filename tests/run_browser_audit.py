"""Real Chrome viewports, console events, keyboard and touch through CDP."""
from pathlib import Path
import base64, datetime, functools, http.server, json, re, shutil, subprocess, tempfile, threading, time
from chrome_cdp import CDP,page_endpoint,source_fingerprint,close_chrome
ROOT=Path(__file__).resolve().parents[1]
CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'
def write_capture(path,data):
    # Replace atomically: Windows preview/indexing handles can briefly lock an old PNG.
    pending=path.with_name(path.stem+'.pending.png')
    for attempt in range(4):
        try:
            pending.write_bytes(data);pending.replace(path);return
        except OSError:
            if attempt==3:raise
            time.sleep(.25*(attempt+1))
def main():
    report={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'viewports':[],'input':{},'consoleErrors':[],'exceptions':[],'networkFailures':[],'failures':[],'captures':[]}
    report['sourceSha256']=source_fingerprint(ROOT)
    destination=ROOT/'tests'/'ui-snapshots';destination.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='byte-browser-audit-',ignore_cleanup_errors=True) as folder:
        target=Path(folder)
        for name in ['src','assets']:shutil.copytree(ROOT/name,target/name)
        for name in ['index.html','style.css']:shutil.copy2(ROOT/name,target/name)
        source=(ROOT/'game.js').read_text(encoding='utf-8-sig');bridge=(ROOT/'tests/ui-bridge.js').read_text(encoding='utf-8')
        (target/'game.js').write_text(source[:source.rindex('})();')]+bridge+'\n})();',encoding='utf-8')
        class Handler(http.server.SimpleHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_GET(self):
                if self.path=='/favicon.ico':self.send_response(204);self.end_headers();return
                super().do_GET()
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(target)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        profile=target/'profile';process=subprocess.Popen([CHROME,'--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',f'--user-data-dir={profile}','--window-size=1440,1000','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        cdp=None
        try:
            portfile=profile/'DevToolsActivePort';deadline=time.monotonic()+20
            while not portfile.exists():
                if time.monotonic()>deadline or process.poll() is not None:raise RuntimeError('Chrome debugger did not start')
                time.sleep(.1)
            cdp=CDP(page_endpoint(int(portfile.read_text().splitlines()[0])))
            for domain in ['Page','Runtime','Log','Network']:cdp.call(domain+'.enable')
            cdp.call('Page.addScriptToEvaluateOnNewDocument',{'source':(ROOT/'tests/audit-bootstrap.js').read_text(encoding='utf-8')})
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/index.html'})
            deadline=time.monotonic()+20
            while not cdp.evaluate('Boolean(window.__auditUI)'):
                if time.monotonic()>deadline:raise RuntimeError('Game failed to initialize')
                time.sleep(.1)
            report['phaseLoading']=cdp.evaluate('__auditUI.loadAll()')
            for w,h,mobile in [(1920,1080,False),(1366,768,False),(1024,768,False),(800,600,False),(390,844,True),(360,640,True),(844,390,True)]:
                cdp.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':mobile})
                cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':mobile,'maxTouchPoints':1})
                cdp.evaluate('new Promise(resolve=>setTimeout(resolve,60))')
                for mode,phase in [('menu',0),('play',0),('intro',0),('pause',0),('repair',0),('repair',5),('repair',4),('question',8),('skills',0),('settings',0)]:
                    state=cdp.evaluate(f'__auditUI.show({json.dumps(mode)},{phase})')
                    # A real rendering frame is allowed to settle layout without running game physics.
                    cdp.evaluate('window.scrollTo(0,0);new Promise(resolve=>setTimeout(resolve,300))')
                    panel={'menu':'.overlay-card','intro':'#phaseIntro','pause':'.overlay-card','repair':'#repairPanel','question':'.question-dialog','skills':'.level-dialog','settings':'#settingsDialog'}.get(mode,'#game')
                    metrics=cdp.evaluate('''(()=>{const e=document.querySelector('''+json.dumps(panel)+'''),r=e.getBoundingClientRect();return {viewport:[innerWidth,innerHeight],pageOverflow:document.documentElement.scrollWidth>innerWidth+1,panelOverflow:e.scrollWidth>e.clientWidth+2,visible:r.width>0&&r.height>0,left:r.left,right:r.right,top:r.top,bottom:r.bottom,panelHeight:r.height,descriptionWidths:[...e.querySelectorAll('.ability-option small')].map(s=>s.getBoundingClientRect().width)};})()''')
                    entry={'width':w,'height':h,'mobile':mobile,'mode':mode,'phase':phase+1,**metrics};report['viewports'].append(entry)
                    if metrics['viewport']!=[w,h] or metrics['pageOverflow'] or metrics['panelOverflow'] or not metrics['visible'] or metrics['left']< -1 or metrics['right']>w+1:report['failures'].append(entry)
                    if any(size<100 for size in metrics['descriptionWidths']):report['failures'].append({'unreadableAbilityDescription':entry})
                    if mode=='play' and (metrics['top']<0 or metrics['bottom']>h+1):report['failures'].append({'canvasOutsideViewport':entry})
                    name=f'{w}x{h}-{mode}-phase-{phase+1:02}.png'
                    write_capture(destination/name,base64.b64decode(cdp.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']));report['captures'].append('ui-snapshots/'+name)
                    unreachable=cdp.evaluate('''(()=>{const panel=document.querySelector('''+json.dumps(panel)+''');const failed=[];for(const e of panel.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')){if(!e.getClientRects().length||e.hidden)continue;e.scrollIntoView({block:'nearest',inline:'nearest'});const r=e.getBoundingClientRect(),x=Math.max(1,Math.min(innerWidth-1,r.x+r.width/2)),y=Math.max(1,Math.min(innerHeight-1,r.y+r.height/2));const hit=document.elementFromPoint(x,y);if(r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth||!(e===hit||e.contains(hit)))failed.push(e.id||e.textContent.trim().slice(0,60)||e.tagName);}return failed;})()''')
                    entry['unreachableControls']=unreachable
                    if unreachable:report['failures'].append({'unreachableControls':entry})
            # Actual browser input: RAF, physical key events, then touch via Chromium.
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1366,'height':768,'deviceScaleFactor':1,'mobile':False})
            cdp.evaluate('__auditUI.play()');start=cdp.evaluate('__auditUI.position()')
            cdp.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'d','code':'KeyD','windowsVirtualKeyCode':68})
            cdp.evaluate('new Promise(resolve=>setTimeout(resolve,220))')
            cdp.call('Input.dispatchKeyEvent',{'type':'keyUp','key':'d','code':'KeyD','windowsVirtualKeyCode':68})
            finish=cdp.evaluate('__auditUI.position()');report['input']['keyboard']={'before':start,'after':finish,'passed':finish['x']>start['x']+20 and not finish['keys']};cdp.evaluate('__auditUI.freeze()')
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
            cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':1});cdp.evaluate('__auditUI.play()')
            point=cdp.evaluate('''(()=>{const b=document.querySelector('[data-touch="d"]');b.scrollIntoView({block:'nearest'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()''')
            start=cdp.evaluate('__auditUI.position()');cdp.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]});cdp.evaluate('new Promise(resolve=>setTimeout(resolve,220))');cdp.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            finish=cdp.evaluate('__auditUI.position()');report['input']['touch']={'before':start,'after':finish,'passed':finish['x']>start['x']+20 and not finish['keys']};cdp.evaluate('__auditUI.freeze()')
            before_reload_errors=cdp.evaluate('window.__reviewErrors')
            before_reload=cdp.evaluate('__auditUI.seedSave()')
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/index.html?reload-audit=1'})
            deadline=time.monotonic()+20
            while True:
                try:
                    if cdp.evaluate('location.search.includes("reload-audit")&&Boolean(window.__auditUI)'):break
                except RuntimeError:pass
                if time.monotonic()>deadline:raise RuntimeError('Reload did not initialize')
                time.sleep(.1)
            point=cdp.evaluate('''(()=>{const b=document.getElementById('continueButton');b.scrollIntoView({block:'nearest'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()''')
            cdp.call('Input.dispatchMouseEvent',{'type':'mousePressed','button':'left','clickCount':1,**point});cdp.call('Input.dispatchMouseEvent',{'type':'mouseReleased','button':'left','clickCount':1,**point})
            after_reload=cdp.evaluate('__auditUI.persisted()')
            report['reloadPersistence']={'before':before_reload,'after':after_reload,'passed':before_reload==after_reload}
            if before_reload!=after_reload:report['failures'].append('Real navigation lost campaign state')
            report['runtimeErrors']=before_reload_errors+cdp.evaluate('window.__reviewErrors')
            # Flush queued debugger events before classifying console and exceptions.
            cdp.call('Runtime.evaluate',{'expression':'0'})
            for event in cdp.events:
                method=event['method'];params=event.get('params',{})
                if method=='Runtime.exceptionThrown':report['exceptions'].append(params['exceptionDetails'])
                if method=='Runtime.consoleAPICalled' and params.get('type')=='error':report['consoleErrors'].append(params)
                if method=='Log.entryAdded' and params['entry'].get('level')=='error':report['consoleErrors'].append(params['entry'])
                if method=='Network.loadingFailed' and not params.get('canceled'):report['networkFailures'].append(params)
            if report['runtimeErrors'] or report['exceptions'] or report['consoleErrors'] or report['networkFailures']:report['failures'].append('Browser errors recorded')
            if any(p['assetErrors'] for p in report['phaseLoading']):report['failures'].append('Phase image load failure')
            if any(not value['passed'] for value in report['input'].values()):report['failures'].append('Real input failed')
        finally:
            close_chrome(process,cdp);server.shutdown();server.server_close()
    (ROOT/'tests/browser-audit-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'viewports':len(report['viewports']),'captures':len(report['captures']),'input':report['input'],'consoleErrors':len(report['consoleErrors']),'exceptions':len(report['exceptions']),'failures':report['failures']},ensure_ascii=False,indent=2))
    if report['failures']:raise SystemExit(1)
if __name__=='__main__':main()
