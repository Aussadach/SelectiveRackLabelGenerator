import test from 'node:test';
import assert from 'node:assert/strict';
import {buildImagePdf} from './pdf.js';

test('image PDF keeps one combined rack label on each custom sized page',()=>{
  const jpeg=new Uint8Array([0xff,0xd8,0xff,0xd9]);
  const pdf=buildImagePdf([
    {jpeg,pixelWidth:900,pixelHeight:600,widthPoints:216,heightPoints:144},
    {jpeg,pixelWidth:1200,pixelHeight:300,widthPoints:288,heightPoints:72}
  ]);
  const text=new TextDecoder('latin1').decode(pdf);
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.match(text,/\/Count 2/);
  assert.match(text,/\/MediaBox \[0 0 216 144\]/);
  assert.match(text,/\/MediaBox \[0 0 288 72\]/);
  assert.equal((text.match(/\/Subtype \/Image/g)||[]).length,2);
});
