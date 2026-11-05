// Presentation is metadata; generated geometry never depends on image dimensions.
(() => {
  const ns=window.ByteRunner.mapGeneration;
  const themes=['hardware','software','switch','router','wifi','cabling','dhcp','dns','firewall','servers'];
  const palettes=[['#06191b','#143b35','#63f3bb','#286453','#d6ac64'],['#11172b','#292c50','#a99be9','#535980','#e4d8fa'],['#0b192a','#203c4e','#71cde3','#44647a','#dbefda'],['#101b30','#273b5c','#7cb4ed','#4a6581','#d9e6fa'],['#0c192c','#21445c','#7cdae6','#40748c','#d1f9e7'],['#131b28','#343a43','#dab47a','#68685f','#ece0b0'],['#101f2a','#254b43','#a5d78f','#567e65','#e0edb7'],['#16182f','#373354','#b7a1e2','#6b648f','#f0d7ed'],['#201827','#482f43','#eb887e','#7b4b60','#ffd9aa'],['#121a2e','#2c354f','#df83b3','#5b5d80','#eddded']];
  const materials=Object.fromEntries(themes.map((theme,index)=>{
    const suffix=String(index+1).padStart(2,'0');
    return [theme,Object.freeze({tileSize:32,tileset:'tiles-'+suffix,scenery:'decor-'+suffix,background:'sky-'+suffix,palette:Object.freeze(palettes[index])})];
  }));
  ns.config=Object.freeze({version:1,schemaVersion:2,limits:Object.freeze({rooms:64,dimension:32768,entitiesPerRoom:2048}),groups:Object.freeze(['platforms','obstacles','components','enemies','collectibles','features','gates','interactives']),materials:Object.freeze(materials)});
})();
