"""Stage 1 laboratory: real Chrome mouse/touch/keyboard, original equipment captures."""
import base64,functools,http.server,json,subprocess,tempfile,threading,time
from pathlib import Path
from chrome_cdp import CDP,page_endpoint,close_chrome,source_fingerprint
from run_repair_v2_ui import Handler

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/hardware-v2-gallery'
COMPONENTS=[('bus-west:bus-relay','cpu-install'),('ram-base:ram-relay','ram-install'),('gpu-east:gpu-relay','power-wiring'),('socket:cpu-relay','fan-replacement')]

def main():
    OUTPUT.mkdir(exist_ok=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    records=[];images=[];process=None;cdp=None
    with tempfile.TemporaryDirectory(prefix='byte-hardware-v2-',ignore_cleanup_errors=True) as folder:
        try:
            profile=Path(folder)/'chrome'
            process=subprocess.Popen(['C:/Program Files/Google/Chrome/Application/chrome.exe','--headless','--disable-gpu','--no-first-run','--remote-debugging-port=0',f'--user-data-dir={profile}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            deadline=time.monotonic()+20
            while not (profile/'DevToolsActivePort').exists():
                if time.monotonic()>deadline:raise TimeoutError('Chrome startup')
                time.sleep(.05)
            cdp=CDP(page_endpoint(int((profile/'DevToolsActivePort').read_text().splitlines()[0])))
            ev=cdp.evaluate
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/tests/minigames.html?phase=0'})
            deadline=time.monotonic()+25
            while not ev('Boolean(window.__labSession)'):
                if time.monotonic()>deadline:raise TimeoutError('Hardware laboratory did not load')
                time.sleep(.05)
            ev('window.__storageBefore=JSON.stringify(Object.entries(localStorage).sort())')
            def capture(filename,label):
                data=ev('document.querySelector(".repair-v2-canvas").toDataURL().split(",")[1]')
                (OUTPUT/filename).write_bytes(base64.b64decode(data));images.append((filename,label))
            def choose(cid):
                ev("""(()=>{const c=document.getElementById('component');c.value=%s;c.dispatchEvent(new Event('change'));scrollTo(0,0);})()"""%json.dumps(cid))
                ev('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
            def point(cid,scroll=False):
                return ev("""(()=>{const b=document.querySelector('[data-control="'+%s+'"][data-target="false"]');
                  if(%s)b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()"""%(json.dumps(cid),str(scroll).lower()))
            def mouse(kind,p):cdp.call('Input.dispatchMouseEvent',{'type':kind,**p,'button':'left','buttons':0 if kind=='mouseReleased' else 1,'clickCount':1})
            def touch(kind,p=None):cdp.call('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if p is None else [p]})
            def key(key,code=None,number=None):
                args={'key':key,'code':code or key}
                if number:args['windowsVirtualKeyCode']=number
                if key=='Enter':args['text']='\r'
                for kind in ['keyDown','keyUp']:cdp.call('Input.dispatchKeyEvent',{'type':kind,**args})
            def focus(cid):
                selector=json.dumps('[data-control="'+cid+'"][data-target="false"]')
                ev('document.querySelector('+selector+').focus()')
            def activate(cid,mode):
                if mode=='keyboard':
                    focus(cid);point(cid,True);key('Enter','Enter',13)
                else:
                    p=point(cid)
                    if mode=='mouse':mouse('mousePressed',p);mouse('mouseReleased',p)
                    else:touch('touchStart',p);touch('touchEnd')
            def drag(cid,target,mode,rotate=False):
                if mode=='keyboard':activate(cid,mode);activate(target,mode);return
                a,b=point(cid),point(target)
                if mode=='mouse':mouse('mousePressed',a)
                else:touch('touchStart',a)
                if rotate:
                    for _ in range(4):
                        if ev('__labSession.model.orientation')==0:break
                        cdp.call('Input.dispatchMouseEvent',{'type':'mouseWheel',**a,'deltaX':0,'deltaY':100})
                for step in range(1,13):
                    p={'x':a['x']+(b['x']-a['x'])*step/12,'y':a['y']+(b['y']-a['y'])*step/12}
                    if mode=='mouse':mouse('mouseMoved',p)
                    else:touch('touchMove',p)
                if mode=='mouse':mouse('mouseReleased',b)
                else:touch('touchEnd')
            for mode,w,h,dpr in [('mouse',1280,1000,1),('touch',390,844,2),('keyboard',844,390,1)]:
                cdp.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':dpr,'mobile':mode=='touch'})
                cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':mode=='touch'})
                for cid,kind in COMPONENTS:
                    choose(cid)
                    assert ev('__labSession.engine')=='v2'
                    name=ev('__labSession.label()')
                    geometry=ev("""(()=>{const buttons=[...document.querySelectorAll('.repair-scene-stage button')];return {
                      overflow:document.documentElement.scrollWidth>innerWidth+1,min:Math.min(...buttons.map(b=>Math.min(b.getBoundingClientRect().width,b.getBoundingClientRect().height)))};})()""")
                    assert not geometry['overflow'] and geometry['min']>=44,(mode,kind,geometry)
                    if mode=='mouse':capture(kind+'-inicial.png',name+' · inicial')
                    if kind=='cpu-install':
                        # Wrong orientation must be refused, then the processor rotates while held.
                        drag('cpu','cpu-socket',mode)
                        assert ev('!__labSession.model.seated&&__labSession.mistakes===0'),'misoriented CPU accepted or charged'
                        if mode=='mouse':
                            capture(kind+'-rejeitado.png',name+' · orientação recusada')
                            drag('cpu','cpu-socket',mode,rotate=True)
                            assert ev('__labSession.model.seated'),'held CPU wheel rotation failed'
                        else:activate('cpu',mode)
                    elif kind=='ram-install':
                        wrong=ev('__labSession.model.slotTypes.findIndex(v=>v!==0)')
                        drag('ram0','dimm-slot'+str(wrong),mode)
                        assert ev('__labSession.model.slots.every(v=>v<0)&&__labSession.mistakes===0'),'wrong DIMM slot accepted or charged'
                        if mode=='mouse':capture(kind+'-rejeitado.png',name+' · entalhe incompatível')
                    elif kind=='power-wiring':
                        wrong=ev('__labSession.model.socketTypes.findIndex(v=>v!==0)')
                        drag('power-cable0','power-socket'+str(wrong),mode)
                        assert ev('__labSession.model.connections.every(v=>v<0)&&__labSession.mistakes===0'),'wrong power socket accepted'
                    for step in range(90):
                        if ev('__labSession.mode')=='won':break
                        action=ev('__labSession.model.next()')
                        if action.get('wait'):
                            if mode=='mouse':capture(kind+'-ativacao.png',name+' · ativação')
                            deadline=time.monotonic()+9
                            while ev('__labSession.mode')!='won':
                                if time.monotonic()>deadline:raise TimeoutError(kind+' did not activate')
                                time.sleep(.04)
                            break
                        if action['id']=='rotate-cpu' and mode=='keyboard':
                            ev('document.querySelector("[data-control=cpu]").focus()');key('r','KeyR',82)
                        elif 'target' in action:drag(action['id'],action['target'],mode)
                        elif 'value' in action:
                            if mode=='keyboard':
                                focus(action['id']);point(action['id'],True);key('End','End',35)
                            else:
                                activate(action['id'],mode);activate(action['id'],mode)
                        else:activate(action['id'],mode)
                    assert ev('__labSession.mode')=='won',(mode,kind,ev('JSON.stringify(__labSession.model)'))
                    if mode=='mouse':capture(kind+'-concluido.png',name+' · concluído')
                    records.append({'input':mode,'viewport':[w,h],'type':kind,'name':name,'passed':True,'minimumTargetPx':geometry['min']})
            assert ev('JSON.stringify(Object.entries(localStorage).sort())===window.__storageBefore'),'laboratory modified campaign storage'
            report={'sourceSha256':source_fingerprint(ROOT),'tasks':4,'runs':records,'storageUnchanged':True,'limits':['Toque emulado no Chrome; aparelho físico não testado.']}
            (OUTPUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>BYTE RUNNER · Hardware</title><style>body{margin:16px;background:#071017;color:#c0d1d2;font:14px monospace}main{display:grid;grid-template-columns:repeat(4,320px);gap:12px}figure{margin:0}img{width:320px;height:280px;image-rendering:pixelated}figcaption{height:42px}</style><h1>Hardware · quatro reparos físicos</h1><main>'
            for filename,label in images:html+=f'<figure><img src="{filename}"><figcaption>{label}</figcaption></figure>'
            (OUTPUT/'index.html').write_text(html+'</main></html>',encoding='utf-8')
            cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':False})
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1380,'height':1500,'deviceScaleFactor':1,'mobile':False})
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/tests/hardware-v2-gallery/index.html'})
            deadline=time.monotonic()+10
            while not ev('document.images.length===%d&&[...document.images].every(image=>image.complete&&image.naturalWidth>0)'%len(images)):
                if time.monotonic()>deadline:raise TimeoutError('Gallery images did not finish loading')
                time.sleep(.05)
            ev('Promise.all([...document.images].map(image=>image.decode())).then(()=>true)')
            shot=cdp.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})
            (OUTPUT/'contact.png').write_bytes(base64.b64decode(shot['data']))
            print(json.dumps({'tasks':4,'nativeInputRuns':len(records),'storageUnchanged':True},indent=2))
        finally:
            close_chrome(process,cdp);server.shutdown();server.server_close()

if __name__=='__main__':main()
