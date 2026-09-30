export function clearRackPointerSession(host){
  if(!host)return;
  host.onpointermove=null;
  host.onpointerup=null;
  host.onpointercancel=null;
}
