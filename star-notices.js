// A device remembers acknowledged gifts; balances always come from the server.
window.createStarNotices=function({child,name,star,escapeText,celebrate}){
 const key='star-garden-notice-'+child;
 let cursor=null,queue=[],current=null;
 try{const saved=localStorage.getItem(key);if(saved!==null&&Number.isSafeInteger(Number(saved)))cursor=Number(saved)}catch{}
 function remember(id){cursor=Math.max(cursor||0,id);try{localStorage.setItem(key,String(cursor))}catch{}}
 const dialog=document.createElement('dialog');dialog.className='star-notice';dialog.setAttribute('aria-labelledby','starNoticeTitle');document.body.append(dialog);
 function show(){
  if(current||!queue.length||document.hidden||document.querySelector('dialog[open]'))return;
  current=queue.shift();
  dialog.innerHTML=`<form method="dialog"><div class="star-notice-art" aria-hidden="true">${star()}</div><p class="star-notice-eyebrow">반짝! 별 선물이 도착했어요</p><h2 id="starNoticeTitle">${escapeText(name)}, 축하해!</h2><div class="star-notice-amount">${escapeText(current.amount)}</div><p class="star-notice-from">${current.icon==='⭐'?'아빠가 칭찬을 보냈어요 ♡':'사랑이 담긴 별 선물이에요 ♡'}</p><blockquote>${escapeText(current.text)}</blockquote><button class="primary" autofocus>고마워요! ⭐</button></form>`;
  dialog.showModal();celebrate();
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
