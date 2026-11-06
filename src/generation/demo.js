// Explicit preview only; the authored campaign and its storage stay available.
(() => {
  const query=new URLSearchParams(location.search);
  if(!query.has('procedural'))return;
  try{
    const options={seed:query.get('procedural')||'hardware-01',roomCount:Number(query.get('rooms')||12),difficulty:Number(query.get('difficulty')||1),optionalRatio:Number(query.get('optional')||.35),portals:query.get('portals')==='1'};
    const gameplay=query.get('gameplay')!=='0';if(gameplay)options.theme=query.get('theme')||'hardware';
    if(gameplay&&!query.has('difficulty'))delete options.difficulty;
    const generated=gameplay?ByteRunner.proceduralMaps.generateGameplay(options):ByteRunner.proceduralMaps.generate(options);
    const themeIndex=ByteRunner.environmentArt.themes.indexOf(gameplay?options.theme:'hardware');
    const definition=ByteRunner.maps.clone(generated),authored=ByteRunner.maps.get('phase-'+String(themeIndex+1).padStart(2,'0'));
    definition.assets=ByteRunner.maps.clone(authored.assets);definition.palette=[...authored.palette];
    ByteRunner.maps.register(definition);
    ByteRunner.campaign=Object.freeze([definition.id,...ByteRunner.campaign.slice(1)]);
    ByteRunner.proceduralDemo=Object.freeze({storageKey:(gameplay?'byteRunner.rooms.v1:':'byteRunner.procedural.v1:')+JSON.stringify(generated.generation.graph.options),map:generated});
    const banner=document.createElement('div');banner.textContent='PREVIA PROCEDURAL // seed '+options.seed+' // '+options.roomCount+' salas';banner.setAttribute('role','status');banner.style.cssText='position:fixed;left:8px;bottom:8px;z-index:20;max-width:90vw;background:#06191b;color:#63f3bb;padding:6px;font:12px monospace;pointer-events:none';document.body.appendChild(banner);
  }catch(error){
    console.error('Procedural preview:',error);
    const notice=document.createElement('p');notice.textContent='Previa procedural indisponivel: '+error.message+'. A campanha original foi preservada.';notice.setAttribute('role','alert');document.body.prepend(notice);
  }
})();
