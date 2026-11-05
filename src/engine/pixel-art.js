/* Pixel-exact composition of the generated PNG material and scenery library. */
(() => {
  const api=window.ByteRunner;
  const patterns=new WeakMap();
  const aliases={board:'cpu','window-room':'window',process:'terminal',ethernet:'port',backplane:'port',tunnel:'gateway',cache:'terminal',building:'wall',duct:'cable','lift-shaft':'cable','server-tower':'rack','address-sector':'gateway',conflict:'terminal','domain-root':'domain','domain-room':'domain','domain-false':'domain',fortress:'firewall',bastion:'firewall','security-hall':'firewall',citadel:'firewall',datacenter:'rack','battle-hall':'wall',airlock:'port','boss-arena':'core'};
  const glyphs={A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',C:'01111100001000010000100001000001111',D:'11110100011000110001100011000111110',E:'11111100001000011110100001000011111',F:'11111100001000011110100001000010000',G:'01111100001000010111100011000101111',H:'10001100011000111111100011000110001',I:'11111001000010000100001000010011111',J:'00111000100001000010100101001001100',K:'10001100101010011000101001001010001',L:'10000100001000010000100001000011111',M:'10001110111010110101100011000110001',N:'10001110011010110011100011000110001',O:'01110100011000110001100011000101110',P:'11110100011000111110100001000010000',Q:'01110100011000110001101011001001101',R:'11110100011000111110101001001010001',S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',U:'10001100011000110001100011000101110',V:'10001100011000110001100010101000100',W:'10001100011000110101101011010101010',X:'10001100010101000100010101000110001',Y:'10001100010101000100001000010000100',Z:'11111000010001000100010001000011111',0:'01110100011001110101110011000101110',1:'00100011000010000100001000010001110',2:'01110100010000100010001000100011111',3:'11110000010000101110000010000111110',4:'00010001100101010010111110001000010',5:'11111100001000011110000010000111110',6:'01110100001000011110100011000101110',7:'11111000010001000100010000100001000',8:'01110100011000101110100011000101110',9:'01110100011000101111000010000101110','-':'00000000000000011111000000000000000','.':'00000000000000000000000000010000100','/':'00001000100001000100010000100010000',':':'00000001000010000000001000010000000'};
  const art={
    text(ctx,text,x,y,color='#b9cbd3',max=Infinity){
      ctx.fillStyle=color;const clean=String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();let cursor=0;
      for(const char of clean){if(cursor+5>max)break;const glyph=glyphs[char];if(glyph)for(let i=0;i<35;i++)if(glyph[i]==='1')ctx.fillRect(Math.round(x)+cursor+i%5,Math.round(y)+Math.floor(i/5),1,1);cursor+=6;}
    },
    pattern(ctx,visuals,id,frame,box){
      const image=visuals?.source(id);if(!image)return false;
      let cache=patterns.get(ctx);if(!cache){cache=new Map();patterns.set(ctx,cache);}
      const key=id+':'+frame;let entry=cache.get(key);
      if(!entry||entry.image!==image){const cell=document.createElement('canvas');cell.width=32;cell.height=32;const c=cell.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,(frame%8)*32,Math.floor(frame/8)*32,32,32,0,0,32,32);entry={image,pattern:ctx.createPattern(cell,'repeat')};cache.set(key,entry);}
      ctx.save();ctx.translate(Math.round(box.x),Math.round(box.y));ctx.fillStyle=entry.pattern;ctx.fillRect(0,0,box.width,box.height);ctx.restore();return true;
    },
    platform(ctx,visuals,o,time,index,view){
      const id='tiles-'+String(index+1).padStart(2,'0');if(!visuals.source(id))return false;
      if(!['floor','platform','gate','obstacle'].includes(o.kind))return false;
      const x=Math.max(o.x,view.x-32),y=Math.max(o.y,view.y-32),right=Math.min(o.x+o.w,view.x+view.width+32),bottom=Math.min(o.y+o.h,view.y+view.height+32);
      if(right<=x||bottom<=y)return true;
      ctx.save();ctx.beginPath();ctx.rect(o.x,o.y,o.w,o.h);ctx.clip();
      const body=o.kind==='gate'?5:3;art.pattern(ctx,visuals,id,body*8,{x:Math.floor(x/32)*32,y:Math.floor(y/32)*32,width:right-Math.floor(x/32)*32,height:bottom-Math.floor(y/32)*32});
      const state=o.type==='dangerous'?6:o.type==='moving'?1:o.type==='temporary'?2:o.kind==='gate'?5:0;
      if(o.type==='temporary'&&api.experience?.settings.reducedEffects!==true)ctx.globalAlpha=.8+Math.sin(time*5)*.15;
      for(let tx=Math.floor((x-o.x)/32)*32+o.x;tx<right;tx+=32)visuals.sprite(ctx,{asset:id,frame:state*8+Math.abs(Math.floor(tx/32))%8},{x:tx,y:o.y,width:32,height:32},time);
      if(o.h>40&&o.y+o.h-32<view.y+view.height&&o.y+o.h>view.y)for(let tx=Math.floor((x-o.x)/32)*32+o.x;tx<right;tx+=32)visuals.sprite(ctx,{asset:id,frame:4*8},{x:tx,y:o.y+o.h-32,width:32,height:32},time);
      ctx.restore();
      // Danger teeth and a moving/temporary strip sit above the surface, preserving affordances.
      if(o.type==='dangerous'){ctx.fillStyle='#f5a1a0';for(let tx=x;tx<right;tx+=8){ctx.fillRect(Math.round(tx)+2,o.y-3,3,3);ctx.fillRect(Math.round(tx)+3,o.y-5,1,2);}}
      if(o.type==='moving'||o.type==='temporary')art.text(ctx,o.type==='moving'?'< >':'---',o.x+5,o.y+6,'#ecddab',o.w-8);
      return true;
    },
    feature(ctx,item,view,time,visuals,index){
      const {x,y,width:w,height:h,kind,label}=item,id='decor-'+String(index+1).padStart(2,'0'),tiles='tiles-'+String(index+1).padStart(2,'0');
      if(!visuals.source(id))return false;
      ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
      const background=['board','backplane','building','datacenter','fortress','tunnel','window-room','address-sector','domain-room','domain-root','domain-false','boss-arena','battle-hall','security-hall','citadel','lift-shaft','duct'].includes(kind);
      if(background){
        ctx.globalAlpha=kind==='board'?.28:.68;
        art.pattern(ctx,visuals,tiles,10*8,{x:Math.max(x,view.x-32),y:Math.max(y,view.y-32),width:Math.min(x+w,view.x+view.width+32)-Math.max(x,view.x-32),height:Math.min(y+h,view.y+view.height+32)-Math.max(y,view.y-32)});ctx.globalAlpha=1;
      }
      if(kind!=='board'&&kind!=='cache'){
        const animation=aliases[kind] || kind;
        const scale=Math.max(1,Math.min(3,Math.floor(Math.min(w,h)/64))),size=64*scale;
        if(background){
          for(let xx=x+16;xx<x+w-40;xx+=size+48)for(let yy=y+30;yy<y+h-40;yy+=size+56){
            if(xx+size<view.x||xx>view.x+view.width||yy+size<view.y||yy>view.y+view.height)continue;
            visuals.sprite(ctx,{asset:id,animation},{x:xx,y:yy,width:size,height:size},api.experience?.settings.reducedEffects?0:time);
          }
        }else{
          const count=Math.max(1,Math.floor(w/(size+8)));for(let i=0;i<count;i++)visuals.sprite(ctx,{asset:id,animation},{x:Math.round(x+(w-count*size)/2+i*size),y:Math.round(y+(h-size)/2),width:size,height:size},api.experience?.settings.reducedEffects?0:time);
        }
      }
      ctx.restore();
      if(label)art.text(ctx,label,x+8,y+8,kind==='cache'?'#e8cd95':'#a9bfc8',w-16);
      return true;
    },
    background(ctx,view,time,index,visuals){
      const bands=['#0b1223','#0d192b','#102432','#162d3a'];for(let i=0;i<4;i++){ctx.fillStyle=bands[i];ctx.fillRect(0,Math.floor(view.height*i/4),view.width,Math.ceil(view.height/4));}
      const id='sky-'+String(index+1).padStart(2,'0');
      for(let depth=0;depth<(api.experience?.settings.reducedEffects?1:3);depth++){
        const scale=depth===2?2:1,size=96*scale,offset=Math.floor(view.x*[.08,.18,.32][depth]);ctx.globalAlpha=[.26,.42,.65][depth];
        for(let x=Math.floor(offset/size)-1;x<(offset+view.width)/size+1;x++)visuals?.sprite(ctx,{asset:id,frame:((x%8)+8)%8},{x:x*size-offset,y:Math.round(view.height*.72-size+depth*12-view.y*.035),width:size,height:size},0);
      }ctx.globalAlpha=1;
    },
    ring(ctx,x,y,r,color){ctx.fillStyle=color;for(let a=0;a<360;a+=Math.max(3,70/r)){const rad=a*Math.PI/180;ctx.fillRect(Math.round(x+Math.cos(rad)*r),Math.round(y+Math.sin(rad)*r),1,1);}}
  };
  api.pixelArt=Object.freeze(art);
})();
