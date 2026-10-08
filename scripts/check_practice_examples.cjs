#!/usr/bin/env node
// Lightweight logic harness, not a replacement for real browser layout/pointer testing.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
class Element {
  constructor() {
    this.handlers = {}; this.children = []; this.style = {}; this.value = '';
    this.disabled = false; this.textContent = ''; this.attributes = {};
    this.classes = new Set(); this.capture = null;
    this.classList = {
      add: x => this.classes.add(x), remove: x => this.classes.delete(x),
      toggle: (x, on) => on ? this.classes.add(x) : this.classes.delete(x)
    };
  }
  addEventListener(type, fn) {(this.handlers[type] ??= []).push(fn);}
  fire(type, event = {}) {for (const fn of this.handlers[type] ?? []) fn({preventDefault(){}, ...event});}
  replaceChildren(...items) {this.children = items;}
  setAttribute(key, value) {this.attributes[key] = value;}
  focus() {this.focused = true;}
  get offsetLeft() {return parseFloat(this.style.left) || 0;}
  get offsetTop() {return parseFloat(this.style.top) || 0;}
  setPointerCapture(id) {this.capture = id;}
  hasPointerCapture(id) {return this.capture === id;}
  releasePointerCapture(id) {this.capture = null;this.fire('lostpointercapture', {pointerId:id});}
}
const els = Object.fromEntries(['quote','message','typed-value','feedback','quote-choice','start'].map(id => [id,new Element()]));
els['typed-value'].disabled = true;els['quote-choice'].value = '0';
let clock = 1000;
vm.runInNewContext(fs.readFileSync(path.join(root,'labs/typing-game/guided/index.js'),'utf8'), {
  document: {getElementById:id=>els[id], createElement:()=>new Element()},
  performance:{now:()=>clock}, Math
});
const type = value => {els['typed-value'].value=value;els['typed-value'].fire('input');};
type('before start');assert.equal(els['quote'].children.length,0);
els.start.fire('click');assert.equal(els['typed-value'].disabled,false);assert.equal(els['quote'].children.length,4);
assert.ok(els['quote'].children[0].classes.has('highlight'));
type('Wx');assert.ok(els['typed-value'].classes.has('error'));
type('W');assert.equal(els['typed-value'].classes.has('error'),false);
type('We ');assert.ok(els['quote'].children[1].classes.has('highlight'));assert.equal(els['typed-value'].value,'');
type('build ');type('web ');type('apps');assert.equal(els['message'].textContent,'');
clock=4500;type('apps.');assert.equal(els['message'].textContent,'完成！用时 3.50 秒。');assert.equal(els['typed-value'].disabled,true);
clock=9000;type('apps.');assert.equal(els['message'].textContent,'完成！用时 3.50 秒。');
els.start.fire('click');assert.equal(els['typed-value'].disabled,false);assert.equal(els['message'].textContent,'');assert.equal(els['typed-value'].value,'');
assert.equal(els['quote'].children.filter(e=>e.classes.has('done')).length,0);
type(' We');assert.ok(els['typed-value'].classes.has('error'));type('We  ');assert.ok(els['typed-value'].classes.has('error'));
assert.equal(els['typed-value'].handlers.input.length,1);
console.log('PASS typing: idle guard, start, error/correction, next word, punctuation, finish-once, restart, strict spaces, single listener');
const plants=[new Element(),new Element()];
vm.runInNewContext(fs.readFileSync(path.join(root,'labs/terrarium/guided/script.js'),'utf8'),{document:{querySelectorAll:()=>plants}});
const first=plants[0], second=plants[1];
first.fire('pointerdown',{pointerId:1,isPrimary:true,button:0,clientX:100,clientY:100});
first.fire('pointermove',{pointerId:1,clientX:124,clientY:110});
assert.equal(first.offsetLeft,24);assert.equal(first.offsetTop,10);
first.fire('pointermove',{pointerId:1,clientX:119,clientY:108});assert.equal(first.offsetLeft,19);assert.equal(first.offsetTop,8);
first.fire('pointerup',{pointerId:1});first.fire('pointermove',{pointerId:1,clientX:200,clientY:200});assert.equal(first.offsetLeft,19);assert.equal(first.capture,null);
second.fire('pointerdown',{pointerId:2,isPrimary:true,button:0,clientX:20,clientY:20});second.fire('pointermove',{pointerId:2,clientX:30,clientY:25});assert.equal(second.offsetLeft,10);assert.equal(first.offsetLeft,19);
second.fire('pointercancel',{pointerId:2});second.fire('pointermove',{pointerId:2,clientX:60,clientY:60});assert.equal(second.offsetLeft,10);
first.fire('keydown',{key:'ArrowRight'});assert.equal(first.offsetLeft,29);
assert.equal(first.classes.has('dragging'),false);assert.equal(second.classes.has('dragging'),false);
console.log('PASS terrarium: delta direction, successive movement, release, per-plant closure, cancel, keyboard movement');
console.log('Scope: script logic against a small DOM double. Browser hit-testing, touch devices and visual layout require manual verification.');
