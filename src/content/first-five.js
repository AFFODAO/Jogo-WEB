// Theme-specific behavior and vector scenery for the five rebuilt worlds.
(() => {
  'use strict';
  const api=window.ByteRunner;
  const inside=(p,r)=>p.x+p.width>r.x&&p.x<r.x+r.width&&p.y+p.height>r.y&&p.y<r.y+r.height;
  const visible=(r,v)=>r.x+r.width>=v.x&&r.x<=v.x+v.width&&r.y+r.height>=v.y&&r.y<=v.y+v.height;
  const enabled=(r,state)=>state.matches(r.requires)&&!(r.disabledWhen&&state.matches(r.disabledWhen));
  api.levels.registerMechanic('environment',(spec,state)=>({
    modifiers() {
      const result={speedMultiplier:1,fireIntervalMultiplier:1,projectileSpeedMultiplier:1,forceX:0};
      for (const zone of spec.zones) if(enabled(zone,state)&&inside(state.context.player(),zone)) {
        for(const key of ['speedMultiplier','fireIntervalMultiplier','projectileSpeedMultiplier'])result[key]*=zone[key]??1;
        result.forceX+=zone.forceX || 0;result.label=zone.label;
      }
      return result;
    },
    draw(ctx,view,time) {
      for (const z of spec.zones) {
        if(!enabled(z,state)||!visible(z,view))continue;
        ctx.save();ctx.fillStyle=z.forceX?'rgba(124,255,218,.07)':z.speedMultiplier>1?'rgba(85,255,200,.06)':'rgba(220,114,255,.09)';
        ctx.fillRect(z.x,z.y,z.width,z.height);ctx.strokeStyle=z.forceX?'#73f7cf':z.speedMultiplier>1?'#65f3bc':'#bf8ee8';
        ctx.globalAlpha=.5;ctx.setLineDash([5,7]);ctx.strokeRect(z.x,z.y,z.width,z.height);ctx.setLineDash([]);
        ctx.beginPath();
        for(let row=0;row<z.height;row+=45){const y=z.y+row;const shift=(time*32)%45;ctx.moveTo(z.x,y+shift);ctx.lineTo(z.x+Math.min(24,z.width),y+shift-8);}
        ctx.stroke();ctx.globalAlpha=.9;ctx.font='bold 11px monospace';ctx.fillStyle=z.forceX?'#8af7d5':'#dcbbff';
        ctx.fillText(z.label || 'INTERFERÊNCIA',z.x+8,z.y+18,Math.max(40,z.width-16));ctx.restore();
      }
    }
  }));
  api.levels.registerMechanic('portals',(spec,state)=>{
    let cooldown=0,previous=false;
    return {
      connections:()=>spec.links.filter(link=>state.matches(link.requires)),
      update(dt,input) {
        cooldown=Math.max(0,cooldown-dt);
        const pressed=input.keys.has('e')&&!previous;previous=input.keys.has('e');
        if(!pressed||cooldown>0||input.repairNearby)return;
        const p=state.context.player();
        const link=spec.links.find(link=>state.matches(link.requires)&&Math.hypot(p.x+p.width/2-link.x-link.width/2,p.y+p.height/2-link.y-link.height/2)<72);
        if(!link)return;
        cooldown=.5;state.setFlag('portal:'+link.id);state.context.teleportPlayer(link.to.x,link.to.y);
        state.context.feedback('INTERFACE // '+link.label,{x:link.to.x,y:link.to.y});
      },
      draw(ctx,view,time) {
        for(const link of spec.links) {
          if(!visible(link,view))continue;
          const active=state.matches(link.requires);ctx.save();ctx.strokeStyle=active?'#a3ddff':'#f07b9e';ctx.fillStyle=active?'#183e5e':'#381e3d';ctx.lineWidth=3;
          ctx.beginPath();ctx.roundRect(link.x,link.y,link.width,link.height,10);ctx.fill();ctx.stroke();
          ctx.globalAlpha=active ? .4+.2*Math.sin(time*3) : .3;ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(link.x+9,link.y+12,link.width-18,link.height-24);ctx.globalAlpha=1;
          ctx.fillStyle=active?'#d3edff':'#ffa1b8';ctx.font='bold 10px monospace';ctx.textAlign='center';
          ctx.fillText((active?'E // ':'BLOQUEADO // ')+link.label,link.x+link.width/2,link.y-12);ctx.restore();
        }
      }
    };
  });
  api.visuals.registerLayer('computer-world',(ctx,layer,view,time)=>{
    for(const item of layer.items) {
      if(!visible(item,view)||(item.requires&&!view.runtime.matches(item.requires)))continue;
      const {x,y,width:w,height:h,kind,label}=item;
      ctx.save();ctx.lineWidth=2;ctx.font='bold 13px monospace';ctx.fillStyle='#112f3a';ctx.strokeStyle='#69b7b5';
      if(kind==='board') {
        ctx.fillStyle='#0b2929';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#256251';ctx.lineWidth=2;
        for(let c=x+28;c<x+w;c+=104){ctx.beginPath();ctx.moveTo(c,y+24);ctx.lineTo(c,y+h-42);ctx.lineTo(c+60,y+h-42);ctx.stroke();}
        ctx.fillStyle='#367f67';for(let c=x+28;c<x+w;c+=104)ctx.fillRect(c-3,y+30,6,6);
      } else if(kind==='cpu') {
        ctx.fillStyle='#615741';ctx.fillRect(x-14,y+9,w+28,h-8);ctx.fillStyle='#203e41';ctx.fillRect(x,y,w,h);
        ctx.strokeStyle='#d8c47e';ctx.strokeRect(x+12,y+14,w-24,h-28);
        for(let i=10;i<w;i+=22){ctx.fillStyle='#d6b868';ctx.fillRect(x+i,y+h-4,10,12);}
      } else if(kind==='ram') {
        ctx.fillStyle='#246946';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#84d68e';ctx.strokeRect(x,y,w,h);
        ctx.fillStyle='#0d2527';for(let row=0;row<4;row++){ctx.fillRect(x+14,y+24+row*58,w-28,40);}
        ctx.fillStyle='#d3b56a';for(let i=8;i<w;i+=18)ctx.fillRect(x+i,y+h-14,10,20);
      } else if(kind==='gpu') {
        ctx.fillStyle='#244c56';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#70b8ce';ctx.strokeRect(x,y,w,h);
        for(let fan=0;fan<2;fan++){ctx.save();ctx.translate(x+80+fan*140,y+h*.55);ctx.rotate(time*.7);ctx.fillStyle='#0a1d28';ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#558993';for(let blade=0;blade<5;blade++){ctx.rotate(Math.PI*2/5);ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(38,12);ctx.stroke();}ctx.restore();}
      } else if(kind==='fan') {
        ctx.translate(x+w/2,y+h/2);ctx.strokeStyle='#91edda';ctx.beginPath();ctx.arc(0,0,w*.45,0,Math.PI*2);ctx.stroke();ctx.rotate(time*4);
        for(let b=0;b<5;b++){ctx.rotate(Math.PI*2/5);ctx.fillStyle='#317366';ctx.fillRect(6,-8,w*.3,16);}ctx.restore();continue;
      } else if(kind==='window-room') {
        ctx.fillStyle='#1c203a';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#6763a0';ctx.strokeRect(x,y,w,h);ctx.fillStyle='#58518e';ctx.fillRect(x,y,w,28);
        ctx.fillStyle='#d4c9ff';ctx.fillText(label,x+14,y+19);for(let i=0;i<3;i++){ctx.fillStyle=['#ff83ab','#ffd17c','#85e8c1'][i];ctx.fillRect(x+w-61+i*18,y+8,9,9);}
        ctx.globalAlpha=.17;ctx.strokeStyle='#cabaff';for(let row=50;row<h;row+=40){ctx.beginPath();ctx.moveTo(x+22,y+row);ctx.lineTo(x+w-24,y+row);ctx.stroke();}ctx.restore();continue;
      } else if(kind==='folder') {
        ctx.fillStyle='#83729f';ctx.fillRect(x,y,w,h);ctx.fillRect(x,y-10,w*.42,12);
      } else if(kind==='process') {
        ctx.fillStyle='#433d74';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#b29bed';ctx.strokeRect(x,y,w,h);
      } else if(kind==='ethernet') {
        ctx.fillStyle='#55626b';ctx.fillRect(x-12,y,w+24,h);ctx.fillStyle='#0b1a23';ctx.fillRect(x+12,y+8,w-24,h-20);ctx.strokeStyle='#89c9d5';ctx.strokeRect(x+12,y+8,w-24,h-20);
        for(let pin=0;pin<8;pin++){ctx.fillStyle='#e7bd65';ctx.fillRect(x+30+pin*(w-60)/8,y+18,12,h*.5);}
      } else if(kind==='backplane') {
        ctx.fillStyle='#102e3c';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#2e6978';ctx.strokeRect(x,y,w,h);
        for(let i=35;i<w;i+=70){ctx.strokeStyle='#306373';ctx.beginPath();ctx.moveTo(x+i,y+20);ctx.lineTo(x+i,y+h-20);ctx.stroke();}
      } else if(kind==='tunnel') {
        ctx.fillStyle='#132437';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#344b62';ctx.strokeRect(x,y,w,h);
        ctx.setLineDash([14,10]);ctx.beginPath();ctx.moveTo(x+20,y+h*.5);ctx.lineTo(x+w-20,y+h*.5);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#8bb7e0';ctx.fillText(label,x+22,y+26);ctx.restore();continue;
      } else if(kind==='antenna') {
        ctx.fillStyle='#23485f';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#a1e8ff';ctx.strokeRect(x,y,w,h);
        ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w/2,y-58);ctx.stroke();
        for(let ring=0;ring<3;ring++){ctx.globalAlpha=.6-ring*.14;ctx.beginPath();ctx.arc(x+w/2,y-58,18+ring*16+Math.sin(time*2)*3,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}ctx.globalAlpha=1;
      } else if(kind==='cache') {
        ctx.strokeStyle='#d7c77a';ctx.setLineDash([4,5]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
      }
      ctx.fillStyle=kind==='cache'?'#e9d593':'#b9e6e8';ctx.fillText(label,x+10,y+Math.min(h-8,26),Math.max(30,w-20));ctx.restore();
    }
  });
})();
