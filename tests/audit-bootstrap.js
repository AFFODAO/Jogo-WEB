// Installed before every production script in the isolated review page.
window.__reviewErrors=[];
window.__reviewProgress=label=>{fetch('/__review-progress',{method:'POST',body:label}).catch(()=>{});};
window.addEventListener('error',event=>{
  if(event.error || event.message)window.__reviewErrors.push({type:'error',message:event.message,stack:event.error?.stack,source:event.filename,line:event.lineno});
});
window.addEventListener('unhandledrejection',event=>window.__reviewErrors.push({type:'unhandledrejection',message:String(event.reason?.stack || event.reason)}));
const originalConsoleError=console.error.bind(console);
console.error=(...args)=>{window.__reviewErrors.push({type:'console.error',message:args.map(String).join(' ')});originalConsoleError(...args);};
