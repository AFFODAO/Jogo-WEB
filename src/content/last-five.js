// World-specific surveillance and authored vector scenery for stages 6–10.
(() => {
  'use strict';
  const api=window.ByteRunner;
  api.levels.registerMechanic('security-grid',(spec,state)=>{
    let time=0;
    const locks=new Map();
    return {
      update(dt) {
        time+=dt;const p=state.context.player(),px=p.x+p.width/2,py=p.y+p.height/2;
        for(const camera of spec.cameras) {
          if(camera.disabledWhen&&state.matches(camera.disabledWhen))continue;
          const cycle=Math.floor(time/camera.period),phase=time%camera.period;
          const r=camera.region,inside=px>=r.x&&px<=r.x+r.width&&py>=r.y&&py<=r.y+r.height;
          let lock=locks.get(camera.id);
          if(phase<camera.windup&&inside&&lock?.cycle!==cycle){lock={cycle,x:px,y:py,shot:false};locks.set(camera.id,lock);}
          if(lock?.cycle===cycle&&!lock.shot&&phase>=camera.windup&&phase<camera.windup+1) {
            lock.shot=true;
            state.context.fireEnemyProjectile({x:camera.x,y:camera.y,radius:12,damage:10,projectileSpeed:260,color:'#ff987c'},lock.x,lock.y);
          }
        }
      },
      draw(ctx,view) {
        for(const camera of spec.cameras) {
          const r=camera.region;
          if(r.x+r.width<view.x||r.x>view.x+view.width||r.y+r.height<view.y||camera.y>view.y+view.height)continue;
          const disabled=camera.disabledWhen&&state.matches(camera.disabledWhen),phase=time%camera.period;
          const color=disabled?'#6ca994':phase<camera.windup?'#ffdf91':phase<camera.windup+1?'#ff6b7c':'#a27781';
          ctx.save();ctx.fillStyle=disabled?'#193b33':'#4e293b';ctx.strokeStyle=color;ctx.lineWidth=2;
          ctx.fillRect(camera.x-18,camera.y-12,36,24);ctx.strokeRect(camera.x-18,camera.y-12,36,24);
          ctx.fillStyle=color;ctx.fillRect(camera.x-5,camera.y-5,10,10);
          if(!disabled){ctx.globalAlpha=.1;ctx.beginPath();ctx.moveTo(camera.x,camera.y);ctx.lineTo(r.x,r.y+r.height);ctx.lineTo(r.x+r.width,r.y+r.height);ctx.closePath();ctx.fill();ctx.globalAlpha=.5;ctx.setLineDash([5,6]);ctx.stroke();ctx.setLineDash([]);}
          ctx.globalAlpha=1;ctx.fillStyle=color;ctx.font='bold 10px monospace';ctx.textAlign='center';
          ctx.fillText(disabled?'CÂMERA OFFLINE':phase<camera.windup?'AVISO // VARREDURA':'CÂMERA // CICLO '+camera.period+'s',camera.x,camera.y-20);ctx.restore();
        }
      }
    };
  });
  api.visuals.registerLayer('infrastructure-world',(ctx,layer,view,time,visuals)=>{
    for(const item of layer.items) {
      const {x,y,width:w,height:h,kind,label}=item;
      if(x+w<view.x||x>view.x+view.width||y+h<view.y||y>view.y+view.height)continue;
      if(api.pixelArt?.feature(ctx,item,view,time,visuals,5+Math.max(0,['cabling','dhcp','dns','firewall','servers'].indexOf(layer.theme))))continue;
      ctx.save();ctx.lineWidth=2;ctx.font='bold 14px monospace';ctx.fillStyle='#102a38';ctx.strokeStyle='#5792a4';
      if(kind==='building') {
        ctx.fillStyle='#202b32';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#51606a';ctx.strokeRect(x,y,w,h);
        for(let row=0;row<h;row+=200){ctx.strokeStyle='#39464c';ctx.beginPath();ctx.moveTo(x,y+row);ctx.lineTo(x+w,y+row);ctx.stroke();}
      } else if(kind==='duct') {
        ctx.fillStyle='#17242a';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#807862';ctx.strokeRect(x,y,w,h);
        for(let row=25;row<h;row+=60){ctx.beginPath();ctx.moveTo(x+8,y+row);ctx.lineTo(x+32,y+row);ctx.moveTo(x+w-32,y+row);ctx.lineTo(x+w-8,y+row);ctx.stroke();}
      } else if(kind==='lift-shaft') {
        ctx.fillStyle='#0f1d25';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#977c52';ctx.strokeRect(x,y,w,h);
        for(let rail=30;rail<w;rail+=w-60){ctx.beginPath();ctx.moveTo(x+rail,y+10);ctx.lineTo(x+rail,y+h-10);ctx.stroke();}
      } else if(kind==='rack'||kind==='server-tower') {
        ctx.fillStyle='#1b3946';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#7aafba';ctx.strokeRect(x,y,w,h);
        for(let row=20;row<h-10;row+=44){ctx.fillStyle='#102832';ctx.fillRect(x+12,y+row,w-24,32);ctx.fillStyle='#72dfb7';ctx.fillRect(x+23,y+row+10,5,5);ctx.fillStyle='#42778e';ctx.fillRect(x+40,y+row+11,w-65,3);}
      } else if(kind==='address-sector') {
        ctx.fillStyle='#123830';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#5f9d75';ctx.strokeRect(x,y,w,h);ctx.fillStyle='#27604b';ctx.fillRect(x,y,w,34);
        ctx.fillStyle='#c3f2cf';ctx.fillText(label,x+14,y+24);
        ctx.globalAlpha=.45;ctx.font='12px monospace';for(let row=72;row<h-10;row+=52){ctx.fillText('IP / MÁSCARA / GATEWAY',x+22,y+row);ctx.beginPath();ctx.moveTo(x+22,y+row+12);ctx.lineTo(x+w-22,y+row+12);ctx.stroke();}ctx.restore();continue;
      } else if(kind==='conflict') {
        ctx.fillStyle='#ff98a6';ctx.fillText(label,x,y+20);ctx.restore();continue;
      } else if(kind==='domain-root'||kind==='domain-room'||kind==='domain-false') {
        ctx.fillStyle=kind==='domain-false'?'#3a243f':kind==='domain-root'?'#44365c':'#272640';ctx.fillRect(x,y,w,h);
        ctx.strokeStyle=kind==='domain-false'?'#f197c4':'#bba3df';ctx.strokeRect(x,y,w,h);
        ctx.fillStyle='#d9c4fa';ctx.font='bold 19px monospace';ctx.fillText(label,x+18,y+30);
        for(let column=24;column<w-40;column+=124){ctx.fillStyle='#191e36';ctx.fillRect(x+column,y+60,90,Math.max(40,h-80));ctx.strokeStyle='#665484';ctx.strokeRect(x+column,y+60,90,Math.max(40,h-80));
          for(let row=80;row<h-20;row+=38){ctx.fillStyle='#91b9e4';ctx.fillRect(x+column+12,y+row,8,4);ctx.fillStyle='#545776';ctx.fillRect(x+column+30,y+row,45,3);}}
        ctx.restore();continue;
      } else if(kind==='fortress') {
        ctx.fillStyle='#271829';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#664050';ctx.strokeRect(x,y,w,h);
        for(let row=0;row<h;row+=100){ctx.beginPath();ctx.moveTo(x,y+row);ctx.lineTo(x+w,y+row);ctx.stroke();}
      } else if(kind==='bastion') {
        ctx.fillStyle='#462737';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#9b5a6a';ctx.strokeRect(x,y,w,h);
        for(let col=0;col<w;col+=60){ctx.fillRect(x+col,y-20,35,20);}
      } else if(kind==='security-hall'||kind==='citadel') {
        ctx.fillStyle=kind==='citadel'?'#48283e':'#291e2c';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#b87489';ctx.strokeRect(x,y,w,h);
        for(let col=40;col<w;col+=160){ctx.strokeStyle='#61404e';ctx.strokeRect(x+col,y+45,80,h-65);}
      } else if(kind==='datacenter') {
        ctx.fillStyle='#0c2433';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#28516a';ctx.strokeRect(x,y,w,h);
        for(let column=0;column<w;column+=180){ctx.strokeStyle='#204453';ctx.beginPath();ctx.moveTo(x+column,y+45);ctx.lineTo(x+column,y+h);ctx.stroke();}
      } else if(kind==='battle-hall') {
        ctx.fillStyle='#142c3c';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#447488';ctx.strokeRect(x,y,w,h);
        ctx.setLineDash([20,14]);ctx.beginPath();ctx.moveTo(x+20,y+60);ctx.lineTo(x+w-20,y+60);ctx.stroke();ctx.setLineDash([]);
      } else if(kind==='airlock') {
        ctx.fillStyle='#203246';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#77c6df';ctx.strokeRect(x,y,w,h);
        for(let row=50;row<h;row+=50){ctx.fillStyle='#32566b';ctx.fillRect(x+15,y+row,w-30,4);}
      } else if(kind==='boss-arena') {
        ctx.fillStyle='#121b32';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#6f486c';ctx.strokeRect(x,y,w,h);
        const coreX=x+w*.5,coreY=y+h*.43;
        ctx.save();ctx.translate(coreX,coreY);ctx.strokeStyle='#dd4d83';ctx.lineWidth=3;
        for(let ring=0;ring<3;ring++){ctx.beginPath();ctx.ellipse(0,0,75+ring*32,28+ring*13,time*(ring%2?-.25:.25),0,Math.PI*2);ctx.stroke();}
        ctx.fillStyle='#391f3f';ctx.fillRect(-35,-80,70,160);ctx.strokeRect(-35,-80,70,160);ctx.fillStyle='#fa719a';ctx.beginPath();ctx.arc(0,0,16+Math.sin(time*3)*3,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      ctx.fillStyle='#c4dfe5';ctx.fillText(label,x+14,y+28,Math.max(40,w-28));ctx.restore();
    }
  });
})();
