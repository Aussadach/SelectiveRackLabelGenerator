import test from 'node:test';
import assert from 'node:assert/strict';
import {inlineViteHtml} from '../scripts/build-single-html.mjs';

test('offline build embeds Vite JavaScript and CSS into one HTML file',async()=>{
  const html='<!doctype html><html><head><link rel="stylesheet" href="./assets/app.css"><link rel="modulepreload" href="./assets/vendor.js"></head><body><script type="module" src="./assets/app.js"></script></body></html>',assets={'./assets/app.css':'body{color:#123}','./assets/app.js':'document.body.dataset.ready="yes";'};
  const output=await inlineViteHtml(html,path=>assets[path]);
  assert.match(output,/<style[^>]*>body\{color:#123\}<\/style>/);
  assert.match(output,/<script type="module"[^>]*>document\.body\.dataset\.ready="yes";<\/script>/);
  assert.doesNotMatch(output,/(?:src|href)=["']\.\/assets\//);
  assert.match(output,/name="offline-build" content="single-file"/);
});
