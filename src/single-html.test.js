import test from 'node:test';
import assert from 'node:assert/strict';
import {inlineViteHtml} from '../scripts/build-single-html.mjs';

test('offline build embeds Vite JavaScript and CSS into one HTML file',async()=>{
  const html='<!doctype html><html><head><link rel="stylesheet" href="./assets/app.css"><link rel="modulepreload" href="./assets/vendor.js"><script type="module" src="./assets/app.js"></script></head><body><div id="app"></div></body></html>',assets={'./assets/app.css':'body{color:#123}/* $& */','./assets/app.js':'document.body.dataset.ready="yes";const replacement="$&";const sample=\'<script type="module"><img src="./assets/runtime-example.png"><\\/script>\';'};
  const output=await inlineViteHtml(html,path=>assets[path]);
  assert.match(output,/<style[^>]*>body\{color:#123\}\/\* \$& \*\/<\/style>/);
  assert.match(output,/<script data-offline-source="\.\/assets\/app\.js">document\.body\.dataset\.ready="yes";[\s\S]*<\/script>/);
  assert.match(output,/const replacement="\$&"/);
  assert.ok(output.indexOf('<div id="app"></div>')<output.indexOf('<script data-offline-source='));
  assert.doesNotMatch(output,/<script type="module" data-offline-source=/i);
  assert.doesNotMatch(output,/<script[^>]+src=/);
  assert.doesNotMatch(output,/<link[^>]+(?:stylesheet|modulepreload)/);
  assert.match(output,/name="offline-build" content="single-file"/);
});
