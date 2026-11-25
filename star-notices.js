// A device remembers acknowledged gifts; balances always come from the server.
window.createStarNotices=function({child,name,star,escapeText,celebrate}){
 const key='star-garden-notice-'+child;
 let cursor=null,queue=[],current=null;
 let audio=null,lastSound=-Infinity;
 function prepareAudio(){
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio)return Promise.resolve(false);
   if(!audio)audio=new Audio();
   return Promise.resolve(audio.state==='running'?undefined:audio.resume()).then(()=>audio.state==='running').catch(()=>false);
  }catch{return Promise.resolve(false)}
 }
 // Safari permits audio after a real touch/key interaction in this page.
 const unlock=()=>{void prepareAudio()};
 document.addEventListener('pointerdown',unlock,{passive:true});
 document.addEventListener('keydown',unlock);
 function playChime(){
  if(!audio||audio.state!=='running'||audio.currentTime-lastSound<1.5)return;
  lastSound=audio.currentTime;
  try{
   const volume=audio.createGain();volume.gain.value=.16;volume.connect(audio.destination);
   [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>{
    const start=audio.currentTime+i*.15,osc=audio.createOscillator(),gain=audio.createGain();
    osc.type='sine';osc.frequency.value=frequency;
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.7,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.65);
    osc.connect(gain);gain.connect(volume);osc.start(start);osc.stop(start+.7);
    osc.onended=()=>{osc.disconnect();gain.disconnect();if(i===3)volume.disconnect()};
   });
  }catch{} // Sound must never prevent a gift from being shown.
 }

 try{const saved=localStorage.getItem(key);if(saved!==null&&Number.isSafeInteger(Number(saved)))cursor=Number(saved)}catch{}
 function remember(id){cursor=Math.max(cursor||0,id);try{localStorage.setItem(key,String(cursor))}catch{}}
 const dialog=document.createElement('dialog');dialog.className='star-notice';dialog.setAttribute('aria-labelledby','starNoticeTitle');document.body.append(dialog);
 function show(){
  if(current||!queue.length||document.hidden||document.querySelector('dialog[open]'))return;
  current=queue.shift();
  dialog.innerHTML=`<form method="dialog"><div class="star-notice-art" aria-hidden="true">${star()}<span class="star-sparkle sparkle-one">✦</span><span class="star-sparkle sparkle-two">✧</span><span class="star-sparkle sparkle-three">✦</span><span class="star-sparkle sparkle-four">✧</span></div><p class="star-notice-eyebrow">반짝! 별 선물이 도착했어요</p><h2 id="starNoticeTitle">${escapeText(name)}, 축하해!</h2><div class="star-notice-amount">${escapeText(current.amount)}</div><p class="star-notice-from">${current.icon==='⭐'?'아빠가 칭찬을 보냈어요 ♡':'사랑이 담긴 별 선물이에요 ♡'}</p><blockquote>${escapeText(current.text)}</blockquote><button type="button" class="star-chime-button">♫ 축하 소리 듣기</button><button class="primary" autofocus>고마워요! ⭐</button></form>`;
  dialog.querySelector('.star-chime-button').onclick=async()=>{if(await prepareAudio())playChime()};
  dialog.showModal();celebrate();playChime();
 }
 dialog.addEventListener('close',()=>{if(current)remember(current.id);current=null;show()});
 document.addEventListener('close',()=>setTimeout(show,0),true);
 document.addEventListener('visibilitychange',show);
 window.addEventListener('focus',show);
 return {scan(history){
  const latest=Math.max(0,...history.map(h=>Number(h.id)||0));
  // First connection starts here instead of replaying the whole old diary.
  if(cursor===null){remember(latest);return}
  for(const h of [...history].sort((a,b)=>a.id-b.id)){
   if(h.id>cursor&&h.child===child&&['⭐','💌'].includes(h.icon)&&/^\+[1-3] 별$/.test(h.amount)&&h.id!==current?.id&&!queue.some(q=>q.id===h.id))queue.push(h);
  }
  show();
 }};
};
