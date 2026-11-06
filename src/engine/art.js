/* Original atlas composition. No collision or gameplay state is changed here. */
(() => {
  const api=window.ByteRunner;
  api.art = {
    background(ctx,view,time,index,palette,visuals) {
      if(visuals?.themeIndex>=0)index=visuals.themeIndex;
      if(api.pixelArt&&visuals){api.pixelArt.background(ctx,view,time,index,visuals);return;}
      const reduced=api.experience?.settings.reducedEffects;
      const accent=palette[2];
      ctx.save();
      const sky=ctx.createLinearGradient(0,0,0,view.height);
      sky.addColorStop(0,'#070b1d');sky.addColorStop(1,palette[1]);
      ctx.fillStyle=sky;ctx.fillRect(0,0,view.width,view.height);
      // Three repeating, culled depth planes with independent camera offsets.
      for(let layer=0;layer<(reduced?1:3);layer++) {
        const step=layer===0?120:190;
        const offset=view.x*[.08,.19,.34][layer];
        const start=Math.floor(offset/step);
        for(let i=start-1;i<start+view.width/step+2;i++) {
          const x=Math.round(i*step-offset), h=90+((i*37+index*29+layer*47)%160+160)%160;
          const y=view.height*.88-h-view.y*.04;
          ctx.fillStyle=['#0b1228','#101c31','#16273b'][layer];
          ctx.fillRect(x,y,step-18,h+view.height);
          ctx.globalAlpha=.12+layer*.05;ctx.fillStyle=accent;
          ctx.fillRect(x,y,step-18,2);
          for(let row=0;row<5;row++) {
            const yy=y+14+row*23;
            if(index%3===0) {ctx.fillRect(x+9,yy,step-38,1);ctx.fillRect(x+15,yy+4,3,6);}
            else if(index%3===1) {for(let k=0;k<4;k++)ctx.fillRect(x+10+k*25,yy,12,3);}
            else {ctx.fillRect(x+12+row*17,yy,22,2);ctx.fillRect(x+20+row*17,yy,2,24);}
          }
          ctx.globalAlpha=1;
        }
      }
      for(let i=0;i<(reduced?0:28);i++) {
        const x=((i*137-view.x*.12+time*(3+i%4))%view.width+view.width)%view.width;
        const y=(i*71+Math.sin(time*.6+i)*8)%view.height;
        ctx.globalAlpha=.18+(Math.sin(time*2+i)+1)*.15;ctx.fillStyle=accent;ctx.fillRect(x,y,2,i%4===0?7:2);
      }
      ctx.restore();
    },
    platform(ctx,visuals,object,time,index,view) {
      if(visuals?.themeIndex>=0)index=visuals.themeIndex;
      if(api.pixelArt?.platform(ctx,visuals,object,time,index,view))return true;
      if(!['floor','platform'].includes(object.kind) || object.type==='dangerous')return false;
      // Bound work to visible tiles, even on extremely large floor segments.
      const start=Math.max(0,Math.floor((view.x-object.x)/32));
      const end=Math.min(Math.ceil(object.w/32),Math.ceil((view.x+view.width-object.x)/32));
      const top=Math.max(0,Math.floor((view.y-object.y)/32));
      const bottom=Math.min(Math.ceil(object.h/32),Math.ceil((view.y+view.height-object.y)/32));
      let drawn=false;
      ctx.save();ctx.beginPath();ctx.rect(object.x,object.y,object.w,object.h);ctx.clip();
      if(object.type==='temporary')ctx.globalAlpha=api.experience?.settings.reducedEffects ? .85 : .7+Math.sin(time*7)*.15;
      for(let y=top;y<bottom;y++) for(let x=start;x<end;x++) {
        drawn=visuals.sprite(ctx,{asset:'tiles-'+String(index+1).padStart(2,'0')},{x:object.x+x*32,y:object.y+y*32,width:32,height:32},time,object.type)||drawn;
      }
      ctx.restore();return drawn;
    },
    atmosphere(ctx,view,time,color) {
      if(api.pixelArt){ctx.save();ctx.fillStyle='#070e20';for(let i=0;i<3;i++){ctx.globalAlpha=.08-i*.02;const border=4+i*5;ctx.fillRect(0,0,view.width,border);ctx.fillRect(0,view.height-border,view.width,border);ctx.fillRect(0,border,border,view.height-border*2);ctx.fillRect(view.width-border,border,border,view.height-border*2);}ctx.restore();return;}
      ctx.save();
      const vignette=ctx.createRadialGradient(view.width/2,view.height*.45,view.width*.2,view.width/2,view.height*.5,view.width*.75);
      vignette.addColorStop(0,'#02041400');vignette.addColorStop(1,'#02041499');ctx.fillStyle=vignette;ctx.fillRect(0,0,view.width,view.height);
      ctx.globalAlpha=.045;ctx.fillStyle=color;ctx.fillRect(0,0,view.width,2);
      ctx.restore();
    }
  };
})();
