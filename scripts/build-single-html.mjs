import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const localAsset=value=>!/^([a-z]+:|\/\/|data:|#)/i.test(value);
const attribute=(tag,name)=>tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`,'i'))?.[1]??'';
const safeScript=source=>source.replace(/<\/script/gi,'<\\/script');
const safeStyle=source=>source.replace(/<\/style/gi,'<\\/style');

export async function inlineViteHtml(html,readAsset){
  let output=html;
  const links=[...output.matchAll(/<link\b[^>]*>/gi)].map(match=>match[0]);
  for(const tag of links){
    const href=attribute(tag,'href'),rel=attribute(tag,'rel').toLowerCase();
    if(rel==='stylesheet'&&href&&localAsset(href))output=output.replace(tag,`<style data-offline-source="${href}">${safeStyle(await readAsset(href))}</style>`);
    else if(rel==='modulepreload'&&href&&localAsset(href))output=output.replace(tag,'');
  }
  const scripts=[...output.matchAll(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*><\/script>/gi)].map(match=>match[0]);
  for(const tag of scripts){
    const src=attribute(tag,'src');
    if(src&&localAsset(src))output=output.replace(tag,`<script data-offline-source="${src}">${safeScript(await readAsset(src))}</script>`);
  }
  const documentShell=output.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  if(/(?:src|href)=["'](?:\.\/)?assets\//i.test(documentShell))throw Error('Single HTML ยังมี asset ภายนอกที่ไม่ได้ฝัง');
  return output.replace('<head>','<head><meta name="offline-build" content="single-file">');
}

export async function buildSingleHtml(distDir='dist',filename='RackLabelStudio-Offline.html'){
  const root=resolve(distDir),html=await readFile(resolve(root,'index.html'),'utf8'),readAsset=asset=>readFile(resolve(root,asset.replace(/^\.\//,'')),'utf8'),output=await inlineViteHtml(html,readAsset),destination=resolve(root,filename);
  await writeFile(destination,output);
  return {destination,bytes:Buffer.byteLength(output)};
}

const current=fileURLToPath(import.meta.url);
if(process.argv[1]&&resolve(process.argv[1])===current){
  const {destination,bytes}=await buildSingleHtml(process.argv[2]??'dist');
  console.log(`Offline single HTML: ${destination} (${(bytes/1024/1024).toFixed(2)} MB)`);
}
