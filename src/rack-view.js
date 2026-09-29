const xml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const paddedBay=value=>String(Number(value)||0).padStart(2,'0');

export function rackLevelConfiguration(unit){
  const count=Math.max(1,Math.floor(Number(unit?.levels)||1));
  return Array.from({length:count},(_,index)=>{
    const level=index+1,raw=Number(unit?.capacities?.[level]??2),capacity=raw===1?1:raw===0?0:2;
    return {level,capacity,binCount:capacity,guarded:level===1};
  });
}

function feet(x,y,width){
  const footWidth=Math.max(3,width*.15),positions=[x+width*.13,x+width*.5,x+width*.87];
  return positions.map(center=>`<rect class="bin-foot" x="${(center-footWidth/2).toFixed(2)}" y="${y}" width="${footWidth.toFixed(2)}" height="4" rx="1"/>`).join('');
}

function isoBin(x,bottom,width){
  const bodyBottom=bottom-4,top=bodyBottom-15,inset=Math.min(3,width*.09),depth=5;
  return `<g class="glove-bin">${feet(x,bottom-4,width)}<path class="rack-bin" d="M${x} ${top} L${x+width} ${top} L${x+width-inset} ${bodyBottom} L${x+inset} ${bodyBottom} Z"/><path class="rack-bin-lid" d="M${x} ${top} l${depth} -${depth} h${width} l-${depth} ${depth} z"/><path class="rack-bin-rim" d="M${x} ${top} H${x+width}"/></g>`;
}

function guards(){
  return [[-37,-5],[-27,-12],[27,-12],[37,-5]].map(([x,y])=>`<g class="rack-guard" transform="translate(${x} ${y})"><rect x="-4" y="-12" width="8" height="13" rx="1"/><path d="M-4 -10 L4 -6 M-4 -5 L4 -1"/></g>`).join('');
}

function isoBins(levels){
  let markup='';
  for(const item of levels){
    if(!item.binCount)continue;
    const bottom=-7-(item.level-1)*19;
    if(item.binCount===1)markup+=isoBin(-27,bottom,54);
    else markup+=isoBin(-29,bottom,28)+isoBin(1,bottom,28);
  }
  return markup;
}

function post(x,top,bottom=-4){
  const holes=Array.from({length:Math.max(2,Math.floor((bottom-top)/9))},(_,i)=>`<rect class="rack-post-hole" x="${x-1}" y="${top+5+i*9}" width="2" height="3" rx=".5"/>`).join('');
  return `<g><rect class="rack-post" x="${x-3}" y="${top}" width="6" height="${bottom-top}" rx="1"/>${holes}<path class="rack-base-plate" d="M${x-6} ${bottom} h12 l3 3 h-18z"/></g>`;
}

export function renderIsoRack(unit,point,{classes='',rotation=0}={}){
  const levels=rackLevelConfiguration(unit),height=levels.length*19+13,top=-height,flip=Number(rotation)%2===0?1:-1,label=`${xml(unit.row)}-${paddedBay(unit.bay)}`;
  const braces=`<g class="rack-braces"><path d="M-29 -7 L-19 ${top+6} M-19 -7 L-29 ${top+6}"/><path d="M29 -7 L39 ${top+6} M39 -7 L29 ${top+6}"/></g>`;
  const rearFrame=`<path class="rack-bottom-beam" d="M-24 -14 H44 v4 h-68z"/>${braces}${post(-24,top-7,-11)}${post(44,top-7,-11)}`;
  const frontFrame=`<path class="rack-bottom-beam" d="M-34 -7 H34 v5 h-68z"/>${post(-34,top)}${post(34,top)}`;
  return `<g class="unit-rack rack-model ${classes}" data-unit="${xml(unit.id)}" transform="translate(${point.x} ${point.y})"><g class="rack-model-facing" transform="scale(${flip} 1)"><path class="rack-select-outline" d="M-43 4 L0 25 L49 3 L5 -20 Z"/>${rearFrame}${isoBins(levels)}${frontFrame}${guards()}</g><g class="rack-nameplate"><rect x="-17" y="${top-8}" width="34" height="12" rx="2"/><text x="0" y="${top+1}" text-anchor="middle">${label}</text></g></g>`;
}

export function renderTopRack(unit,point,{classes='',rotation=0}={}){
  const levels=rackLevelConfiguration(unit),visible=[...levels].reverse().find(level=>level.binCount>0),count=visible?.binCount??0,flip=Number(rotation)%2===0?1:-1,label=`${xml(unit.row)}-${paddedBay(unit.bay)}`;
  const bins=count===1?'<rect class="rack-bin-top" x="-27" y="-12" width="54" height="24" rx="3"/>':count===2?'<rect class="rack-bin-top" x="-28" y="-12" width="27" height="24" rx="3"/><rect class="rack-bin-top" x="1" y="-12" width="27" height="24" rx="3"/>':'';
  const guardMarks=[[-31,-15],[-31,11],[27,-15],[27,11]].map(([x,y])=>`<rect class="rack-guard-top" x="${x}" y="${y}" width="4" height="4"/>`).join('');
  return `<g class="unit-rack top-unit rack-model ${classes}" data-unit="${xml(unit.id)}" transform="translate(${point.x} ${point.y})"><g class="rack-model-facing" transform="scale(${flip} 1)"><rect class="rack-top-frame" x="-31" y="-15" width="62" height="30" rx="2"/>${bins}${guardMarks}<path class="rack-top-beam" d="M-30 -15 H30 M-30 15 H30"/></g><text x="0" y="3" text-anchor="middle">${label}</text></g>`;
}
