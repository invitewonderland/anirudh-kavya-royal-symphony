/* Non-rendering integration checks. Run: node tests/interactions.cjs
   Uses the real HTML and both production scripts, with browser APIs stubbed.
   This checks behavior and DOM contracts; it does not substitute for visual QA. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');

function harness({reduced=false,stored='[]',now='2027-01-24T14:29:59Z',blockedAudio=true}={}){
  const timers=new Map(),frames=new Map(),observers=[],events={},storage=new Map([['anirudh-kavya-demo-blessings-v1',stored]]);
  let nextId=1,clock=Date.parse(now),coverage=0;
  class Element{
    constructor(tag,attrs={}){
      this.tagName=tag.toUpperCase();this.attrs=attrs;this.children=[];this.parentElement=null;this.listeners={};this.dataset={};this.hidden='hidden' in attrs;this.disabled=false;this.inert=false;this._text='';this.value=attrs.value||'';this.checked='checked' in attrs;this.style={setProperty(k,v){this[k]=v}};
      Object.entries(attrs).forEach(([k,v])=>{if(k.startsWith('data-'))this.dataset[k.slice(5)]=v});
      this.classes=new Set((attrs.class||'').split(/\s+/).filter(Boolean));
      this.classList={add:(...a)=>a.forEach(x=>this.classes.add(x)),remove:(...a)=>a.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(x,force)=>{const on=force??!this.classes.has(x);on?this.classes.add(x):this.classes.delete(x);return on}};
    }
    get id(){return this.attrs.id||''} get className(){return [...this.classes].join(' ')} set className(v){this.classes=new Set(v.split(/\s+/))}
    get hash(){return this.attrs.href||''} get src(){return this.attrs.src||''} set src(v){this.attrs.src=v} get alt(){return this.attrs.alt||''} set alt(v){this.attrs.alt=v}
    get textContent(){return this._text+this.children.map(x=>x.textContent).join('')} set textContent(v){this._text=String(v);this.children=[]}
    set innerHTML(v){this.textContent=v} get innerHTML(){return this.textContent}
    get previousElementSibling(){const siblings=this.parentElement?.children||[];return siblings[siblings.indexOf(this)-1]||null}
    appendChild(el){el.parentElement=this;this.children.push(el);return el} append(...a){a.forEach(x=>this.appendChild(x))} replaceChildren(...a){this.children=[];this.append(...a)}
    remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this)}
    setAttribute(k,v){this.attrs[k]=String(v)} getAttribute(k){return this.attrs[k]??null} removeAttribute(k){delete this.attrs[k]}
    addEventListener(name,cb){(this.listeners[name]??=[]).push(cb)}
    fire(name,event={}){const e={target:this,currentTarget:this,preventDefault(){},...event};for(const cb of this.listeners[name]||[])cb(e)}
    focus(){document.activeElement=this} scrollIntoView(){} setPointerCapture(){} select(){}
    getBoundingClientRect(){return {top:100,bottom:400,left:100,right:600,width:500,height:300}}
    getContext(){return context2d}
    querySelectorAll(selector){return query(this,selector)} querySelector(selector){return this.querySelectorAll(selector)[0]||null}
    closest(selector){for(let n=this;n;n=n.parentElement)if(matches(n,selector))return n;return null}
    showModal(){this.open=true;this.querySelector('button')?.focus()} close(){this.open=false;this.fire('close')}
    reset(){this.querySelectorAll('input,textarea').forEach(el=>el.value='')}
    animate(){return {cancel(){},onfinish:null}}
    getAnimations(){return []}
  }
  function matches(el,selector){
    return selector.split(',').some(raw=>{
      const s=raw.trim();
      if(s.includes('>')){const [parent,child]=s.split('>');return matches(el,child)&&el.parentElement&&matches(el.parentElement,parent)}
      if(s.includes(' ')){const parts=s.split(/\s+/),last=parts.pop();return matches(el,last)&&!!el.parentElement?.closest(parts.join(' '))}
      if(s.includes(':checked')&&!el.checked)return false;
      if(s.includes(':last-of-type')&&el.parentElement?.children.filter(x=>x.tagName===el.tagName).at(-1)!==el)return false;
      const tag=s.match(/^[a-z][\w-]*/i);if(tag&&el.tagName!==tag[0].toUpperCase())return false;
      for(const [,id] of s.matchAll(/#([\w-]+)/g))if(el.id!==id)return false;
      for(const [,cls] of s.matchAll(/\.([\w-]+)/g))if(!el.classes.has(cls))return false;
      for(const [,key,,value] of s.matchAll(/\[([\w-]+)(?:=(["']?)([^\]"']+)\2)?\]/g)){
        const actual=key.startsWith('data-')?el.dataset[key.slice(5)]:el.getAttribute(key);
        if(actual==null||(value!=null&&actual!==value))return false;
      }
      return true;
    });
  }
  function query(el,selector){const found=[];function walk(n){for(const c of n.children){if(matches(c,selector))found.push(c);walk(c)}}walk(el);return found}
  const document=new Element('document');document.createElement=tag=>new Element(tag);document.getElementById=id=>document.querySelector('#'+id);document.activeElement=null;document.hidden=false;
  document.addEventListener=(name,cb)=>(events['document:'+name]??=[]).push(cb);
  const stack=[document],voids=new Set(['META','LINK','IMG','INPUT','BR','HR','SOURCE','WBR']);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const token of html.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]*>|[^<]+/g)){
    if(token.startsWith('<!'))continue;
    if(token.startsWith('</')){stack.pop();continue}
    if(token.startsWith('<')){
      const tag=token.match(/^<([\w-]+)/)[1],attrs={};
      for(const [,key,,value] of token.slice(tag.length+1,-1).matchAll(/([\w:-]+)(?:\s*=\s*(["'])([\s\S]*?)\2)?/g))attrs[key]=value??'';
      const el=new Element(tag,attrs);stack.at(-1).appendChild(el);if(!voids.has(el.tagName)&&!token.endsWith('/>'))stack.push(el);
    }else stack.at(-1)._text+=token;
  }
  document.body=document.querySelector('body');document.documentElement=document.querySelector('html');document.documentElement.scrollHeight=20000;
  const audio=document.getElementById('themeAudio');audio.preload=audio.attrs.preload;audio.playCalls=0;audio.pauseCalls=0;audio.load=()=>{};
  audio.play=()=>{audio.playCalls++;return blockedAudio?Promise.reject(new Error('Test autoplay block')):Promise.resolve()};audio.pause=()=>{audio.pauseCalls++};
  const context2d=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),getImageData:()=>{const data=new Uint8ClampedArray(64*40*4);for(let i=3;i<data.length;i+=4)data[i]=i/data.length<coverage?0:255;return {data}}},{get:(obj,k)=>k in obj?obj[k]:()=>{}});
  const motion={matches:reduced,addEventListener(name,cb){this.change=cb}};
  const fakeDate=class extends Date{static now(){return clock}};
  const sandbox={document,console:{info(){}},Date:fakeDate,Math,JSON,Map,Set,Uint8ClampedArray,performance:{now:()=>5000},innerWidth:390,innerHeight:844,devicePixelRatio:3,scrollY:0,
    navigator:{hardwareConcurrency:4,deviceMemory:4,clipboard:{writeText:async()=>{}}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
    matchMedia:q=>q.includes('reduced')?motion:{matches:true},
    setTimeout:(cb,delay)=>{const id=nextId++;timers.set(id,{cb,delay});return id},clearTimeout:id=>timers.delete(id),
    setInterval:(cb,delay)=>{const id=nextId++;timers.set(id,{cb,delay,interval:true});return id},
    requestAnimationFrame:cb=>{const id=nextId++;frames.set(id,cb);return id},cancelAnimationFrame:id=>frames.delete(id),
    IntersectionObserver:class{constructor(cb){this.cb=cb;observers.push(this)}observe(el){this.cb([{target:el,isIntersecting:true}])}unobserve(){}},
    ResizeObserver:class{constructor(cb){this.cb=cb}observe(el){this.cb([{target:el,contentRect:{width:500}}])}}
  };
  sandbox.window=sandbox;sandbox.addEventListener=(name,cb)=>(events[name]??=[]).push(cb);sandbox.scrollTo=()=>{};sandbox.open=()=>{};
  vm.createContext(sandbox);
  for(const file of ['script.js','luxury.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
  const $=id=>document.getElementById(id);
  return {$,document,sandbox,timers,frames,storage,motion,events,vm:code=>vm.runInContext(code,sandbox),setDate:value=>clock=Date.parse(value),setCoverage:value=>coverage=value,
    flushDelay(delay){for(const [id,t] of [...timers])if(t.delay===delay&&!t.interval){timers.delete(id);t.cb()}},
    flushFrame(){const current=[...frames];frames.clear();current.forEach(([,cb])=>cb(5000))}};
}

(async()=>{
  const h=harness();
  assert.equal(h.$('musicToggle'),null);
  assert.equal(h.$('themeAudio').src,'assets/audio/A_Canopy_of_White_Roses.mp3');
  assert.equal(h.$('themeAudio').getAttribute('loop'),'');
  assert.equal(h.$('themeAudio').getAttribute('controls'),null);
  assert.equal(h.$('themeAudio').getAttribute('autoplay'),null);
  assert.equal(h.$('themeAudio').playCalls,0,'music must wait for the curtain gesture');
  assert.equal(h.$('cdDays').textContent,'00');assert.equal(h.$('cdHours').textContent,'00');assert.equal(h.$('cdMinutes').textContent,'00');assert.equal(h.$('cdSeconds').textContent,'01');
  assert.equal(h.document.querySelectorAll('.piano-key').length,25);
  assert.equal(h.document.querySelectorAll('.piano-key.white').length,15);
  assert.equal(h.document.querySelectorAll('.piano-key.black').length,10);
  h.setDate('2027-01-23T12:28:57Z');h.vm('updateCountdown()');
  assert.deepEqual(['cdDays','cdHours','cdMinutes','cdSeconds'].map(id=>h.$(id).textContent),['01','02','01','03']);
  h.setDate('2028-01-24T14:30:01Z');h.vm('updateCountdown()');
  assert.equal(h.$('cdSeconds').textContent,'00');assert.match(h.$('clockWhisper').textContent,/Forever begins today/);
  h.$('enterButton').fire('click');
  assert.equal(h.$('themeAudio').playCalls,1);
  // Entry must proceed even when audio.play() rejects or waits on a mobile browser.
  assert.equal(h.$('overture').classList.contains('opening'),true);
  h.flushDelay(2500);await new Promise(setImmediate);
  assert.equal(h.$('overture').hidden,true);assert.equal(h.document.querySelector('main').inert,false);
  assert.equal(h.document.activeElement,h.document.querySelector('.brand'));
  h.events['document:pointerdown'][0]();await new Promise(setImmediate);
  assert.equal(h.$('themeAudio').playCalls,2,'blocked audio retries on the next guest interaction');
  h.$('letterSeal').fire('click');assert.equal(h.$('letterText').hidden,false);assert.equal(h.$('letterSeal').getAttribute('aria-expanded'),'true');
  h.$('letterSeal').fire('click');assert.equal(h.$('letterText').hidden,true);
  h.$('menuToggle').fire('click');assert.equal(h.$('menuPanel').inert,false);assert.equal(h.document.activeElement.tagName,'A');
  h.$('menuPanel').fire('keydown',{key:'Escape'});assert.equal(h.$('menuPanel').inert,true);assert.equal(h.document.activeElement,h.$('menuToggle'));
  const open=h.document.querySelector('.portrait-open');open.fire('click');assert.equal(h.$('portraitViewer').open,true);assert.match(h.$('viewerCaption').textContent,/01 \/ 04/);
  h.$('nextPortrait').fire('click');assert.match(h.$('viewerCaption').textContent,/02 \/ 04/);
  h.$('portraitViewer').close();assert.equal(h.document.activeElement,open);
  h.$('blessingName').value='<img onerror=alert(1)>';h.$('blessingMessage').value='A beautiful forever';h.$('blessingForm').fire('submit');
  assert.equal(h.$('blessingGarden').querySelectorAll('img').length,0);assert.match(h.$('blessingGarden').textContent,/WITH LOVE, <IMG ONERROR/);
  assert.equal(JSON.parse(h.storage.get('anirudh-kavya-demo-blessings-v1')).length,1);
  h.$('guestName').value='Test Guest';h.$('guestCount').value='2';h.$('rsvpForm').fire('submit');assert.equal(h.$('rsvpResult').hidden,false);assert.match(h.$('rsvpText').textContent,/Guests: 2/);
  h.flushFrame();h.setCoverage(.2);h.vm('checkScratchProgress()');assert.equal(h.$('scratchSurface').classList.contains('revealed'),false);
  h.setCoverage(.6);h.vm('checkScratchProgress()');assert.equal(h.$('scratchSurface').classList.contains('revealed'),true);assert.match(h.$('dateAnnouncement').textContent,/24 January 2027/);
  assert.equal(h.$('revealDateBtn').disabled,true);
  h.$('makeWish').fire('click');assert.equal(h.$('makeWish').disabled,true);h.flushDelay(2500);assert.equal(h.$('makeWish').disabled,false);
  const reduced=harness({reduced:true,stored:'{}'});
  reduced.$('enterButton').fire('click');reduced.flushDelay(60);await new Promise(setImmediate);
  assert.equal(reduced.document.querySelector('main').inert,false);
  reduced.$('revealDateBtn').fire('click');assert.equal(reduced.$('scratchSurface').classList.contains('revealed'),true);
  reduced.flushFrame();assert.equal(reduced.frames.size,0,'reduced motion must not schedule an atmosphere loop');
  const music=harness({blockedAudio:false});
  music.$('enterButton').fire('click');await new Promise(setImmediate);music.flushDelay(2500);
  assert.equal(music.vm('musicEnabled'),true);
  music.$('replayCurtain').fire('click');assert.equal(music.$('themeAudio').pauseCalls,1);assert.equal(music.vm('musicEnabled'),false);
  music.$('enterButton').fire('click');await new Promise(setImmediate);assert.equal(music.$('themeAudio').playCalls,2);
  console.log('PASS: new looping soundtrack, curtain-triggered playback, removed music controls, blocked-audio retry, replay, countdown boundaries, 25 piano keys, menu focus, portraits, letter, blessings, RSVP, scratch, wishes, reduced motion.');
})().catch(error=>{console.error(error);process.exitCode=1});
