import test from 'node:test';
import assert from 'node:assert/strict';
import {clearRackPointerSession} from './rack-interaction.js';
import {rackRenderStats} from './rack-render-plan.js';

test('ending a rack gesture removes every transient pointer handler',()=>{
  const host={onpointermove(){},onpointerup(){},onpointercancel(){}};
  clearRackPointerSession(host);
  assert.equal(host.onpointermove,null);
  assert.equal(host.onpointerup,null);
  assert.equal(host.onpointercancel,null);
});

test('a tall L/R rack batches all repeated bins into three instanced meshes',()=>{
  const capacities=Object.fromEntries(Array.from({length:12},(_,index)=>[index+1,2]));
  const stats=rackRenderStats({levels:12,capacities});
  assert.equal(stats.visualBins,48);
  assert.equal(stats.instancedBinMeshes,3);
  assert.equal(stats.legacyBinMeshes,240);
  assert.equal(stats.optimizedMeshes,38);
});
