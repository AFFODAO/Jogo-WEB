(() => {
  'use strict';
  const api = window.ByteRunner;
  const renderers = new Map();
  const sharedImages=new Map();
  api.visuals = Object.freeze({
    registerLayer(type, renderer) {
      if (renderers.has(type)) throw new Error('Duplicate layer renderer: '+type);
      renderers.set(type,renderer);
    },
    create(phase) {
      const library=api.artAssets || [],required=new Set(['r07','component','terminal','portal','fx']);
      const themeIndex=api.environmentArt?.themes.indexOf(phase.theme)??-1;
      if(themeIndex>=0) {
        const suffix=String(themeIndex+1).padStart(2,'0'),modern=library.some(a=>a.id==='terrain-'+suffix);
        for(const name of modern?['terrain','structure','decor']:['tiles','decor','sky'])required.add(name+'-'+suffix);
        if(modern)required.add(api.parallaxProfiles?.resolve(phase)?.asset||'vista-'+suffix);
      }
      for(const enemy of phase.entities?.enemies || []) {
        required.add('virus-'+(enemy.type || 'basic'));
        const variant=enemy.variant || api.enemies?.variantFor(themeIndex+1,enemy.type);
        if(variant)required.add('virus-'+variant);
        if(enemy.type==='parasite'||enemy.type==='boss'||variant==='file')required.add('virus-fast');
      }
      const references=value=>{
        if(!value||typeof value!=='object')return;
        if(typeof value.asset==='string')required.add(value.asset);
        for(const child of Object.values(value))if(child&&typeof child==='object')references(child);
      };
      references(phase.layers);references(phase.entities);references(phase.playerVisual);
      const definitions = [...library.filter(asset=>required.has(asset.id)),...(phase.assets || [])];
      const images = new Map(), assets = new Map(definitions.map(asset => [asset.id,asset]));
      const clocks = new Map();
      const layersByPass=new Map();
      for(const layer of [...(phase.layers||[])].sort((a,b)=>(a.z||0)-(b.z||0))){
        const pass=layer.pass||'background';
        if(!layersByPass.has(pass))layersByPass.set(pass,[]);
        layersByPass.get(pass).push(layer);
      }
      const terrain=api.environmentArt?.terrain();
      const parallax=api.parallax?.create(phase);
      let disposed = false;
      const errors = [];
      const ready = Promise.all([...assets.values()].map(async asset => {
        if(!sharedImages.has(asset.src))sharedImages.set(asset.src,new Promise(resolve=>{
          const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=asset.src;
        }));
        const request=sharedImages.get(asset.src);sharedImages.delete(asset.src);sharedImages.set(asset.src,request);
        while(sharedImages.size>32)sharedImages.delete(sharedImages.keys().next().value);
        const img=await request;
        if(!img)errors.push(asset.id);else if(!disposed)images.set(asset.id,img);
      }));
      const service = {
        ready, errors,terrain,themeIndex,parallax,
        hasAsset(id){return assets.has(id);},
        loadedAssets(){return [...images.keys()];},
        prepareTerrain(shapes){terrain?.sync(shapes);},
        source(id){return images.get(id) || null;},
        // Canvas/ImageBitmap sources also allow generated assets and deterministic tests.
        add(id, source, definition = {}) { assets.set(id,{id,...definition}); images.set(id,source); },
        sprite(ctx, visual, box, time, state = 'idle') {
          const image = images.get(visual?.asset), asset = assets.get(visual?.asset);
          if (!image || !asset) return false;
          const animation = asset.animations?.[visual.animation || state] || asset.animations?.idle;
          const frames = animation?.frames || [0];
          const key=visual.instance || box.id;
          let elapsed=time;
          if (key) {
            const name=visual.animation || state;
            let clock=clocks.get(key);
            if (!clock || clock.name!==name || time<clock.start) {clock={name,start:time};clocks.set(key,clock);}
            elapsed=time-clock.start;
          }
          const cursor = Math.floor(elapsed*(animation?.fps || 1));
          const frame = visual.frame ?? frames[animation?.loop === false ? Math.min(frames.length-1,cursor) : cursor%frames.length];
          const fw=asset.frameWidth || image.width, fh=asset.frameHeight || image.height;
          const columns=asset.columns || Math.max(1,Math.floor(image.width/fw));
          ctx.save();
          ctx.translate(visual.subpixel?box.x+(visual.offsetX || 0):Math.round(box.x+(visual.offsetX || 0)),visual.subpixel?box.y+(visual.offsetY || 0):Math.round(box.y+(visual.offsetY || 0)));
          if (visual.flipX) {ctx.translate(box.width,0);ctx.scale(-1,1);}
          ctx.imageSmoothingEnabled=false;
          ctx.drawImage(image,(frame%columns)*fw,Math.floor(frame/columns)*fh,fw,fh,0,0,box.width,box.height);
          ctx.restore();
          return true;
        },
        layers(ctx, pass, view, time) {
          const layers=layersByPass.get(pass);
          if(!layers)return;
          for (const layer of layers) {
            const screen=layer.space==='screen';
            const left=screen?0:view.x*(layer.parallaxX??1),top=screen?0:view.y*(layer.parallaxY??1);
            const right=left+view.width,bottom=top+view.height;
            ctx.save();
            ctx.globalAlpha=layer.opacity ?? (pass==='background'&&layer.type==='rects'?.68:1);
            if (!screen) ctx.translate(-left,-top);
            if (layer.type === 'image') service.sprite(ctx,{asset:layer.asset,animation:layer.animation},{x:layer.x || 0,y:layer.y || 0,width:layer.width || view.width,height:layer.height || view.height},time);
            else if (layer.type === 'rects') {
              ctx.fillStyle=layer.color || '#12313a';
              for (const rect of layer.rects || []) {
                if(rect.x>=right||rect.y>=bottom||rect.x+rect.width<=left||rect.y+rect.height<=top)continue;
                ctx.fillRect(rect.x,rect.y,rect.width,rect.height);
              }
            } else if (renderers.has(layer.type)) renderers.get(layer.type)(ctx,layer,view,time,service);
            ctx.restore();
          }
        },
        dispose() { disposed=true; images.clear();clocks.clear();terrain?.dispose();parallax?.dispose(); }
      };
      return service;
    }
  });
})();
