(() => {
  'use strict';
  const api=ByteRunner;
  const phasePicker=document.getElementById('phase');
  const componentPicker=document.getElementById('component');
  const host=document.getElementById('repairContent');
  const panel=document.getElementById('repairPanel');
  const query=new URLSearchParams(location.search);
  const enginePicker=document.getElementById('repairEngine');
  enginePicker.value=query.get('repairs')==='legacy'?'legacy':'v2';
  const engine=()=>enginePicker.value==='legacy'?api.repairChallenges:api.repairV2;
  const previewWidth=Number(query.get('width'));
  if(previewWidth>0){
    document.body.style.maxWidth=previewWidth+'px';
    document.body.style.marginInlineStart='0';
  }

  const phases=api.maps.campaign(api.campaign);
  let phase,assignments,session,last=performance.now();
  const option=(value,text)=>new Option(text,value);
  phases.forEach((map,i)=>phasePicker.add(option(i,map.name)));
  phasePicker.value=String(Math.max(0,Math.min(phases.length-1,Math.floor(Number(query.get('phase'))||0))));

  function open(){
    session?.dispose();
    const component=phase.entities.components.find(item=>item.id===componentPicker.value);
    const spec=assignments.get(component.id);
    session=api.repairs.create(spec,{component,standalone:true});
    panel.dataset.repairType=spec.type;
    document.getElementById('repairPrompt').textContent=session.label();
    session.mount(host);
  }

  function selectPhase(initial=false){
    const index=Number(phasePicker.value);
    phase=phases[index];
    assignments=engine().assign(phase,index);
    componentPicker.replaceChildren(...phase.entities.components.map(component=>{
      const type=assignments.get(component.id).type;
      const name=engine().catalog.find(entry=>entry.id===type)?.name||type;
      return option(component.id,component.label+' · '+name);
    }));
    if(initial&&assignments.has(query.get('component')))componentPicker.value=query.get('component');
    open();
  }

  phasePicker.addEventListener('change',()=>{selectPhase();phasePicker.focus();});
  componentPicker.addEventListener('change',()=>{open();componentPicker.focus();});
  enginePicker.addEventListener('change',()=>{selectPhase();enginePicker.focus();});
  document.getElementById('cancelRepairButton').addEventListener('click',open);
  panel.addEventListener('keydown',event=>{if(event.key!=='Tab')session.handleKey(event);});
  function frame(now){
    session.update(Math.min(.05,(now-last)/1000));
    last=now;
    requestAnimationFrame(frame);
  }
  selectPhase(true);
  requestAnimationFrame(frame);
})();
