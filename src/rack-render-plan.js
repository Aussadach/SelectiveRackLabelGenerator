import {rackVisualBins} from './model.js';

export function rackBinPlacements(unit,levelPitch=1.22){
  const levels=Math.max(1,Number(unit.levels)||1),bins=[];
  for(let level=1;level<=levels;level++){
    const capacity=Number(unit.capacities?.[level]??2),base=.24+(level-1)*levelPitch;
    for(const bin of rackVisualBins(capacity))bins.push({x:bin.x,y:base+bin.row*.58});
  }
  return bins;
}

export function rackRenderStats(unit){
  const visualBins=rackBinPlacements(unit).length;
  return {visualBins,legacyBinMeshes:visualBins*5,instancedBinMeshes:visualBins?3:0,optimizedMeshes:35+(visualBins?3:0)};
}
