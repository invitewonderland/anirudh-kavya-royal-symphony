/* ANIRUDH & KAVYA — A Royal Symphony of Forever
 * Original interactive invitation concept. No framework or server required.
 * Demo details can be customised for a commissioned invitation.
 */
'use strict';

const CONFIG = {
  // Fictional concept date. Include Greece's UTC offset for accurate global countdown.
  weddingDateISO: '2027-01-24T16:30:00+02:00',
  backgroundVolume: 0.37,
  wishStorageKey: 'anirudh-kavya-demo-blessings-v1'
};
const $ = (selector,root=document) => root.querySelector(selector);
const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeAudio = $('#themeAudio');
const toast = $('#toast');
let musicEnabled = false;
let musicStarting = false;
let toastTimer;
let tourTimers = [];

function showToast(message){
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('visible'),3300);
}
async function startMusic(){
  if(musicStarting)return;
  musicStarting=true;
  themeAudio.volume = CONFIG.backgroundVolume;
  try{await themeAudio.play();musicEnabled=true;}
  catch(e){musicEnabled=false;console.info('Audio waits for a user tap:',e.message);}
  finally{musicStarting=false;}
}
function pauseMusic(){themeAudio.pause();musicEnabled=false;}
themeAudio.addEventListener('pause',()=>{musicEnabled=false;});
// Retry naturally on the next gesture if a browser initially blocks playback.
function resumeMusicOnGesture(){
  if(opened&&!document.body.classList.contains('locked')&&!musicEnabled)startMusic();
}
document.addEventListener('pointerdown',resumeMusicOnGesture,{passive:true});
document.addEventListener('keydown',resumeMusicOnGesture);

/* The curtain deliberately opens *after* the viewer taps: reliable mobile audio unlock. */
const overture=$('#overture');
let opened=false;
async function openOverture(){
  if(opened)return;
  opened=true;
  startMusic();
  overture.classList.add('opening');
  makeSmallSparkles(overture,26);
  document.body.classList.add('entered');
  const delay=reducedMotion?60:2500;
  setTimeout(()=>{
    overture.hidden=true;
    overture.style.display='none';
    document.body.classList.remove('locked');
    document.querySelector('main').inert=false;
    header.inert=false;
    window.scrollTo({top:0,behavior:'instant'});
    revealInView();
    $('.brand').focus({preventScroll:true});
    window.Lux?.entrance();
  },delay);
}
$('#enterButton').addEventListener('click',openOverture);
$$('.curtain').forEach(curtain=>{
  curtain.addEventListener('click',openOverture);
  curtain.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openOverture();}});
});
function replayCurtain(){
  stopTour();
  window.scrollTo({top:0,behavior:'instant'});
  overture.hidden=false;overture.style.display='grid';overture.classList.remove('opening');
  document.body.classList.remove('entered');document.body.classList.add('locked');opened=false;
  document.querySelector('main').inert=true;header.inert=true;
  pauseMusic();
  $('#enterButton').focus({preventScroll:true});
}
$('#replayCurtain').addEventListener('click',replayCurtain);

/* Opening chapters overlay and a restrained scroll-progress line. */
const menuPanel=$('#menuPanel'),menuToggle=$('#menuToggle'),header=$('#siteHeader');
function setMenu(open){
  menuPanel.classList.toggle('is-open',open);menuToggle.classList.toggle('active',open);
  menuPanel.inert=!open;menuToggle.setAttribute('aria-expanded',String(open));
}
menuToggle.addEventListener('click',()=>setMenu(!menuPanel.classList.contains('is-open')));
$$('a',menuPanel).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
window.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
document.querySelector('main').inert=true;header.inert=true;
overture.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const controls=$$('.curtain, #enterButton',overture),first=controls[0],last=controls.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
$('#enterButton').focus({preventScroll:true});
function onScroll(){
  const max=document.documentElement.scrollHeight-innerHeight;
  $('#scrollProgress').style.width=`${Math.max(0,(scrollY/(max||1))*100)}%`;
  header.classList.toggle('scrolled',scrollY>40);
}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
const observer=new IntersectionObserver(entries=>{
  for(const item of entries){
    if(item.isIntersecting){item.target.classList.add('is-visible');observer.unobserve(item.target);}
  }
},{threshold:.07,rootMargin:'0px 0px -24px 0px'});
$$('.reveal').forEach(el=>observer.observe(el));
function revealInView(){
  $$('.reveal').forEach(el=>{
    let r=el.getBoundingClientRect();
    if(r.top<innerHeight*.93&&r.bottom>0)el.classList.add('is-visible');
  });
}

/* Real scratch canvas: draws metallic gold and erases it with pointer strokes. */
const scratchCanvas=$('#scratchCanvas'),scratchSurface=$('#scratchSurface'),scratchHint=$('#scratchHint');
let scratchCtx,eraseMoves=0,erasing=false,scratchRevealed=false,lastPoint=null,lastScratchSpark=0;
function drawScratchTexture(){
  if(scratchRevealed)return;
  const r=scratchSurface.getBoundingClientRect();
  if(r.width<10||r.height<10)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  scratchCanvas.width=Math.round(r.width*dpr);
  scratchCanvas.height=Math.round(r.height*dpr);
  scratchCanvas.style.width=r.width+'px';scratchCanvas.style.height=r.height+'px';
  scratchCtx=scratchCanvas.getContext('2d',{willReadFrequently:true});
  scratchCtx.setTransform(dpr,0,0,dpr,0,0);
  let gradient=scratchCtx.createLinearGradient(0,0,r.width,r.height);
  gradient.addColorStop(0,'#8b683b');gradient.addColorStop(.18,'#ecd3a0');gradient.addColorStop(.37,'#b49155');gradient.addColorStop(.52,'#f6e2b7');gradient.addColorStop(.7,'#ba985f');gradient.addColorStop(1,'#846134');
  scratchCtx.fillStyle=gradient;scratchCtx.fillRect(0,0,r.width,r.height);
  scratchCtx.globalAlpha=.23;
  for(let x=-r.height;x<r.width+r.height;x+=5){
    scratchCtx.beginPath();scratchCtx.moveTo(x,0);scratchCtx.lineTo(x+r.height,r.height);
    scratchCtx.strokeStyle=x%10===0?'#fff7d5':'#6f4c25';scratchCtx.lineWidth=.35;scratchCtx.stroke();
  }
  scratchCtx.globalAlpha=1;
  scratchCtx.strokeStyle='#fef0cb88';scratchCtx.lineWidth=1;
  scratchCtx.strokeRect(13,13,r.width-26,r.height-26);
  scratchCtx.strokeRect(19,19,r.width-38,r.height-38);
  // Guilloché rings: an engraved astronomical seal beneath the instruction.
  const cx=r.width/2,cy=r.height/2;
  [r.height*.29,r.height*.34,r.height*.41].forEach((radius,i)=>{
    scratchCtx.beginPath();scratchCtx.arc(cx,cy,radius,0,Math.PI*2);
    scratchCtx.setLineDash(i===1?[1,5]:[]);scratchCtx.strokeStyle='#73562b66';scratchCtx.stroke();
  });
  scratchCtx.setLineDash([]);
  for(let i=0;i<48;i++){
    const angle=i*Math.PI/24,inner=r.height*.42,outer=inner+(i%4===0?7:3);
    scratchCtx.beginPath();scratchCtx.moveTo(cx+Math.cos(angle)*inner,cy+Math.sin(angle)*inner);
    scratchCtx.lineTo(cx+Math.cos(angle)*outer,cy+Math.sin(angle)*outer);scratchCtx.stroke();
  }
  scratchCtx.font='15px Georgia';scratchCtx.fillStyle='#fff5d269';
  for(let i=0;i<24;i++){
    const x=((i*73+19)%100)/100*r.width,y=((i*41+11)%100)/100*r.height;
    scratchCtx.fillText(i%2?'✦':'✧',x,y);
  }
}
function revealScratch(manual=false){
  if(scratchRevealed)return;
  scratchRevealed=true;erasing=false;
  scratchSurface.classList.add('revealed');scratchHint.setAttribute('aria-hidden','true');
  scratchSurface.closest('.scratch-frame').classList.add('is-unveiled');
  $('#revealDateBtn').textContent='Written in the stars ✧';
  $('#revealDateBtn').disabled=true;
  $('#dateAnnouncement').textContent='The date is revealed: Sunday, 24 January 2027, Santorini, Greece. Concept celebration date.';
  showToast(manual?'The stars have spoken ✦':'You found the day our forever begins ✦');
  window.Lux?.celebrate(scratchSurface);
}
function scratchAt(e){
  if(!scratchCtx||scratchRevealed)return;
  const r=scratchCanvas.getBoundingClientRect();
  const x=Math.min(r.width,Math.max(0,e.clientX-r.left));
  const y=Math.min(r.height,Math.max(0,e.clientY-r.top));
  scratchCtx.globalCompositeOperation='destination-out';
  scratchCtx.strokeStyle='#000';scratchCtx.fillStyle='#000';scratchCtx.lineWidth=Math.max(39,r.width*.106);scratchCtx.lineJoin='round';scratchCtx.lineCap='round';
  if(lastPoint){scratchCtx.beginPath();scratchCtx.moveTo(lastPoint.x,lastPoint.y);scratchCtx.lineTo(x,y);scratchCtx.stroke();}
  scratchCtx.beginPath();scratchCtx.arc(x,y,scratchCtx.lineWidth/2,0,Math.PI*2);scratchCtx.fill();
  lastPoint={x,y};eraseMoves++;
  const now=performance.now();
  if(now-lastScratchSpark>55){window.Lux?.trail(e.clientX,e.clientY);lastScratchSpark=now;}
  if(eraseMoves%12===0)checkScratchProgress();
}
function checkScratchProgress(){
  if(scratchRevealed)return;
  // Read only a tiny sample, avoiding full-resolution GPU readback on touchmove.
  const sample=document.createElement('canvas');sample.width=64;sample.height=40;
  const ctx=sample.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(scratchCanvas,0,0,64,40);
  const data=ctx.getImageData(0,0,64,40).data;
  let clear=0,total=0;
  for(let i=3;i<data.length;i+=4){total++;if(data[i]<110)clear++;}
  if(clear/Math.max(1,total)>.40)revealScratch();
}
scratchCanvas.addEventListener('pointerdown',e=>{
  if(scratchRevealed)return;
  erasing=true;lastPoint=null;scratchSurface.classList.add('scratching');
  scratchCanvas.setPointerCapture(e.pointerId);scratchAt(e);
});
scratchCanvas.addEventListener('pointermove',e=>{if(erasing)scratchAt(e)});
function stopScratch(){if(erasing)checkScratchProgress();erasing=false;lastPoint=null;}
scratchCanvas.addEventListener('pointerup',stopScratch);
scratchCanvas.addEventListener('pointercancel',stopScratch);
$('#revealDateBtn').addEventListener('click',()=>revealScratch(true));
let scratchWidth=0;
new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width!==scratchWidth){scratchWidth=width;eraseMoves=0;drawScratchTexture();}}).observe(scratchSurface);
requestAnimationFrame(drawScratchTexture);

/* Countdown: demo date until the celebration, gentle past-event state afterward. */
const weddingTimestamp=Date.parse(CONFIG.weddingDateISO);
function updateCountdown(){
  const diff=Math.max(0,weddingTimestamp-Date.now());
  const days=Math.floor(diff/86400000),hours=Math.floor(diff/3600000)%24;
  const minutes=Math.floor(diff/60000)%60,seconds=Math.floor(diff/1000)%60;
  const values=[days,hours,minutes,seconds],periods=[365,24,60,60];
  ['cdDays','cdHours','cdMinutes','cdSeconds'].forEach((id,i)=>{
    const node=document.getElementById(id),value=String(values[i]).padStart(2,'0'),unit=node.closest('.clock-unit');
    const fraction=Math.min(1,values[i]/periods[i]),phase=1-fraction;
    const previous=Number(unit.dataset.phase??phase),angle=Number(unit.dataset.angle??phase*360)+((phase-previous+1)%1)*360;
    unit.dataset.phase=phase;unit.dataset.angle=angle;
    unit.style.setProperty('--dial-offset',String((1-fraction)*100));
    unit.style.setProperty('--satellite-angle',`${angle}deg`);
    if(node.textContent!==value){node.textContent=value;window.Lux?.tick(unit);}
  });
  if(diff===0){$('#countdown').setAttribute('aria-label','The fictional wedding day has arrived');$('#clockWhisper').textContent='The waiting becomes a memory. Forever begins today.';}
}
updateCountdown();setInterval(()=>{if(!document.hidden)updateCountdown()},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateCountdown()});

/* An actual touchable, bright Web Audio grand piano (25 notes, two octaves). */
const KEYBOARD=$('#pianoKeyboard');
const WHITE=[0,2,4,5,7,9,11];
const KEY_NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const keyboardMap=['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote'];
let pianoCtx=null,pianoGain=null,pianoCompressor=null,duckTimer;
let pianoVolume=0.9;
function noteName(n){return KEY_NAMES[n%12]+(Math.floor(n/12)-1);}
function makePiano(){
  const whites=[];
  for(let n=60;n<=84;n++)if(WHITE.includes(n%12))whites.push(n);
  whites.forEach((midi,i)=>{
    const button=document.createElement('button');button.type='button';button.className='piano-key white';button.dataset.midi=String(midi);
    button.setAttribute('aria-label','Play '+noteName(midi));
    if(i<keyboardMap.length){const label=document.createElement('span');label.className='piano-note-label';label.textContent=keyboardMap[i].replace('Key','').replace('Semicolon',';').replace('Quote',"'");button.appendChild(label);}
    KEYBOARD.appendChild(button);
  });
  for(let n=60;n<=84;n++){
    if(WHITE.includes(n%12))continue;
    const before=whites.indexOf(n-1);
    if(before<0)continue;
    const button=document.createElement('button');button.type='button';button.className='piano-key black';button.dataset.midi=String(n);
    button.setAttribute('aria-label','Play '+noteName(n));
    button.style.left=`calc(${(before+1)/whites.length*100}% - 2.15%)`;
    KEYBOARD.appendChild(button);
  }
  $$('.piano-key',KEYBOARD).forEach(key=>{
    key.addEventListener('pointerdown',e=>{
      e.preventDefault();key.setPointerCapture(e.pointerId);playPianoNote(Number(key.dataset.midi),key);});
    key.addEventListener('click',e=>{
      if(e.detail===0)playPianoNote(Number(key.dataset.midi),key);
    });
    key.addEventListener('pointerup',()=>key.classList.remove('pressed'));
    key.addEventListener('pointercancel',()=>key.classList.remove('pressed'));
    key.addEventListener('pointerleave',()=>key.classList.remove('pressed'));
  });
}
function setupPianoAudio(){
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext){showToast('This browser does not support piano audio.');return false;}
  if(!pianoCtx){
    pianoCtx=new AudioContext();
    pianoGain=pianoCtx.createGain();
    pianoCompressor=pianoCtx.createDynamicsCompressor();
    pianoCompressor.threshold.value=-22;pianoCompressor.knee.value=18;
    pianoCompressor.ratio.value=3.5;pianoCompressor.attack.value=.005;pianoCompressor.release.value=.18;
    pianoGain.gain.value=pianoVolume*1.25;
    pianoGain.connect(pianoCompressor);pianoCompressor.connect(pianoCtx.destination);
  }
  if(pianoCtx.state==='suspended')pianoCtx.resume().catch(()=>{});
  return true;
}
function playPianoNote(midi,key=null){
  if(!setupPianoAudio())return;
  const now=pianoCtx.currentTime;
  const frequency=440*Math.pow(2,(midi-69)/12);
  // Bright attack + natural harmonic shimmer. Soft-clipped by dynamics compression.
  const partials=[{ratio:1,volume:.38,type:'triangle'},{ratio:2,volume:.21,type:'sine'},{ratio:3.01,volume:.08,type:'sine'},{ratio:4.02,volume:.045,type:'sine'}];
  for(const [i,part] of partials.entries()){
    const osc=pianoCtx.createOscillator(),gain=pianoCtx.createGain();
    osc.type=part.type;osc.frequency.setValueAtTime(frequency*part.ratio,now);
    const decay=i===0?1.8:1.3;
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,part.volume),now+.012);
    gain.gain.exponentialRampToValueAtTime(.00012,now+decay);
    osc.connect(gain);gain.connect(pianoGain);osc.start(now);osc.stop(now+decay+.03);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  if(key){key.classList.add('pressed');setTimeout(()=>key.classList.remove('pressed'),260);}
  const displayKey=$(`.piano-key[data-midi="${midi}"]`);
  window.Lux?.note(displayKey,midi);
  if(displayKey&&key!==displayKey){displayKey.classList.add('pressed');setTimeout(()=>displayKey.classList.remove('pressed'),250);}
  if(musicEnabled){
    themeAudio.volume=Math.min(.22,CONFIG.backgroundVolume);
    clearTimeout(duckTimer);duckTimer=setTimeout(()=>{if(musicEnabled)themeAudio.volume=CONFIG.backgroundVolume},1250);
  }
}
makePiano();
$('#pianoVolume').addEventListener('input',e=>{
  pianoVolume=Number(e.target.value)/100;
  $('#pianoVolumeValue').textContent=e.target.value+'%';
  if(pianoGain)pianoGain.gain.setTargetAtTime(pianoVolume*1.25,pianoCtx.currentTime,.025);
});
window.addEventListener('keydown',e=>{
  const focused=document.activeElement;
  if(focused&&['INPUT','TEXTAREA','SELECT'].includes(focused.tagName))return;
  if(!$('#symphony').getBoundingClientRect) return;
  const rect=$('#symphony').getBoundingClientRect();
  if(rect.bottom<0||rect.top>innerHeight)return;
  if(e.repeat)return;
  let ix=keyboardMap.indexOf(e.code);
  if(ix!==-1){e.preventDefault();let whites=$$('.piano-key.white',KEYBOARD);if(whites[ix])playPianoNote(Number(whites[ix].dataset.midi),whites[ix]);}
});
$('#playMotif').addEventListener('click',e=>{
  if(e.currentTarget.disabled)return;
  if(!setupPianoAudio())return;
  e.currentTarget.disabled=true;e.currentTarget.textContent='♫  THE MELODY IS PLAYING';
  const notes=[64,67,72,74,76,74,72,67,69,72,76,79,76,74,72,67,64,60];
  notes.forEach((pitch,i)=>setTimeout(()=>playPianoNote(pitch),i*270));
  setTimeout(()=>{e.currentTarget.disabled=false;e.currentTarget.innerHTML='♫ &nbsp; PLAY THEIR MELODY';},notes.length*270+450);
});

/* Wax-sealed letter. */
let letterAnimation=null;
$('#letterSeal').addEventListener('click',()=>{
  const text=$('#letterText'),card=$('#letterCard'),opening=text.hidden;
  const previousHeight=card.getBoundingClientRect().height;
  if(letterAnimation)letterAnimation.cancel();
  text.hidden=!opening;
  card.classList.toggle('open',opening);
  $('#letterSeal').setAttribute('aria-expanded',String(opening));
  if(!reducedMotion&&card.animate){
    const nextHeight=card.getBoundingClientRect().height;
    card.style.overflow='hidden';
    letterAnimation=card.animate([{height:previousHeight+'px'},{height:nextHeight+'px'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});
    letterAnimation.onfinish=()=>{card.style.overflow='';letterAnimation=null;};
  }
  if(opening){makeSmallSparkles(card,8);showToast('A little letter from our hearts ♡');}
});

/* The blessing garden persists locally for demo review. No pretend public backend. */
function readBlessings(){try{return JSON.parse(localStorage.getItem(CONFIG.wishStorageKey)||'[]')}catch{return[]}}
const storedBlessings=readBlessings();
let blessings=(Array.isArray(storedBlessings)?storedBlessings:[]).filter(x=>x&&typeof x.name==='string'&&typeof x.message==='string').slice(-6);
function writeBlessings(){try{localStorage.setItem(CONFIG.wishStorageKey,JSON.stringify(blessings))}catch{}}
function renderBlessings(){
  const garden=$('#blessingGarden');garden.replaceChildren();
  for(const wish of [...blessings].reverse()){
    const card=document.createElement('article');card.className='blessing-bloom';
    const icon=document.createElement('span');icon.className='bloom-icon';icon.textContent='✿';
    const p=document.createElement('p');p.textContent='“'+wish.message+'”';
    const who=document.createElement('small');who.textContent='WITH LOVE, '+wish.name.toUpperCase();
    card.append(icon,p,who);garden.appendChild(card);
  }
}
renderBlessings();
$('#blessingForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#blessingName').value.trim(),message=$('#blessingMessage').value.trim();
  if(!name||!message)return;
  blessings.push({name:name.slice(0,40),message:message.slice(0,280)});
  blessings=blessings.slice(-6);writeBlessings();renderBlessings();
  e.target.reset();makeSmallSparkles($('#blessingGarden'),14);
  showToast('Your blessing has blossomed ✿ (saved on this device)');
});

/* Shareable RSVP; no misleading claim of transmission or fictitious recipient. */
let rsvpMessage='';
$('#rsvpForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#guestName').value.trim();if(!name)return;
  const guests=$('#guestCount').value;
  const status=$('input[name="attendance"]:checked').value;
  rsvpMessage=`ANIRUDH & KAVYA — A Royal Symphony of Forever\n\nFrom: ${name}\nResponse: ${status}\nGuests: ${guests}\n\nWith love and best wishes!`;
  $('#rsvpText').textContent=rsvpMessage;
  $('#rsvpResult').hidden=false;
  window.Lux?.glint($('#rsvpResult'),18);
  $('#rsvpResult').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});
});
$('#copyRsvp').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(rsvpMessage);showToast('RSVP message copied!');}
  catch{
    const textarea=document.createElement('textarea');textarea.value=rsvpMessage;document.body.append(textarea);textarea.select();
    const success=document.execCommand('copy');textarea.remove();showToast(success?'RSVP message copied!':'Select the RSVP text above to copy.');
  }
});
$('#shareRsvp').addEventListener('click',()=>{
  if(!rsvpMessage)return;
  window.open('https://wa.me/?text='+encodeURIComponent(rsvpMessage),'_blank','noopener,noreferrer');
});

/* Wish-stars float into the finale sky. */
function makeSmallSparkles(parent,count){
  window.Lux?.glint(parent,count);
}
$('#makeWish').addEventListener('click',()=>{
  window.Lux?.wish($('#makeWish'));
  $('#wishMessage').textContent='May every beautiful wish find its way home. ✨';
});

/* Optional cinematic walkthrough for screen recording / Instagram Reels. */
let touring=false;
function stopTour(){tourTimers.forEach(clearTimeout);tourTimers=[];touring=false;$('#tourButton').textContent='CINEMATIC TOUR ▶';}
$('#tourButton').addEventListener('click',()=>{
  if(touring){stopTour();showToast('Cinematic tour paused');return;}
  touring=true;$('#tourButton').textContent='STOP CINEMATIC TOUR ◼';
  startMusic();
  const stages=[
    ['home',0],['prologue',4700],['our-story',8800],['the-date',13200],
    ['celebrations',18200],['symphony',22500],['blessings',29000],['forever',34800]
  ];
  for(const [id,delay] of stages){tourTimers.push(setTimeout(()=>{
    if(!touring)return;
    if(id==='the-date')revealScratch(true);
    document.getElementById(id).scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
  },delay));}
  tourTimers.push(setTimeout(()=>{stopTour();showToast('And the symphony continues ♡')},42000));
});
window.addEventListener('wheel',()=>{if(touring)stopTour()},{passive:true});
window.addEventListener('touchstart',e=>{if(touring&&!(e.target.closest&&e.target.closest('#tourButton')))stopTour()},{passive:true});

/* CSS hidden must always win over custom display rules. */
