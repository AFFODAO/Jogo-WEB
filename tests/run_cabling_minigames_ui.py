"""Stage 6: cabling native wires/tools, optical movement and continuity diagnosis."""
import base64,functools,http.server,json,subprocess,tempfile,threading,time
from pathlib import Path
from chrome_cdp import CDP,page_endpoint,close_chrome,source_fingerprint
from run_repair_v2_ui import Handler

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/cabling-minigames-gallery'
COMPONENTS=[('roof-controls:antenna','fiber-splice'),('upper-hub:distribution','cable-reel'),('shaft-west-mid:motor','continuity-trace'),('maintenance-west:service','rj45-comb'),('central-main:patch','cable-reel'),('central-east:trunk','rj45-comb'),('basement-power:power','continuity-trace')]

def main():
    OUTPUT.mkdir(exist_ok=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    process=None;cdp=None;records=[];images=[]
    with tempfile.TemporaryDirectory(prefix='byte-cabling-minigames-',ignore_cleanup_errors=True) as folder:
        try:
            profile=Path(folder)/'chrome'
            process=subprocess.Popen(['C:/Program Files/Google/Chrome/Application/chrome.exe','--headless','--disable-gpu','--no-first-run','--disable-background-networking','--disable-component-update','--disk-cache-size=1048576','--remote-debugging-port=0',f'--user-data-dir={profile}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            deadline=time.monotonic()+20
            while not (profile/'DevToolsActivePort').exists():
                if time.monotonic()>deadline:raise TimeoutError('Chrome startup')
                time.sleep(.05)
            cdp=CDP(page_endpoint(int((profile/'DevToolsActivePort').read_text().splitlines()[0])))
            ev=cdp.evaluate
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/tests/minigames.html?phase=5'})
            deadline=time.monotonic()+25
            while not ev('Boolean(window.__labSession)'):
                if time.monotonic()>deadline:raise TimeoutError('Cabeamento laboratory did not load')
                time.sleep(.05)
            ev('window.__storageBefore=JSON.stringify(Object.entries(localStorage).sort())')
            def capture(filename,label):
                data=ev('document.querySelector(".repair-v2-canvas").toDataURL().split(",")[1]')
                (OUTPUT/filename).write_bytes(base64.b64decode(data));images.append((filename,label))
            def choose(cid):
                ev("(()=>{const picker=document.getElementById('component');picker.value=%s;picker.dispatchEvent(new Event('change'));scrollTo(0,0);})()"%json.dumps(cid))
                ev('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
            def selector(cid):return json.dumps('[data-control="'+cid+'"][data-target="false"]')
            def point(cid,scroll=False):
                return ev("""(()=>{const b=document.querySelector(%s);if(%s)b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()"""%(selector(cid),str(scroll).lower()))
            def key(name,code=None,number=None):
                args={'key':name,'code':code or name}
                if number:args['windowsVirtualKeyCode']=number
                if name=='Enter':args['text']='\r'
                for kind in ['keyDown','keyUp']:cdp.call('Input.dispatchKeyEvent',{'type':kind,**args})
            def mouse(kind,p):cdp.call('Input.dispatchMouseEvent',{'type':kind,**p,'button':'left','buttons':0 if kind=='mouseReleased' else 1,'clickCount':1})
            def touch(kind,p=None):cdp.call('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if p is None else [p]})
            def activate(cid,mode):
                if mode=='keyboard':
                    ev('document.querySelector('+selector(cid)+').focus()');point(cid,True);key('Enter','Enter',13)
                else:
                    p=point(cid)
                    if mode=='mouse':mouse('mousePressed',p);mouse('mouseReleased',p)
                    else:touch('touchStart',p);touch('touchEnd')
            def drag(cid,target,mode):
                if mode=='keyboard':activate(cid,mode);activate(target,mode);return
                a,b=point(cid),point(target)
                if mode=='mouse':mouse('mousePressed',a)
                else:touch('touchStart',a)
                for step in range(1,13):
                    p={'x':a['x']+(b['x']-a['x'])*step/12,'y':a['y']+(b['y']-a['y'])*step/12}
                    if mode=='mouse':mouse('mouseMoved',p)
                    else:touch('touchMove',p)
                if mode=='mouse':mouse('mouseReleased',b)
                else:touch('touchEnd')
            def move_vertical(cid,units,mode):
                p=point(cid)
                scale=ev('document.querySelector(".repair-scene-stage").getBoundingClientRect().width/640')
                if mode=='mouse':mouse('mousePressed',p)
                else:touch('touchStart',p)
                for step in range(1,13):
                    end={'x':p['x'],'y':p['y']+units*scale*step/12}
                    if mode=='mouse':mouse('mouseMoved',end)
                    else:touch('touchMove',end)
                if mode=='mouse':mouse('mouseReleased',end)
                else:touch('touchEnd')
            def squeeze(mode):
                p=point('crimp');scale=ev('document.querySelector(".repair-scene-stage").getBoundingClientRect().width/640')
                if mode=='mouse':mouse('mousePressed',p)
                else:touch('touchStart',p)
                for offset in [-28,28,-28,28]:
                    end={'x':p['x']+offset*scale,'y':p['y']}
                    if mode=='mouse':mouse('mouseMoved',end)
                    else:touch('touchMove',end)
                if mode=='mouse':mouse('mouseReleased',end)
                else:touch('touchEnd')
            def wait_ready():
                deadline=time.monotonic()+9
                while ev('__labSession.mode')=='playing' and ev('Boolean(__labSession.model.next()?.wait)'):
                    if time.monotonic()>deadline:raise TimeoutError('Machine did not finish its current operation')
                    time.sleep(.04)
            for mode,w,h,dpr in [('mouse',1280,1000,1),('touch',390,844,2),('keyboard',844,390,1)]:
                cdp.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':dpr,'mobile':mode=='touch'})
                cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':mode=='touch'})
                for cid,kind in COMPONENTS:
                    choose(cid);name=ev('__labSession.label()');variant=kind+'-'+cid.split(':')[0]
                    geometry=ev("""(()=>{const b=[...document.querySelectorAll('.repair-scene-stage button')];return {overflow:document.documentElement.scrollWidth>innerWidth+1,min:Math.min(...b.map(b=>Math.min(b.getBoundingClientRect().width,b.getBoundingClientRect().height)))};})()""")
                    assert not geometry['overflow'] and geometry['min']>=44,(mode,cid,geometry)
                    if mode=='mouse':capture(variant+'-inicial.png',name+' · inicial'+(' · núcleo' if cid=='kernel-stack:kernel' else ''))
                    paused=ev("(()=>{const s=__labSession;s.setPaused(true);const before=JSON.stringify(s.model);s.action(s.model.next());s.update(.05);const unchanged=before===JSON.stringify(s.model);s.setPaused(false);return unchanged;})()")
                    assert paused,'paused input changed model'
                    assert ev('!document.querySelector(".repair-v2-host input,.repair-v2-host select")'),'generic form controls returned'
                    if kind=='fiber-splice':
                        activate('lock',mode)
                        assert ev('__labSession.mistakes===1&&!__labSession.model.locked'),'misaligned coupler locked'
                        if mode!='keyboard':
                            for i in range(2):
                                offset=ev('(4-__labSession.model.positions[%d])*24'%i)
                                move_vertical('core'+str(i),offset,mode)
                            assert ev('__labSession.model.signal()===100'),'moving optical cores did not restore full signal'
                    elif kind=='cable-reel':
                        activate('join',mode)
                        assert ev('__labSession.mistakes===1&&!__labSession.model.joining'),'covered cable was spliced'
                        for i in range(2):
                            drag('stripper','end'+str(i),mode);wait_ready()
                        assert ev('__labSession.model.stripped.every(v=>v===1)'),'strip tool did not remove insulation'
                        drag('conductor0','contact1',mode)
                        assert ev('__labSession.model.joins.every(v=>!v)'),'mismatched conductors joined'
                    elif kind=='rj45-comb':
                        wrong=ev("'pin'+__labSession.model.expected.findIndex(v=>v!==0)")
                        drag('wire0',wrong,mode)
                        assert ev('__labSession.model.pins.every(v=>v===-1)'),'wrong pin accepted'
                        activate('crimp',mode)
                        assert ev('__labSession.mistakes===1&&!__labSession.model.crimping'),'incomplete connector crimped'
                    elif kind=='continuity-trace':
                        drag('probe0','endpoint1',mode)
                        assert ev('__labSession.model.probes.every(v=>!v)'),'probe attached to wrong endpoint'
                        activate('scan',mode)
                        assert ev('__labSession.mistakes===1&&!__labSession.model.scanning'),'tester ran without probes'
                        for i in range(2):drag('probe'+str(i),'endpoint'+str(i),mode)
                        activate('scan',mode);wait_ready()
                        assert ev('__labSession.model.diagnosed&&!__labSession.model.done'),'diagnostic scan bypassed faults'
                        intact=ev("'trace'+__labSession.model.repaired.findIndex((_,i)=>!__labSession.model.faults.includes(i))")
                        drag('repair',intact,mode)
                        assert ev('__labSession.model.repaired.every(v=>!v)'),'healthy conductor modified'
                    captured_wait=False;captured_quarantine=False
                    for step in range(100):
                        if ev('__labSession.mode')=='won':break
                        action=ev('__labSession.model.next()');assert action,(mode,cid,'no next action')
                        if action.get('wait'):
                            assert not ev('__labSession.model.done'),'task completed before animation'
                            if mode=='mouse' and not captured_wait:
                                capture(variant+'-animacao.png',name+' · em operação');captured_wait=True
                            wait_ready();continue
                        if 'target' in action:
                            drag(action['id'],action['target'],mode)
                        elif 'value' in action:
                            if action['id']=='crimp' and mode!='keyboard':
                                squeeze(mode);continue
                            if mode=='keyboard':
                                ev('document.querySelector('+selector(action['id'])+').focus()');point(action['id'],True);key('Home','Home',36)
                                for _ in range(action['value']):key('ArrowRight','ArrowRight',39)
                            else:activate(action['id'],mode)
                        else:activate(action['id'],mode)
                    assert ev('__labSession.mode')=='won',(mode,cid,ev('JSON.stringify(__labSession.model)'))
                    assert ev('__labSession.progress===1'),'completion progress missing'
                    ev('__labSession.update(.5)');assert ev('__labSession.status')=='success','success lifecycle failed'
                    if mode=='mouse':capture(variant+'-concluido.png',name+' · concluído')
                    records.append({'input':mode,'viewport':[w,h],'component':cid,'type':kind,'passed':True,'minimumTargetPx':geometry['min']})
            assert ev('JSON.stringify(Object.entries(localStorage).sort())===window.__storageBefore'),'laboratory changed campaign storage'
            report={'sourceSha256':source_fingerprint(ROOT),'concepts':4,'components':7,'runs':records,'storageUnchanged':True,'limits':['Toque emulado no Chrome; aparelho físico não testado.']}
            (OUTPUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>BYTE RUNNER · Cabeamento</title><style>body{margin:16px;background:#080d20;color:#d9e1d1;font:14px monospace}main{display:grid;grid-template-columns:repeat(4,320px);gap:12px}figure{margin:0}img{width:320px;height:280px;image-rendering:pixelated}figcaption{height:42px}</style><h1>Cabeamento · quatro tarefas interativas</h1><main>'
            for filename,label in images:html+=f'<figure><img src="{filename}"><figcaption>{label}</figcaption></figure>'
            (OUTPUT/'index.html').write_text(html+'</main></html>',encoding='utf-8')
            cdp.call('Emulation.setTouchEmulationEnabled',{'enabled':False})
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':1380,'height':max(1100,110+((len(images)+3)//4)*334),'deviceScaleFactor':1,'mobile':False})
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/tests/cabling-minigames-gallery/index.html'})
            deadline=time.monotonic()+12
            while not ev('document.images.length===%d&&[...document.images].every(i=>i.complete&&i.naturalWidth>0)'%len(images)):
                if time.monotonic()>deadline:raise TimeoutError('Gallery images did not decode')
                time.sleep(.05)
            ev('Promise.all([...document.images].map(i=>i.decode())).then(()=>true)')
            capture=cdp.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})
            (OUTPUT/'contact.png').write_bytes(base64.b64decode(capture['data']))
            print(json.dumps({'concepts':4,'components':7,'nativeInputRuns':len(records),'storageUnchanged':True},indent=2),flush=True)
        finally:
            close_chrome(process,cdp);server.shutdown();server.server_close()

if __name__=='__main__':main()
