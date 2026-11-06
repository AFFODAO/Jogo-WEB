/* Presentation profiles only. These never modify phase geometry or camera state. */
(() => {
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  function profile(theme,number,background,accent,motifs){
    return freeze({theme,phaseId:'phase-'+String(number).padStart(2,'0'),asset:'vista-'+String(number).padStart(2,'0'),background,accent,motifs,
      tileSize:128,variants:8,reducedLayerCount:2,verticalMultiplier:.45,
      planes:[{name:'distant',rateX:.08,rateY:.08,scale:2,opacity:.5,frame:0},
        {name:'middle',rateX:.22,rateY:.22,scale:2,opacity:.48,frame:8},
        {name:'near',rateX:.4,rateY:.4,scale:1,opacity:.32,frame:16}],
      particles:{count:24,rateX:.13,rateY:.11}});
  }
  function hardwareProfile(){
    return freeze({...profile('hardware',1,'#071719','#60eab4',['circuits','components']),verticalMultiplier:1,
      planes:[{name:'distant',rateX:.025,rateY:.02,scale:2,opacity:.55,frame:0},
        {name:'middle',rateX:.08,rateY:.065,scale:1,opacity:.42,frame:8},
        {name:'near',rateX:.22,rateY:.17,scale:1,opacity:.34,frame:16},
        {name:'close',rateX:.6,rateY:.48,scale:1,opacity:.24,frame:24}],
      particles:{count:10,rateX:.32,rateY:.25,ambient:true,pulsePeriod:8}});
  }
  const profiles=freeze({
    hardware:hardwareProfile(),
    software:profile('software',2,'#100e22','#bc9afa',['windows','interfaces']),
    switch:profile('switch',3,'#061923','#62d9ed',['ethernet','backplane']),
    router:profile('router',4,'#091626','#7bbfff',['tunnels','data-flow']),
    wifi:profile('wifi',5,'#071b2a','#83e8f5',['antennas','signals']),
    cabling:profile('cabling',6,'#141c23','#e5b675',['ducts','industrial']),
    dhcp:profile('dhcp',7,'#081e1a','#96e5ad',['networks','terminals']),
    dns:profile('dns',8,'#141329','#c8b0f5',['domains','servers']),
    firewall:profile('firewall',9,'#200c15','#ff736d',['fortress','security']),
    servers:profile('servers',10,'#061522','#67dbff',['datacenter','corrupted-core'])
  });
  ByteRunner.parallaxProfiles=Object.freeze({profiles,resolve:phase=>profiles[typeof phase==='string'?phase:phase?.theme]||null});
})();
