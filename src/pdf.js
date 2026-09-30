const encoder=new TextEncoder();
const ascii=value=>encoder.encode(String(value));
const join=chunks=>{const size=chunks.reduce((sum,chunk)=>sum+chunk.length,0),out=new Uint8Array(size);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length;}return out;};
const stream=(dictionary,data)=>join([ascii(`${dictionary}\nstream\n`),data,ascii('\nendstream')]);
const pdfNumber=value=>Number(Number(value).toFixed(4));

export function buildImagePdf(pages){
  if(!pages.length)throw Error('ไม่มีป้ายสำหรับสร้าง PDF');
  const objects=[],pageRefs=pages.map((_,index)=>3+index*3);
  objects[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');
  objects[2]=ascii(`<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs.map(id=>`${id} 0 R`).join(' ')}] >>`);
  pages.forEach((page,index)=>{
    const pageId=3+index*3,imageId=pageId+1,contentId=pageId+2,name=`Im${index+1}`,width=pdfNumber(page.widthPoints),height=pdfNumber(page.heightPoints),jpeg=page.jpeg instanceof Uint8Array?page.jpeg:new Uint8Array(page.jpeg),content=ascii(`q\n${width} 0 0 ${height} 0 0 cm\n/${name} Do\nQ`);
    objects[pageId]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /${name} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects[imageId]=stream(`<< /Type /XObject /Subtype /Image /Width ${page.pixelWidth} /Height ${page.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,jpeg);
    objects[contentId]=stream(`<< /Length ${content.length} >>`,content);
  });
  const header=ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'),chunks=[header],offsets=[0];let offset=header.length;
  for(let id=1;id<objects.length;id++){const chunk=join([ascii(`${id} 0 obj\n`),objects[id],ascii('\nendobj\n')]);offsets[id]=offset;chunks.push(chunk);offset+=chunk.length;}
  const xrefOffset=offset,xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.slice(1).map(value=>`${String(value).padStart(10,'0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(ascii(xref));return join(chunks);
}
