export function clearRackPointerSession(host){
  if(!host)return;
  host.onpointermove=null;
  host.onpointerup=null;
  host.onpointercancel=null;
}

export function clearRackSelectionNow(applySelection){
  applySelection([],[]);
}
