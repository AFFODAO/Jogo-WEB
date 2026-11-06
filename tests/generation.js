const generation=ByteRunner.mapGeneration;
const generationRoom={id:'manual-special',version:1,width:640,height:360,
  ground:[{id:'floor',x:0,y:320,width:640,height:40}],
  entities:{platforms:[{id:'bridge',x:320,y:248,width:96,height:18,type:'fixed',collision:'one-way',requiresComponentId:'repair'}],
    gates:[{id:'lock',x:608,y:240,width:16,height:80,opensWhen:{component:'repair'}}],
    components:[{id:'repair',x:160,y:276,width:34,height:44,repair:{type:'sequence',keys:['1']}}],
    enemies:[{id:'enemy',type:'basic',x:448,y:296,groundY:320,patrolMin:360,patrolMax:540,navigationBounds:{left:340,right:580},activationRegion:{x:320,y:200,width:260,height:120}}]},
  anchors:{entry:{x:64,y:272},exit:{x:544,y:272}},sockets:[{id:'west',x:0,y:272,direction:'west'},{id:'east',x:640,y:272,direction:'east'}],
  checkpoints:[{x:64,y:320}],goals:[{id:'repair-goal',type:'repair',ids:['repair']}],
  layers:[{id:'scenery',type:'computer-world',theme:'hardware',pass:'midground',items:[{kind:'cpu',label:'CPU',x:400,y:260,width:128,height:60,requires:{component:'repair'}}]}]
};
const generationPlan={id:'hybrid-fixture',name:'Hybrid fixture',theme:'hardware',seed:0,size:{width:1280,height:360},
  rooms:[{id:'left',template:'manual-special',x:0,y:0},{id:'right',generator:'fixture-flat',config:{},x:640,y:0}],
  start:{room:'left',anchor:'entry'},exit:{room:'right',anchor:'exit'},links:[{from:{room:'left',socket:'east'},to:{room:'right',socket:'west'}}],
  objectives:{repairAllComponents:true,defeatAllViruses:false}
};
function generationReject(fn,match){let error;try{fn();}catch(e){error=e;}assert(error&&(!match||error.message.includes(match)),'expected rejection '+match);}
test('generation: campaign generators coexist with optional composition',()=>{
  assert(generation.list().templates.length===0&&generation.list().generators.filter(id=>id.startsWith('campaign-')).length===10,'campaign generators missing');
  assert(PHASES.length===10&&ByteRunner.campaign.length===10,'campaign replaced');
  PHASES.forEach(phase=>assert(generation.authored(phase.id)===phase&&Object.isFrozen(phase),'authored map copied or changed'));
});
test('generation: seeded streams reproduce and forks ignore caller order',()=>{
  const a=generation.random(0),b=generation.random(0);
  for(let i=0;i<50;i++)assert(a.next()===b.next(),'seed mismatch');
  const root=generation.random('campaign');const first=root.fork('room-a').int(1,100000);root.next();root.fork('room-b').next();
  assert(first===root.fork('room-a').int(1,100000),'room fork depends on another room');
  generationReject(()=>generation.random(Infinity),'seed');generationReject(()=>a.int(3,2),'range');generationReject(()=>a.pick([]),'empty');
});
test('generation: registries validate templates and reject duplicate plugins',()=>{
  const original=JSON.stringify(generationRoom);generation.registerRoom(generationRoom);
  generation.registerGenerator({id:'fixture-flat',version:2,generate({random}){
    const room=ByteRunner.maps.clone(generationRoom);room.id='generated-flat';room.entities={collectibles:[{id:'cache',x:random.int(96,256),y:296,radius:8}]};room.goals=[];room.layers=[];return room;
  }});
  assert(JSON.stringify(generationRoom)===original,'registration mutated template');
  generationReject(()=>generation.registerRoom(generationRoom),'Duplicate');
  generationReject(()=>generation.registerGenerator({id:'fixture-flat',version:2,generate(){}}),'Duplicate');
});
test('generation: hybrid compiler is deterministic, immutable and has no map-registry side effects',()=>{
  const count=ByteRunner.maps.list().length,original=JSON.stringify(generationPlan),a=generation.compile(generationPlan),b=generation.compile(generationPlan);
  assert(JSON.stringify(a)===JSON.stringify(b),'nondeterministic output');
  assert(JSON.stringify(generationPlan)===original&&Object.isFrozen(a.entities.platforms[0]),'input mutation or mutable output');
  assert(ByteRunner.maps.list().length===count&&ByteRunner.campaign.length===10,'compile registered a map');
  assert(JSON.stringify(generation.compile(a.generation.recipe))===JSON.stringify(a),'recipe cannot replay');
  assert(!ByteRunner.maps.validate(a).length,'not schema-v2 compatible');
  assert(a.map.start.x===64&&a.map.exit.x===1184&&a.map.ground.mode==='explicit','map anchors or floor wrong');
  assert(a.generation.rooms[1].source.version===2&&a.generation.presentation.tileset==='tiles-01','missing source/presentation metadata');
});
test('generation: local names and repair dependencies are qualified without collisions',()=>{
  const plan=ByteRunner.maps.clone(generationPlan);plan.rooms[1]={id:'right',template:'manual-special',x:640,y:0};const result=generation.compile(plan);
  assert(result.entities.components.map(c=>c.id).join(',')==='left:repair,right:repair','duplicate local IDs');
  assert(result.entities.platforms[1].requiresComponentId==='right:repair'&&result.entities.gates[1].opensWhen.component==='right:repair','repair reference not scoped');
  assert(result.objectives.goals[1].ids[0]==='right:repair'&&result.layers[1].items[0].requires.component==='right:repair','goals/scenery refs not scoped');
});
test('generation: enemies, zones, cameras and portal destinations translate correctly',()=>{
  const room=ByteRunner.maps.clone(generationRoom);room.id='rich-special';room.mechanics=[
    {id:'interfaces',type:'portals',links:[{id:'link',x:80,y:240,width:32,height:64,to:{room:'right',anchor:'entry'},requires:{component:'repair'}}]},
    {id:'wind',type:'environment',zones:[{id:'zone',x:400,y:224,width:120,height:96,forceX:20,disabledWhen:{flag:'offline'}}]},
    {id:'security',type:'security-grid',cameras:[{id:'camera',x:100,y:40,period:4,windup:1,region:{x:64,y:192,width:200,height:128},disabledWhen:{component:'repair'}}]}
  ];generation.registerRoom(room);
  const plan=ByteRunner.maps.clone(generationPlan);plan.size={width:1408,height:424};plan.rooms[0]={id:'left',template:'rich-special',x:64,y:64};plan.rooms[1].x=704;plan.rooms[1].y=64;
  const result=generation.compile(plan),enemy=result.entities.enemies[0];
  assert(enemy.x===512&&enemy.y===360&&enemy.groundY===384&&enemy.patrolMin===424&&enemy.navigationBounds.left===404&&enemy.activationRegion.x===384,'enemy bounds not translated');
  assert(result.mechanics[0].links[0].to.x===768&&result.mechanics[0].links[0].to.y===336,'cross-room portal target');
  assert(result.mechanics[1].zones[0].disabledWhen.flag==='left:offline'&&result.mechanics[1].zones[0].y===288,'environment transform');
  assert(result.mechanics[2].cameras[0].region.x===128&&result.mechanics[2].cameras[0].disabledWhen.component==='left:repair','security transform');
});
test('generation: malformed rooms and invalid layouts fail before engine loading',()=>{
  assert(generation.validation.room(null).length&&generation.validation.plan(null).length,'null accepted');
  assert(generation.validation.room({...generationRoom,layers:{}}).length,'invalid layers accepted');
  const unknown=ByteRunner.maps.clone(generationPlan);unknown.theme='toString';generationReject(()=>generation.compile(unknown),'theme');
  for(const [mutate,error] of [
    [p=>p.rooms[1].x=600,'Overlapping'],[p=>p.rooms[1].y=1,'outside'],[p=>p.links=[],'Disconnected'],
    [p=>p.links[0].to.socket='missing','socket'],[p=>p.exit.anchor='constructor','anchor'],[p=>p.rooms[1].generator='absent','Unknown'],[p=>p.rooms[1].id='left','placement']
  ]){const plan=ByteRunner.maps.clone(generationPlan);mutate(plan);generationReject(()=>generation.compile(plan),error);}
});
test('generation: cross-room repairs and explicitly global flags keep their scope',()=>{
  const room=ByteRunner.maps.clone(generationRoom);room.id='cross-room';room.entities.gates[0].opensWhen={all:[{component:'left:repair'},{flag:'global:power'}]};
  room.entities.interactives=[{id:'power',x:224,y:280,width:32,height:40,type:'switch',flag:'global:power'}];generation.registerRoom(room);
  const plan=ByteRunner.maps.clone(generationPlan);plan.rooms[1]={id:'right',template:'cross-room',x:640,y:0};const result=generation.compile(plan);
  assert(result.entities.gates[1].opensWhen.all[0].component==='left:repair'&&result.entities.gates[1].opensWhen.all[1].flag==='global:power','cross-room condition changed');
  assert(result.entities.interactives[0].flag==='global:power','global flag localized');
});
test('generation: missing repair references and conflicting assets are rejected',()=>{
  const bad=ByteRunner.maps.clone(generationRoom);bad.id='bad-reference';bad.entities.platforms[0].requiresComponentId='absent';generation.registerRoom(bad);
  const plan=ByteRunner.maps.clone(generationPlan);plan.rooms[0].template='bad-reference';generationReject(()=>generation.compile(plan),'unknown component');
  for(const [id,src] of [['asset-one','a.png'],['asset-two','b.png']]){const room=ByteRunner.maps.clone(generationRoom);room.id=id;room.assets=[{id:'shared',src}];generation.registerRoom(room);}
  plan.rooms[0].template='asset-one';plan.rooms[1]={id:'right',template:'asset-two',x:640,y:0};generationReject(()=>generation.compile(plan),'Conflicting asset');
});
test('generation: compiled room runs with existing movement, repairs and conditional geometry',()=>{
  setup(0);const definition=generation.compile(generationPlan);loadMap(definition,true);running=true;campaignStarted=false;xpRequired=999999;
  try {
    assert(solids().some(s=>s.id==='left:lock')&&!platformShape(definition.entities.platforms[0]),'initial gate/platform condition');
    keys.add('d');movePlayer(.25);keys.clear();assert(player.x>100&&player.grounded,'compiled floor does not support movement');
    keys.add('e');updateRepair(0);assert(repairSession?.blocksWorld,'compiled component cannot open minigame');
    keys.add('1');updateRepair(.02);
    assert(components[0].repaired&&xp>=30&&!solids().some(s=>s.id==='left:lock')&&platformShape(definition.entities.platforms[0]),'compiled repair does not unlock geometry');
    levelRuntime.setFlag('left:test');const saved=levelRuntime.save();levelRuntime.setFlag('left:test',false);levelRuntime.restore(saved);assert(levelRuntime.getFlag('left:test'),'runtime persistence broken');
  }finally{setup(0);}
});
running=false;
