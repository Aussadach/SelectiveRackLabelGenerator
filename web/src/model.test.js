import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {defaultState,locations,normalize,code,csv,labelGroups,bayLevels} from './model.js';
test('rack generates unique padded legacy codes and capacity overrides',()=>{const s=defaultState();assert.equal(locations(s).length,48);s.rows[0].cells['1:1']=1;s.rows[0].cells['2:1']=0;const r=locations(s);assert.equal(r.length,45);assert.equal(code(r[0]),'ANV1_A_01_1_S');assert.equal(new Set(r.map(code)).size,r.length);});
test('case insensitive headers, padded bays and additional columns',()=>{assert.deepEqual(normalize([['Plant','Row','Bay','Level','Side','ignored'],['ps1','a','001','02','r','x']]),[{PLANT:'PS1',ROW:'A',BAY:'01',LEVEL:'2',SIDE:'R'}]);});
test('rejects malformed and duplicate locations',()=>{const h=['PLANT','ROW','BAY','LEVEL','SIDE'];assert.throws(()=>normalize([h,['P','A','1','0','L']]));assert.throws(()=>normalize([h,['P','A','1','1','L'],['P','A','01','1','L']]));assert.throws(()=>normalize([['ANV1_A_01_L']]));});
test('actual repository CSV can import without losing location rows',()=>{const text=fs.readFileSync('../Resource/ตารางป้ายเก่าใหม่2.csv','utf8');const table=text.trim().split(/\r?\n/).map(l=>l.split(','));const result=normalize(table);assert.equal(result.length,table.length-1);assert.equal(code(result[0]),'PS1_A_12_1_L');assert.ok(csv(result).startsWith('\ufeffPLANT,ROW,BAY,LEVEL,SIDE'));});
test('supports different level counts for each bay',()=>{const s=defaultState();s.rows[0].bayLevels[1]=1;s.rows[0].bayLevels[2]=5;assert.equal(bayLevels(s.rows[0],1),1);assert.equal(locations(s).filter(r=>r.ROW==='A').length,24);});
test('groups labels by plant row bay and side in level order',()=>{const groups=labelGroups([{PLANT:'P',ROW:'A',BAY:'01',LEVEL:'2',SIDE:'L'},{PLANT:'P',ROW:'A',BAY:'01',LEVEL:'1',SIDE:'L'},{PLANT:'P',ROW:'A',BAY:'01',LEVEL:'1',SIDE:'R'}]);assert.equal(groups.length,2);assert.deepEqual(groups[0].items.map(r=>r.LEVEL),['1','2']);});

