/* Explicit development overlay. Read-only; no teleports, goal flags or save writes. */
(() => {
  const api=ByteRunner,enabled=new URLSearchParams(location.search).has('dev');
  if(!enabled){api.mapDebug=Object.freeze({enabled:false});return;}
  let latest=null,analysis=null,busy=false,shown=true,lastDraw=0,stamp='';
  const panel=document.createElement('aside');panel.id='map-debug';panel.style.cssText='position:fixed;right:8px;top:8px;width:min(560px,94vw);max-height:94vh;overflow:auto;z-index:9999;background:#071522f5;color:#dce9ef;border:2px solid #79d9ca;padding:10px;font:12px monospace';
  const title=document.createElement('strong');title.textContent='BYTE RUNNER // DEBUG SOMENTE LEITURA // F9';panel.append(title);
  const info=document.createElement('p');panel.append(info);
  const controls=document.createElement('div'),options={};panel.append(controls);
  for(const [key,label] of [['collisions','Colisões'],['rooms','Salas'],['connections','Conexões'],['goals','Objetivos'],['checkpoints','Checkpoints'],['unreachable','Não comprovadas']]) {
    const item=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=true;input.dataset.layer=key;options[key]=input;item.append(input,document.createTextNode(label+' '));controls.append(item);input.onchange=()=>paint();
  }
  const button=document.createElement('button');button.textContent='Analisar acessibilidade';button.dataset.action='analyze';controls.append(button);
  const exportButton=document.createElement('button');exportButton.textContent='Exportar PNG';controls.append(exportButton);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;canvas.style.cssText='width:100%;height:auto;image-rendering:pixelated;margin-top:8px';panel.append(canvas);
  const status=document.createElement('p');status.textContent='Mapa inteiro. Verde: apoio alcançado; laranja: acesso não comprovado nesta fotografia. Vermelho: sala isolada.';panel.append(status);document.body.append(panel);
  panel.addEventListener('keydown',e=>e.stopPropagation());
  window.addEventListener('keydown',e=>{if(e.key==='F9'){e.preventDefault();e.stopImmediatePropagation();shown=!shown;panel.hidden=!shown;}});
  function paint() {
    if(!latest||!shown)return;const {phase,shapes,player}=latest,c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#08101c';c.fillRect(0,0,1024,640);
    const scale=Math.min(1000/phase.map.width,590/phase.map.height),ox=(1024-phase.map.width*scale)/2,oy=32;
    const rect=(r,color,outline=false)=>{c[outline?'strokeStyle':'fillStyle']=color;c[outline?'strokeRect':'fillRect'](ox+r.x*scale,oy+r.y*scale,Math.max(1,(r.w??r.width)*scale),Math.max(2,(r.h??r.height)*scale));};
    if(options.rooms.checked)for(const r of phase.generation?.rooms||[]){rect(r,analysis?.unreachableRooms.includes(r.id)?'#fa6671':'#456476',true);c.fillStyle='#9ebcca';c.font='10px monospace';c.fillText(r.id,ox+r.x*scale+3,oy+r.y*scale+12);}
    if(options.collisions.checked)for(const s of shapes)rect(s,s.kind==='platform'?'#65bad7':s.collision==='dangerous'?'#ff6c92':'#b6bdcf');
    if(options.connections.checked) {
      const rooms=phase.generation?.rooms||[];
      for(const e of phase.generation?.graph?.edges||[]){const a=rooms.find(r=>r.id===e.from),b=rooms.find(r=>r.id===e.to);if(!a||!b)continue;c.strokeStyle='#41987d';c.beginPath();c.moveTo(ox+(a.x+a.width/2)*scale,oy+(a.y+a.height/2)*scale);c.lineTo(ox+(b.x+b.width/2)*scale,oy+(b.y+b.height/2)*scale);c.stroke();}
      const active=new Set(latest.links.map(l=>l.id));for(const link of phase.mechanics.filter(m=>m.type==='portals').flatMap(m=>m.links)){c.strokeStyle=active.has(link.id)?'#95f0cf':'#724f73';c.setLineDash(active.has(link.id)?[]:[4,4]);c.beginPath();c.moveTo(ox+link.x*scale,oy+link.y*scale);c.lineTo(ox+link.to.x*scale,oy+link.to.y*scale);c.stroke();}c.setLineDash([]);
    }
    if(options.goals.checked){for(const comp of phase.entities.components)rect({...comp,width:38,height:44},latest.repaired.includes(comp.id)?'#78e09a':'#ffc36c');rect(phase.map.exit,'#ffe85d',true);rect({x:phase.map.start.x,y:phase.map.start.y,width:34,height:48},'#9effd5');}
    if(options.checkpoints.checked)for(const point of phase.map.checkpoints)rect({x:point.x,y:point.y-48,width:34,height:48},'#75ffad',true);
    if(analysis&&options.unreachable.checked){for(const n of analysis.reached)rect({x:n.a,y:n.y+48,width:n.z-n.a+34,height:4},'#67d9a2');for(const n of analysis.unproven)rect({x:n.a,y:n.y+48,width:n.z-n.a+34,height:4},'#ffa65e');}
    rect({x:player.x,y:player.y,width:34,height:48},'#ffffff');
    c.fillStyle='#deedf2';c.font='12px monospace';c.fillText(phase.name+' // seed '+(phase.generation?.seed??'autoral'),12,18);
  }
  button.onclick=async()=>{
    if(!latest||busy)return;busy=true;button.disabled=true;status.textContent='Analisando com atributos básicos; colisões e plataformas congeladas nesta fotografia…';
    const current=latest;
    try{const result=await api.mapAudit.analyze(current.phase,current.shapes,current.links);if(latest.phase===current.phase&&stamp===current.stamp){analysis=result;status.textContent='Saída no modelo base: '+(result.exitReached?'comprovada':'não comprovada')+' // salas sem acesso: '+result.unreachableRooms.join(', ')+' // apoios não comprovados: '+result.unproven.length+'. Móveis, efeitos ambientais e dano exigem teste no jogo.';}}
    catch(e){status.textContent='Falha da análise: '+e.message;}finally{busy=false;button.disabled=false;paint();}
  };
  exportButton.onclick=()=>{const a=document.createElement('a');a.download='byte-runner-debug.png';a.href=canvas.toDataURL();a.click();};
  api.mapDebug=Object.freeze({enabled:true,get analysis(){return analysis;},frame(context){
    const next=context.phase.id+':'+context.repaired.join('|')+':'+context.links.map(l=>l.id).join('|')+':'+context.shapes.map(s=>s.id).join('|');
    if(latest?.phase!==context.phase||next!==stamp){if(analysis)status.textContent='Estado alterado. Execute uma nova análise.';analysis=null;stamp=next;}latest={...context,stamp:next};
    if(performance.now()-lastDraw>200){lastDraw=performance.now();info.textContent='Seed: '+(context.phase.generation?.seed??'autoral')+' | '+context.phase.map.width+'×'+context.phase.map.height+' | '+context.shapes.length+' colisões | cache: '+context.cacheSize+'/96';paint();}
  }});
})();
