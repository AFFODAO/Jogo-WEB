"""Read-only project baseline. All browser tests run in a disposable project copy.

Writes only tests/rebuild-v3-baseline; never generates or edits campaign maps.
"""
import hashlib,json,shutil,subprocess,sys,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/rebuild-v3-baseline'
HOOK=r"""
report.inventory=[];
const snapshot=()=>({solids:JSON.parse(JSON.stringify(solids())),standingSpans:surfaces(),connections:levelRuntime.connections(),runtimeState:levelRuntime.save()});
for(let index=0;index<10;index++){
  setup(index);await levelVisuals.ready;endPhaseIntro();animationTime=0;
  const definition=ByteRunner.maps.clone(phaseData),initial=snapshot();
  const actors={enemies:viruses.map(v=>({id:v.id,type:v.type,variant:v.variant,x:v.x,y:v.y,hp:v.hp,xp:v.xp,multiStage:v.multiStage,bossBounds:v.bossBounds,activationRegion:v.activationRegion})),components:components.map(c=>({id:c.id,label:c.label,x:c.x,y:c.y,width:c.width,height:c.height,repair:c.repair})),collectibles:collectibles.map(c=>({id:c.id,x:c.x,y:c.y,secret:c.secret})),loadedAssets:levelVisuals.loadedAssets()};
  components.forEach(c=>c.repaired=true);
  const repairedComponentsOnly=snapshot();
  report.inventory.push({index:index+1,definition,initial,repairedComponentsOnly,actors,questionCount:QUESTION_BANK[phaseData.theme]?.length??null});
  test('rebuild preparation: compiled map '+(index+1),()=>assert(ByteRunner.maps.validate(phaseData).length===0&&phaseData.entities.components.length>0,'invalid compiled phase'));
}
report.physics={...ByteRunner.platformPhysics.base,jumpHeight:ByteRunner.platformPhysics.jumpHeight,flightTime:ByteRunner.platformPhysics.flightTime,maxHorizontal:ByteRunner.platformPhysics.maxHorizontal};
running=false;
"""

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True,encoding='utf-8').strip()
def tracked_hashes():return {name:digest(ROOT/name) for name in git('ls-files').splitlines() if (ROOT/name).is_file()}

def clipped(rectangles,width,height):
    result=[]
    for x,y,w,h in rectangles:
        a,b=max(0,x),max(0,y);c,d=min(width,x+w),min(height,y+h)
        if c>a and d>b:result.append((a,b,c,d))
    return result

def union_area(rectangles):
    xs=sorted({p for r in rectangles for p in (r[0],r[2])});area=0.0
    for a,b in zip(xs,xs[1:]):
        intervals=sorted((r[1],r[3]) for r in rectangles if r[0]<b and r[2]>a)
        length=0.0;end=None
        for lo,hi in intervals:
            if end is None or lo>end:length+=hi-lo;end=hi
            elif hi>end:length+=hi-end;end=hi
        area+=(b-a)*length
    return area

def metrics(record,physics):
    definition=record['definition'];width=definition['map']['width'];height=definition['map']['height']
    assert isinstance(height,(int,float)),'viewport-height map needs explicit analysis viewport'
    states={}
    for name in ['initial','repairedComponentsOnly']:
        state=record[name]
        solids=clipped([(r['x'],r['y'],r['w'],r['h']) for r in state['solids']],width,height)
        # Candidate navigation band: standing body + one base-jump height.
        # This is geometric coverage, not a proof of reachability or measured play time.
        bands=clipped([(s['a'],s['y']-physics['jumpHeight'],s['z']-s['a']+physics['width'],physics['height']+physics['jumpHeight']) for s in state['standingSpans']],width,height)
        solid_area=union_area(solids)
        states[name]={'solidUnionPx2':round(solid_area,2),'freeGeometryPx2':round(width*height-solid_area,2),'candidateNavigationPx2':round(union_area(solids+bands)-solid_area,2),'standingSpans':len(state['standingSpans']),'activeShapes':len(state['solids']),'activeConnections':len(state['connections'])}
    return {'worldPx2':width*height,'states':states}

def main():
    resume='--inventory-only' in sys.argv
    if OUTPUT.exists() and not resume:raise SystemExit('Baseline directory already exists; refusing to overwrite it.')
    if resume and not (OUTPUT/'regression-results.json').is_file():raise SystemExit('No completed baseline regression to reuse.')
    if git('branch','--show-current')!='rebuild-maps-v3':raise SystemExit('Run only on rebuild-maps-v3.')
    before=tracked_hashes();head=git('rev-parse','HEAD');OUTPUT.mkdir(parents=True,exist_ok=resume)
    record=json.loads((OUTPUT/'execution.json').read_text(encoding='utf-8')) if resume else {'head':head,'branch':git('branch','--show-current'),'remote':git('remote','get-url','origin'),'trackedFilesBefore':before,'commands':[],'scope':'Analysis only; production files remain unchanged; browser tests use temporary copies.'}
    assert record['head']==head and record['trackedFilesBefore']==before,'Baseline changed; do not resume.'
    def run(args,cwd):
        args=[args[0],'-X','utf8',*args[1:]]
        process=subprocess.run(args,cwd=cwd,capture_output=True,text=True,encoding='utf-8',errors='replace')
        record['commands'].append({'argv':args,'cwdRole':'temporary project copy','exitCode':process.returncode,'stdout':process.stdout,'stderr':process.stderr})
        print(' '.join(args[1:])+f' -> {process.returncode}',flush=True)
        (OUTPUT/'execution.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
        if process.returncode:raise RuntimeError(process.stdout[-2000:]+'\n'+process.stderr[-2000:])
    with tempfile.TemporaryDirectory(prefix='byte-rebuild-v3-') as folder:
        temporary=Path(folder).resolve()
        assert temporary.parent==Path(tempfile.gettempdir()).resolve() and temporary.name.startswith('byte-rebuild-v3-')
        target=temporary/'project';target.mkdir()
        for name in ['game.js','index.html','style.css','README.md']:shutil.copy2(ROOT/name,target/name)
        for name in ['src','assets','tests','tools']:
            shutil.copytree(ROOT/name,target/name,ignore=shutil.ignore_patterns('__pycache__','rebuild-v3-baseline'))
        if not resume:
            for name in ['check_maps.py','check_parallax.py','check_environment.py','check_generation.py','check_hardware_depth.py']:
                run([sys.executable,'tools/'+name],target)
            run([sys.executable,'tests/run_review.py'],target)
            shutil.copy2(target/'tests/review-results.json',OUTPUT/'regression-results.json')
            captures=OUTPUT/'captures';captures.mkdir()
            for image in (target/'tests/snapshots').glob('phase-*-overview.png'):shutil.copy2(image,captures/image.name)
        (target/'tests/parallax-identity.js').write_text(HOOK,encoding='utf-8')
        run([sys.executable,'tests/run_review.py','--identity-phase','1','--result-label','rebuild-v3-inventory'],target)
        inventory=json.loads((target/'tests/rebuild-v3-inventory-results.json').read_text(encoding='utf-8'))
        for phase in inventory['inventory']:
            path=next((ROOT/'src/maps').glob(f'{phase["index"]:02}-*.js'))
            source=path.read_text(encoding='utf-8');start=source.index('{',source.index('ByteRunner.maps.register('))
            authored,_=json.JSONDecoder().raw_decode(source[start:])
            phase['authoringFile']=path.relative_to(ROOT).as_posix()
            phase['authoredCounts']={k:len(v) for k,v in authored['entities'].items()}
            phase['authoredRevision']=authored.get('revision',1)
            phase['areaEstimates']=metrics(phase,inventory['physics'])
        (OUTPUT/'inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
    after=tracked_hashes();assert after==before,'A tracked source or existing artifact changed.'
    record['trackedFilesUnchanged']=True;record['temporaryCopyRemoved']=True
    record['newFilesExcludedFromPreservationCheck']=['tools/analyze_rebuild_maps_v3.py','tests/rebuild-v3-baseline/','REBUILD_MAPS_V3.md']
    (OUTPUT/'execution.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
    print('PASS: baseline collected; all previously tracked files and artifacts unchanged.',flush=True)

if __name__=='__main__':main()
