/* One bounded, shared canvas for the invitation's light choreography.
   No external libraries, pointer trails or perpetual DOM particle allocation. */
'use strict';
(() => {
  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(pointer: coarse)').matches;
  const economical=(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory||8)<=4;
  const canvas=document.getElementById('celestialAtmosphere');
  const ctx=canvas.getContext('2d');
  const particles=[];
  const maxParticles=mobile||economical?105:180;
  const ambientCount=mobile||economical?12:24;
  const frameInterval=1000/(economical?24:30);
  let width=innerWidth,height=innerHeight,raf=0,lastFrame=0,ambient=false;
  let activeSection=null,scrollFrame=0,lastNote=0,noteTimer=0;
  let celebrationTimers=[];
  const rand=(min,max)=>min+Math.random()*(max-min);
  const sprite=document.createElement('canvas');sprite.width=64;sprite.height=64;
  const ink=sprite.getContext('2d');
  const glow=ink.createRadialGradient(32,32,0,32,32,30);
  glow.addColorStop(0,'#fff8de');glow.addColorStop(.08,'#fceac2');glow.addColorStop(.25,'#e7c38080');glow.addColorStop(1,'#d9ac5300');
  ink.fillStyle=glow;ink.fillRect(0,0,64,64);
  ink.fillStyle='#fff2cc';ink.beginPath();ink.moveTo(32,13);ink.lineTo(35,29);ink.lineTo(51,32);ink.lineTo(35,35);ink.lineTo(32,51);ink.lineTo(29,35);ink.lineTo(13,32);ink.lineTo(29,29);ink.closePath();ink.fill();

  function resize(){
    width=innerWidth;height=innerHeight;
    // Cap both pixel density and pixel count on large/high-density displays.
    const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(2200000/(width*height)));
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx?.setTransform(dpr,0,0,dpr,0,0);
  }
  function wake(){if(!raf&&ctx&&!document.hidden&&!motionQuery.matches)raf=requestAnimationFrame(paint);}
  function add(x,y,count=15,style='burst'){
    if(!ctx||motionQuery.matches||document.hidden)return;
    count=Math.min(count,maxParticles-particles.length);
    for(let i=0;i<count;i++){
      const angle=rand(0,Math.PI*2),speed=rand(25,150),life=style==='wish'?rand(3,5):rand(.8,2.5);
      particles.push({x,y,vx:Math.cos(angle)*speed,vy:style==='wish'?rand(-190,-70):Math.sin(angle)*speed-25,
        age:0,life,size:rand(5,21),spin:rand(0,Math.PI),turn:rand(-1,1),style});
    }
    wake();
  }
  function paint(now){
    raf=0;
    if(document.hidden||motionQuery.matches){ctx.clearRect(0,0,width,height);return;}
    if(now-lastFrame<frameInterval){wake();return;}
    const dt=Math.min((now-lastFrame)/1000||.033,.06);lastFrame=now;
    ctx.clearRect(0,0,width,height);
    if(ambient&&document.body.classList.contains('entered')){
      for(let i=0;i<ambientCount;i++){
        const x=((i*.6180339%1)*width+Math.sin(now*.00013+i*7)*22+width)%width;
        const y=((i*.381966%1)*height-now*.006*(1+i%3))%height;
        const size=10+i%4*2;
        ctx.globalAlpha=.16+(Math.sin(now*.0008+i*5)+1)*.13;
        ctx.drawImage(sprite,x-size/2,(y+height)%height-size/2,size,size);
      }
    }
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];p.age+=dt;
      if(p.age>=p.life){particles.splice(i,1);continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.vx*=Math.exp(-dt*.45);p.vy+=p.style==='wish'?-4*dt:18*dt;
      const t=p.age/p.life;
      ctx.globalAlpha=Math.min(1,p.age*8)*Math.pow(1-t,1.3);
      const size=p.size*(1-t*.35);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin+p.age*p.turn);
      ctx.drawImage(sprite,-size/2,-size/2,size,size);ctx.restore();
    }
    ctx.globalAlpha=1;
    if(particles.length||ambient)wake();
  }
  function glint(element,count=18){
    if(!element)return;
    const r=element.getBoundingClientRect();
    if(r.bottom<0||r.top>height)return;
    add(Math.max(15,Math.min(width-15,r.left+r.width/2)),Math.max(30,Math.min(height-20,r.top+r.height*.45)),count);
  }
  function celebrate(element){
    celebrationTimers.forEach(clearTimeout);celebrationTimers=[];
    glint(element,mobile?48:80);
    const aurora=document.getElementById('revealAurora');
    if(!motionQuery.matches){
      aurora.classList.remove('releasing');
      requestAnimationFrame(()=>aurora.classList.add('releasing'));
      // A cascading sweep uses viewport coordinates, wherever the guest is on the page.
      [0,1,2,3,4,5].forEach(i=>celebrationTimers.push(setTimeout(()=>{
        add(width*(.1+i*.16),height*(.78-i*.1),mobile?10:17);
      },300+i*170)));
      celebrationTimers.push(setTimeout(()=>aurora.classList.remove('releasing'),4000));
    }
    chime();
  }
  function tick(unit){
    if(!document.getElementById('celestialClock').classList.contains('in-scene')||motionQuery.matches||document.hidden)return;
    unit.querySelector('.dial-echo').animate([
      {opacity:.55,transform:'scale(.88)'},{opacity:0,transform:'scale(1.38)'}
    ],{duration:950,easing:'ease-out'});
    unit.querySelector('strong').animate([
      {color:'#fffefa',textShadow:'0 0 22px #ffe7acb0'},
      {color:'#fff5df',textShadow:'0 0 32px #e5cf9e25'}
    ],{duration:850,easing:'ease-out'});
    if(unit.dataset.period==='seconds'){
      const r=unit.getBoundingClientRect();
      if(r.top<height&&r.bottom>0)add(r.left+r.width*.5,r.top+4,mobile?3:5,'tick');
    }
  }
  function chime(){
    // Add the reveal's musical signature while the background track is playing.
    if(!musicEnabled||!setupPianoAudio())return;
    [880,1108.73,1318.51].forEach((frequency,i)=>{
      const at=pianoCtx.currentTime+i*.14,osc=pianoCtx.createOscillator(),gain=pianoCtx.createGain();
      osc.type='sine';osc.frequency.value=frequency;
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.08,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+1.8);
      osc.connect(gain);gain.connect(pianoGain);osc.start(at);osc.stop(at+1.85);
      osc.onended=()=>{osc.disconnect();gain.disconnect()};
    });
  }
  function note(key,midi){
    window.RoyalWorld?.resonate(midi);
    if(!key||motionQuery.matches)return;
    const r=key.getBoundingClientRect();
    if(r.top>height||r.bottom<0)return;
    const now=performance.now();
    if(now-lastNote<65)return;lastNote=now;
    add(r.left+r.width/2,r.top+Math.min(40,r.height/3),mobile?5:9,'wish');
    const resonance=document.querySelector('.piano-resonance');
    const panel=document.querySelector('.piano-panel');
    [...resonance.children].forEach((bar,i)=>{
      bar.getAnimations().forEach(animation=>animation.cancel());
      bar.animate([
        {transform:'scaleY(1)',opacity:.35},
        {transform:`scaleY(${(17+Math.sin(i*.7+midi)*7)/3})`,opacity:1,offset:.2},
        {transform:'scaleY(1)',opacity:.35}
      ],{duration:1100,delay:i*24,easing:'ease-out'});
    });
    panel.classList.add('resonating');
    clearTimeout(noteTimer);noteTimer=setTimeout(()=>panel.classList.remove('resonating'),1400);
  }
  window.Lux={
    glint,celebrate,tick,note,
    trail:(x,y)=>add(x,y,3,'scratch'),
    entrance:()=>{add(width*.5,height*.7,mobile?35:65,'wish');syncScene();},
    wish:element=>{
      if(element.disabled)return;
      element.disabled=true;
      const r=element.getBoundingClientRect();add(r.left+r.width/2,r.top,65,'wish');
      setTimeout(()=>{element.disabled=false},2500);
    }
  };
  resize();
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    document.body.classList.toggle('page-hidden',document.hidden);
    if(document.hidden){cancelAnimationFrame(raf);raf=0;particles.length=0;ctx?.clearRect(0,0,width,height)}
    else{lastFrame=performance.now();wake();}
  });
  motionQuery.addEventListener('change',()=>{
    if(motionQuery.matches){cancelAnimationFrame(raf);raf=0;particles.length=0;ctx?.clearRect(0,0,width,height);document.getElementById('revealAurora').classList.remove('releasing')}
    else wake();
  });

  // Observe sections once per visibility change; only visible scenes are animated.
  const visibleSections=new Set();
  const sections=[...document.querySelectorAll('main>.section')];
  const railLinks=[...document.querySelectorAll('.chapter-rail a')];
  sections.forEach(section=>{
    [...section.querySelectorAll('.reveal')].forEach((el,i)=>el.style.setProperty('--reveal-delay',`${Math.min(i%4*70,210)}ms`));
  });
  function syncScene(){
    let nearest=null,distance=Infinity;
    visibleSections.forEach(section=>{
      const rect=section.getBoundingClientRect(),dist=Math.abs(rect.top+rect.height/2-height/2);
      if(dist<distance){nearest=section;distance=dist;}
      if(!motionQuery.matches&&(section.id==='home'||section.id==='forever'))section.style.setProperty('--scene-shift',`${Math.max(-35,Math.min(35,-rect.top*.065))}px`);
    });
    if(nearest!==activeSection){
      activeSection=nearest;
      ambient=!!nearest&&['home','prologue','the-date','celebrations','symphony','blessings','forever'].includes(nearest.id);
      // Unnamed interludes retain the preceding named chapter.
      let chapter=nearest;
      while(chapter&&!chapter.id)chapter=chapter.previousElementSibling;
      railLinks.forEach(link=>{if(chapter&&link.hash==='#'+chapter.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
      wake();
    }
  }
  const sceneObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      entry.target.classList.toggle('in-scene',entry.isIntersecting);
      if(entry.isIntersecting)visibleSections.add(entry.target);else visibleSections.delete(entry.target);
    });syncScene();
  },{threshold:0});
  sections.forEach(section=>sceneObserver.observe(section));
  // Observe the clock separately; the large date chapter may be visible while it isn't.
  const clockObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('in-scene',entry.isIntersecting));
  },{threshold:.1});clockObserver.observe(document.getElementById('celestialClock'));
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;syncScene()})},{passive:true});
  document.querySelectorAll('.event-card').forEach(card=>{
    if(mobile||motionQuery.matches)return;
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();card.style.setProperty('--light-x',`${e.clientX-r.left}px`);card.style.setProperty('--light-y',`${e.clientY-r.top}px`);
    },{passive:true});
  });
  document.querySelectorAll('.letter-text p').forEach((line,i)=>line.style.setProperty('--line-delay',`${i*90}ms`));
  const seal=document.getElementById('letterSeal');
  seal.addEventListener('click',()=>{
    document.querySelector('.letter-tap').textContent=seal.getAttribute('aria-expanded')==='true'?'A LITTLE PIECE OF OUR HEARTS · TAP THE SEAL TO CLOSE':'TAP THE GOLDEN SEAL TO OPEN OUR LETTER';
  });

  // Portraits deserve to be seen without cropping. A native dialog supplies focus trapping.
  const portraits=[...document.querySelectorAll('.portrait-card img,.soul-card img')];
  const viewer=document.getElementById('portraitViewer'),viewerImage=document.getElementById('viewerImage');
  const viewerCaption=document.getElementById('viewerCaption');
  let portraitIndex=0,portraitOpener=null;
  const captions=['The unspoken promise','The Aegean promise','Kavya · the bride','Anirudh · the groom'];
  function showPortrait(index){
    portraitIndex=(index+portraits.length)%portraits.length;
    const photo=portraits[portraitIndex];viewerImage.src=photo.src;viewerImage.alt=photo.alt;
    viewerCaption.textContent=`${String(portraitIndex+1).padStart(2,'0')} / ${String(portraits.length).padStart(2,'0')} · ${captions[portraitIndex]}`;
  }
  portraits.forEach((image,index)=>{
    const button=document.createElement('button');button.type='button';button.className='portrait-open';button.textContent='+';
    button.setAttribute('aria-label',`View full portrait: ${captions[index]}`);image.parentElement.append(button);
    button.addEventListener('click',()=>{
      portraitOpener=button;showPortrait(index);viewer.showModal();document.body.classList.add('viewing-portrait');
    });
  });
  viewer.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());
  document.getElementById('previousPortrait').addEventListener('click',()=>showPortrait(portraitIndex-1));
  document.getElementById('nextPortrait').addEventListener('click',()=>showPortrait(portraitIndex+1));
  viewer.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();showPortrait(portraitIndex+1)}
    if(e.key==='ArrowLeft'){e.preventDefault();showPortrait(portraitIndex-1)}
  });
  viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
  viewer.addEventListener('close',()=>{document.body.classList.remove('viewing-portrait');portraitOpener?.focus({preventScroll:true})});

  // Keyboard navigation remains contained in the chapter drawer.
  menuToggle.addEventListener('click',()=>{if(menuPanel.classList.contains('is-open'))menuPanel.querySelector('a').focus()});
  menuPanel.addEventListener('keydown',e=>{
    const links=[...menuPanel.querySelectorAll('a')];
    if(e.key==='Escape'){setMenu(false);menuToggle.focus()}
    if(e.key==='Tab'&&e.shiftKey&&document.activeElement===links[0]){e.preventDefault();menuToggle.focus()}
    if(e.key==='Tab'&&!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();menuToggle.focus()}
  });
  menuToggle.addEventListener('keydown',e=>{if(e.key==='Tab'&&menuPanel.classList.contains('is-open')){e.preventDefault();(e.shiftKey?menuPanel.querySelector('a:last-of-type'):menuPanel.querySelector('a')).focus()}});
  document.querySelector('.skip-link').addEventListener('click',e=>{
    e.preventDefault();opened=true;overture.hidden=true;document.body.classList.remove('locked');document.body.classList.add('entered');
    startMusic();
    document.querySelector('main').inert=false;header.inert=false;
    const prologue=document.getElementById('prologue');prologue.setAttribute('tabindex','-1');prologue.focus({preventScroll:true});prologue.scrollIntoView({behavior:'instant'});
  });
})();
