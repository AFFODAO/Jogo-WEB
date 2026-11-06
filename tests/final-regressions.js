for(const west of ['corridor','door','tunnel','bridge']) {
  test('final regression: narrow-tunnel head clearance / '+west,()=>{
    const room=ByteRunner.proceduralMaps.roomGeometry({type:'repair',ports:{west,east:'corridor'},tier:1,rest:true,variant:0});room.id='final-clearance-'+west;
    ByteRunner.mapGeneration.registerRoom(room);
    const map=ByteRunner.mapGeneration.compile({id:'clearance-'+west,name:'Clearance',theme:'hardware',seed:west,size:{width:768,height:768},rooms:[{id:'r',template:room.id,x:0,y:0}],links:[],start:{room:'r',anchor:'entry'},exit:{room:'r',anchor:'exit'}});
    setup(0);loadMap(map,true);campaignStarted=false;running=true;xpRequired=999999;
    const nodes=reachability();assert(nodes.some(n=>n.id==='r:upper-0'),'head trapped under west lintel '+west);
  });
}
for(const tier of [1,2,3])test('final regression: north shaft leaves required step clear / tier '+tier,()=>{
  const room=ByteRunner.proceduralMaps.roomGeometry({type:'combat',ports:{west:'corridor',east:'corridor',north:'shaft',south:'shaft'},tier});room.id='final-north-clearance-'+tier;
  ByteRunner.mapGeneration.registerRoom(room);
  const map=ByteRunner.mapGeneration.compile({id:room.id,name:'North clearance',theme:'hardware',seed:String(tier),size:{width:768,height:768},rooms:[{id:'r',template:room.id,x:0,y:0}],links:[],start:{room:'r',anchor:'entry'},exit:{room:'r',anchor:'exit'}});
  setup(0);loadMap(map,true);campaignStarted=false;running=true;xpRequired=999999;
  assert(reachability().some(n=>n.id==='r:required-step'),'required step shadowed by vertical riser');
});
for(const west of ['door','tunnel'])test('final regression: return from right through north room / '+west,()=>{
  const room=ByteRunner.proceduralMaps.roomGeometry({type:'parkour',ports:{west,east:'corridor',north:'shaft'},tier:2});room.id='final-return-clearance-'+west;
  ByteRunner.mapGeneration.registerRoom(room);
  const map=ByteRunner.mapGeneration.compile({id:room.id,name:'Return clearance',theme:'hardware',seed:west,size:{width:768,height:768},rooms:[{id:'r',template:room.id,x:0,y:0}],links:[],start:{room:'r',anchor:'exit'},exit:{room:'r',anchor:'entry'}});
  setup(0);loadMap(map,true);campaignStarted=false;running=true;xpRequired=999999;
  assert(reachability().some(n=>n.id==='r:floor-left'),'upper ledge and lintel seal return chute');
});
test('final regression: dependency validator honors runtime condition precedence',()=>{
  const map=ByteRunner.maps.clone(ByteRunner.proceduralMaps.generateGameplay({seed:'condition-priority'}));
  const id=map.generation.gameplay.mandatoryRepairs[0],c=map.entities.components.find(c=>c.id===id);
  c.requires={all:[{component:id}],not:{component:id}};
  setup(0);loadMap(map,true);campaignStarted=false;assert(!levelRuntime.matches(c.requires),'runtime condition precedence changed');
  assert(ByteRunner.proceduralMaps.validateGameplay(map).some(e=>e.includes('cyclic')),'validator falsely certifies circular all/not condition');
});
test('final regression: encounter validator recomputes actual entity cost',()=>{
  const map=ByteRunner.maps.clone(ByteRunner.proceduralMaps.generateGameplay({seed:'budget-priority',difficulty:1}));
  const room=map.generation.gameplay.rooms.find(r=>r.type==='combat'),enemy=map.entities.enemies.find(e=>e.id===room.enemies[0]);enemy.type='armored';
  assert(ByteRunner.proceduralMaps.validateGameplay(map).some(e=>e.includes('budget')),'stale budget metadata hides excess enemy cost');
});
test('final regression: respawn cannot depend on an undiscovered secret platform',()=>{
  const map=ByteRunner.maps.clone(ByteRunner.proceduralMaps.generateGameplay({seed:'conditional-respawn'}));
  const p=map.entities.platforms.find(p=>p.id.endsWith(':secret-cache-step'));map.map.checkpoints=[{x:p.x-38,y:p.y}];
  assert(ByteRunner.proceduralMaps.validateGameplay(map).some(e=>e==='unsafe checkpoint'),'conditional platform incorrectly certified as permanent respawn support');
});
running=false;
