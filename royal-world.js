/* Each chapter offers a different gesture. All personal words stay in this browser. */
'use strict';
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(pointer: coarse)').matches;
  const animate=(element,frames,options={})=>{
    if(!element||motion.matches||!element.animate)return;
    element.getAnimations().forEach(animation=>animation.cancel());
    return element.animate(frames,{duration:900,easing:'cubic-bezier(.16,1,.3,1)',...options});
  };
  const theatre=document.getElementById('celebrationTheatre');
  const tabs=[...theatre.querySelectorAll('[role="tab"]')];
  const scenes=[...theatre.querySelectorAll('.celebration-scene')];
  const effectsTimers=new Map();
  let activeAct=0;

  function closeInvitation(scene,returnFocus=false){
    const panel=scene.querySelector('.scene-invitation');
    panel.hidden=true;scene.classList.remove('invitation-open');
    const opener=scene.querySelector('.scene-unveil');opener.setAttribute('aria-expanded','false');
    if(returnFocus)opener.focus({preventScroll:true});
  }
  function selectAct(index,focus=false){
    const next=(index+tabs.length)%tabs.length;
    const changed=next!==activeAct;
    scenes.forEach((scene,i)=>{
      if(i!==next){closeInvitation(scene);scene.querySelector('.scene-effects').replaceChildren();clearTimeout(effectsTimers.get(scene));}
      scene.hidden=i!==next;
      tabs[i].setAttribute('aria-selected',String(i===next));tabs[i].setAttribute('tabindex',i===next?'0':'-1');
    });
    activeAct=next;
    document.getElementById('theatreActNumber').textContent=`ACT ${['I','II','III'][next]} / III`;
    if(changed){
      animate(scenes[next].querySelector('.scene-image'),[{opacity:.3,transform:'scale(1.07)'},{opacity:1,transform:'scale(1.015)'}],{duration:1400});
      animate(scenes[next].querySelector('.scene-copy'),[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:1000});
    }
    if(focus)tabs[next].focus({preventScroll:true});
  }
  function releaseScene(scene){
    const layer=scene.querySelector('.scene-effects');
    clearTimeout(effectsTimers.get(scene));layer.replaceChildren();
    if(motion.matches||document.hidden)return;
    const count=scene.classList.contains('scene-ceremony')?(compact?13:22):(compact?8:13);
    for(let i=0;i<count;i++){
      const mote=document.createElement('i');mote.className='scene-mote';
      mote.style.setProperty('--mote-x',`${8+Math.random()*84}%`);
      mote.style.setProperty('--mote-drift',`${Math.random()*130-65}px`);
      mote.style.setProperty('--mote-duration',`${4+Math.random()*2}s`);
      mote.style.setProperty('--mote-delay',`${Math.random()*1.1}s`);
      layer.append(mote);
    }
    effectsTimers.set(scene,setTimeout(()=>layer.replaceChildren(),7500));
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectAct(index));
    tab.addEventListener('keydown',e=>{
      const keys={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:tabs.length-1};
      if(Object.prototype.hasOwnProperty.call(keys,e.key)){e.preventDefault();selectAct(keys[e.key],true);}
    });
  });
  scenes.forEach(scene=>{
    const opener=scene.querySelector('.scene-unveil'),panel=scene.querySelector('.scene-invitation');
    opener.addEventListener('click',()=>{
      panel.hidden=false;scene.classList.add('invitation-open');opener.setAttribute('aria-expanded','true');
      animate(panel,[{opacity:0,transform:'perspective(1000px) rotateY(-14deg) translateX(30px)'},{opacity:1,transform:'perspective(1000px) rotateY(0) translateX(0)'}],{duration:1100});
      releaseScene(scene);window.Lux?.glint(opener,compact?12:22);
      panel.querySelector('.close-invitation').focus({preventScroll:true});
    });
    panel.querySelector('.close-invitation').addEventListener('click',()=>closeInvitation(scene,true));
    scene.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();closeInvitation(scene,true)}});
  });

  const story=document.getElementById('our-story');
  const storyImage=story.querySelector('.story-photo img');
  const storyTitle=story.querySelector('.display-title'),storyParagraph=story.querySelector('.story-paragraph');
  const storyPages=[
    {image:'assets/images/01-grand-arrival.webp',alt:storyImage.alt,title:'And suddenly,<br><em>everything</em><br>felt like music.',text:'There are places that take your breath away. And there are people who make you forget to breathe. Somewhere between golden sunsets and stolen glances, we found both.',signature:'the beginning of our forever ♡'},
    {image:'assets/images/04-aegean-promise.webp',alt:'The couple gazing into a Santorini sunset together',title:'The world<br>turned <em>gold.</em><br>And we stayed.',text:'Some days become more than memories. They become a feeling you carry with you: the warmth of a hand, the light on the water, the beautiful certainty of being exactly where you belong.',signature:'our favourite golden hours ♡'},
    {image:'assets/images/03-love-beyond-words.webp',alt:'The couple touching foreheads in a quiet intimate moment',title:'A thousand<br>tomorrows.<br><em>Always you.</em>',text:'Not every promise needs an audience. Some live in the smallest moments: a quiet smile, a familiar voice, a hand that never lets go. Ours is the promise to keep choosing each other.',signature:'a promise, softly made ♡'}
  ];
  const storyButtons=[...story.querySelectorAll('[data-story]')];
  storyButtons.forEach((button,index)=>button.addEventListener('click',()=>{
    if(button.getAttribute('aria-pressed')==='true')return;
    const page=storyPages[index];storyButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    storyImage.src=page.image;storyImage.alt=page.alt;storyTitle.innerHTML=page.title;storyParagraph.textContent=page.text;
    story.querySelector('.signed-line').textContent=page.signature;
    document.getElementById('storyPageNumber').textContent=`${String(index+1).padStart(2,'0')} / 03`;
    animate(storyImage,[{opacity:.2,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:1200});
    [storyTitle,storyParagraph].forEach((el,i)=>animate(el,[{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:900,delay:i*80}));
  }));
  document.getElementById('joinStars').addEventListener('click',e=>{
    document.getElementById('prologue').classList.add('stars-joined');
    e.currentTarget.setAttribute('aria-pressed','true');e.currentTarget.textContent='A universe, written together ✧';
    document.getElementById('destinyWhisper').textContent='Some things were always meant to find each other.';
    window.Lux?.glint(e.currentTarget,24);
  });
  document.querySelectorAll('.promise-toggle').forEach(button=>button.addEventListener('click',()=>{
    const open=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(open));
    const note=document.getElementById(button.getAttribute('aria-controls'));note.hidden=!open;
    button.closest('.soul-card').classList.toggle('promise-open',open);
    if(open){animate(note,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}]);window.Lux?.glint(button,10);}
  }));

  const orchardPositions=[[35,34],[64,21],[25,55],[73,47],[43,15],[52,38]];
  function growBlessings(wishes){
    const lights=document.getElementById('orchardLights');lights.replaceChildren();
    document.getElementById('orchardCount').textContent=wishes.length?`${wishes.length} ${wishes.length===1?'little light':'little lights'}. An ever-growing love.`:'Be the first light in our garden.';
    const latest=[...wishes].reverse();
    function showWish(wish,index){
      const display=document.getElementById('orchardWish');
      display.querySelector('p').textContent='“'+wish.message+'”';
      display.querySelector('small').textContent='WITH LOVE, '+wish.name.toUpperCase();
      [...lights.children].forEach((flower,i)=>flower.setAttribute('aria-pressed',String(i===index)));
      animate(display,[{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:650});
    }
    latest.slice(0,6).forEach((wish,index)=>{
      const flower=document.createElement('button');flower.type='button';flower.className='orchard-flower';flower.textContent=index%2?'✧':'✿';
      flower.style.setProperty('--flower-x',`${orchardPositions[index][0]}%`);flower.style.setProperty('--flower-y',`${orchardPositions[index][1]}%`);
      flower.setAttribute('aria-label',`Read the blessing from ${wish.name}`);flower.setAttribute('aria-pressed','false');
      flower.addEventListener('click',()=>showWish(wish,index));lights.append(flower);
    });
    if(latest[0]){showWish(latest[0],0);window.Lux?.glint(document.getElementById('wishOrchard'),12);}
  }
  function resonate(midi){
    const score=document.getElementById('guestNotes');
    const note=document.createElement('span');note.className='written-note';note.title=noteName(midi);
    note.style.setProperty('--note-y',`${Math.max(-13,Math.min(13,(72-midi)*1.4))}px`);
    score.append(note);
    while(score.querySelectorAll('.written-note').length>12)score.querySelector('.written-note').remove();
    animate(note,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:`translateY(${Math.max(-13,Math.min(13,(72-midi)*1.4))}px)`}],{duration:700});
  }
  window.RoyalWorld={growBlessings,resonate,tourAct:index=>{selectAct(index);scenes[activeAct].querySelector('.scene-unveil').click();}};growBlessings(blessings);

  const rsvpForm=document.getElementById('rsvpForm'),rsvpCard=document.querySelector('.rsvp-card');
  function updatePass(){
    document.getElementById('ticketGuestName').textContent=document.getElementById('guestName').value.trim()||'Reserved for someone very dear to us.';
    rsvpCard.classList.remove('is-prepared');document.getElementById('rsvpResult').hidden=true;
    document.getElementById('ticketState').textContent='YOUR PRESENCE IS OUR GREATEST GIFT';
  }
  rsvpForm.addEventListener('input',updatePass);rsvpForm.addEventListener('change',updatePass);
  rsvpForm.addEventListener('submit',()=>{
    if(!document.getElementById('guestName').value.trim())return;
    rsvpCard.classList.add('is-prepared');
    document.getElementById('ticketGuestName').textContent=document.getElementById('guestName').value.trim();
    const accepts=document.querySelector('input[name="attendance"]:checked').value==='Joyfully accepts';
    document.getElementById('ticketState').textContent=accepts?'YOUR REPLY, BEAUTIFULLY PREPARED':'YOUR LOVE, SENT FROM AFAR · REPLY PREPARED';
    animate(rsvpCard.querySelector('.pass-crest'),[{transform:'scale(.9)',opacity:.5},{transform:'scale(1)',opacity:1}],{duration:1100});
  });
  document.getElementById('makeWish').addEventListener('click',()=>document.getElementById('forever').classList.add('wish-made'));
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)return;
    effectsTimers.forEach(clearTimeout);effectsTimers.clear();scenes.forEach(scene=>scene.querySelector('.scene-effects').replaceChildren());
  });
  motion.addEventListener('change',()=>{
    if(motion.matches){effectsTimers.forEach(clearTimeout);effectsTimers.clear();scenes.forEach(scene=>scene.querySelector('.scene-effects').replaceChildren());}
  });
})();
