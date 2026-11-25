const pageParam=new URLSearchParams(location.search).get('page');
const page=['melody','areum','admin'].includes(pageParam)?pageParam:'melody';
const isAdmin=page==='admin';
document.body.dataset.role=isAdmin?'admin':'child';
const DESSERTS=VERIFIED_REWARDS.slice(0,5);
const KEY='star-garden-v1';
const defaults=()=>({children:[{name:'멜로디',stars:0,tickets:0},{name:'아름이',stars:0,tickets:0}],threshold:10,rewards:DESSERTS.map(r=>({...r})),history:[]});
let state=window.cloudInitialState;let active=page==='areum'?1:0;const $=s=>document.querySelector(s),child=()=>state.children[active],esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){window.renderWishCards?.();const c=child();renderGiftScene();renderDailyStars();document.title=isAdmin?'관리자 · 반짝정원':c.name+'의 반짝정원';if(isAdmin)renderAdmin();$('#childName').textContent=c.name;$('#greetingName').textContent=c.name;$('#shopName').textContent=c.name;$('#shopTickets').textContent=c.tickets;$('#stars').textContent=c.stars;$('#tickets').textContent=c.tickets;document.querySelectorAll('[data-child]').forEach(b=>{b.classList.toggle('selected',+b.dataset.child===active);b.setAttribute('aria-pressed',+b.dataset.child===active)});$('#starTrack').innerHTML=Array.from({length:state.threshold},(_,i)=>`<span class="${i<c.stars?'filled':''}" aria-label="${i+1}번째 별 ${i<c.stars?'완료':'빈칸'}">${cuteStar()}<small>${i<c.stars?'참 잘했어':i+1}</small></span>`).join('');$('#progressText').textContent=c.stars>=state.threshold?'골든티켓을 만들 준비가 됐어요!':`별 ${state.threshold-c.stars}개 더 모으면 골든티켓 1장!`;$('#progressCount').textContent=`${c.stars} / ${state.threshold}`;$('#convert').disabled=c.stars<state.threshold;$('#rewardCards').innerHTML=state.rewards.map((r,i)=>`<article class="reward"><div class="reward-heading"><span class="reward-number">${i+1}</span><span class="reward-kind">${esc(r.category||'선물')}</span><h3>${esc(r.name)}</h3></div><button type="button" class="reward-art photo-preview" data-preview="${i}" aria-label="${esc(r.name)} 확대" aria-haspopup="dialog" style="--bg:${r.bg}">${r.image?`<img src="${esc(r.image)}" alt="${esc(r.name)} 상품 사진" loading="lazy">`:r.emoji}<span class="zoom-badge" aria-hidden="true">⊕</span><span class="zoom-hint" aria-hidden="true">크게 보기</span></button><p>${esc(r.note)}</p><div class="reward-price"><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> × ${r.cost}</div><button data-reward="${i}">이 선물 고르기</button></article>`).join('');$('#dots').innerHTML=state.rewards.map((r,i)=>`<button class="${i===0?'active':''}" aria-label="${esc(r.name)} 보기" data-slide="${i}"></button>`).join('');const list=state.history.filter(h=>h.child===active);$('#history').innerHTML=list.length?list.map(h=>`<div class="entry"><div class="entry-icon">${h.icon==='🎟️'||h.icon==='🎟'?goldenTicket():esc(h.icon)}</div><div class="entry-body">${esc(h.text)}<small>${new Date(h.date).toLocaleDateString('ko-KR',{month:'long',day:'numeric'})}</small></div><b>${esc(h.amount)}</b></div>`).join(''):'<div class="empty">아직 정원에 별이 없어요 ✧<br><br>첫 번째 반짝이는 순간을 선물해 주세요.</div>'}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000)}
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<22;i++){let el=document.createElement('span');el.className='confetti-piece';el.textContent=['⭐','✦','🌸'][i%3];el.style.left=Math.random()*100+'%';el.style.animationDelay=Math.random()*.4+'s';$('#confetti').append(el);setTimeout(()=>el.remove(),2400)}}
function modal(html,fn){$('#modalBody').innerHTML=html;let busy=false;$('#modalForm').onsubmit=async e=>{if(busy){e.preventDefault();return}if(e.submitter?.value==='cancel')return;e.preventDefault();busy=true;const button=e.submitter;if(button)button.disabled=true;try{if(await fn()!==false)$('#modal').close()}catch(error){toast(error.message)}finally{busy=false;if(button)button.disabled=false}};$('#modal').showModal()}
document.querySelectorAll('[data-child]').forEach(b=>b.onclick=()=>{if(!isAdmin)return;active=+b.dataset.child;render()});
$('#give').onclick=()=>{
 if(!isAdmin)return;const receiver=active;
 modal(`<h2>${esc(state.children[receiver].name)}에게 별 선물하기</h2><p>오늘의 작은 노력을 칭찬해 주세요.</p><label for="reason">어떤 멋진 일이 있었나요?</label><input id="reason" maxlength="60" placeholder="예: 장난감을 스스로 정리했어요" required><button type="button" id="selectOneStar" class="one-star" aria-pressed="false" aria-label="선물할 별 한 개 선택">${cuteStar()}<span>별 1개</span></button><button id="submitOneStar" class="primary" disabled>별 선물 보내기</button>`,()=>{if($('#selectOneStar').getAttribute('aria-pressed')!=='true'||!$('#reason').value.trim())return false;return Cloud.action({type:'give',child:receiver,reason:$('#reason').value.trim(),amount:1}).then(()=>{celebrate();return true})});
 const update=()=>{$('#submitOneStar').disabled=!$('#reason').value.trim()||$('#selectOneStar').getAttribute('aria-pressed')!=='true'};
 $('#reason').oninput=update;
 $('#selectOneStar').onclick=()=>{const b=$('#selectOneStar');b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');update()};
};
$('#convert').onclick=()=>modal(`<div class="big-emoji"><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"></div><h2>반짝! 골든티켓 만들기</h2><p>별 ${state.threshold}개를 골든티켓 1장으로 바꿔요.<br>멋지게 모은 별로 어떤 선물을 고를까요?</p><button class="primary">별 ${state.threshold}개로 티켓 만들기</button>`,()=>{if(child().stars<state.threshold)return false;return Cloud.action({type:'convert',child:active}).then(()=>{celebrate();return true})});
$('#rewardCards').onclick=e=>{const preview=e.target.closest('[data-preview]');if(preview){openPhoto(+preview.dataset.preview);return}let b=e.target.closest('[data-reward]');if(!b)return;let r=state.rewards[+b.dataset.reward];if(child().tickets<r.cost){toast(`이 선물까지 골든티켓 ${r.cost-child().tickets}장 더 모아요!`);return}modal(`<div class="big-emoji">${r.emoji}</div><h2>${esc(r.name)}, 골랐어요!</h2><p>${child().name}의 골든티켓 ${r.cost}장을 사용해요.<br>보호자와 함께 확인하고 실제 선물로 바꿔 주세요.</p><button class="primary"><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> ${r.cost}장 사용하고 교환하기</button>`,()=>{if(child().tickets<r.cost)return false;return Cloud.action({type:'redeem',child:active,image:r.image,name:r.name,cost:r.cost}).then(()=>{celebrate();return true})})};
$('#dots').onclick=e=>{const b=e.target.closest('[data-slide]');if(b){const card=$('#rewardCards').children[+b.dataset.slide];$('#rewardCards').scrollTo({left:card.offsetLeft-$('#rewardCards').children[0].offsetLeft,behavior:'smooth'})}};
$('#rewardCards').onscroll=()=>{const el=$('#rewardCards'),width=el.children[0].getBoundingClientRect().width+16;let index=Math.round(el.scrollLeft/width);document.querySelectorAll('#dots button').forEach((b,i)=>b.classList.toggle('active',i===index))};
function setView(view){document.body.dataset.shop="home";document.body.dataset.view=view;document.querySelectorAll('nav [data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false')});window.scrollTo({top:0,behavior:'instant'})}document.querySelectorAll('nav [data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('#shopGuide').onclick=()=>modal('<h2>선물을 고르기 전에</h2><p>⭐ 별을 모아 골든티켓을 만들어요.<br><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> 선물마다 필요한 티켓 수가 달라요.<br>🎁 교환을 확정하면 티켓이 차감되고 기록에 남아요.<br>♡ 실제 선물은 보호자가 준비해서 전달해 주세요.</p><button class="primary">알겠어요!</button>',()=>true);setView('board');
function editRewards(){if(!isAdmin)return;modal(`<h2>우리 가족의 보상 메뉴</h2><p>현재 진열된 선물 5개를 수정해요. 매주 월요일에 새 메뉴로 바뀌어요.</p><div class="edit-row"><span>선물 이름</span><span>티켓</span></div>${state.rewards.map((r,i)=>`<div class="edit-row"><input aria-label="${i+1}번째 보상 이름" id="r${i}" value="${esc(r.name)}" maxlength="25" required><select aria-label="${i+1}번째 보상 티켓 수" id="c${i}">${[1,2,3,4,5].map(v=>`<option value="${v}" ${r.cost===v?'selected':''}>${v}장</option>`).join('')}</select></div>`).join('')}<button class="primary">메뉴 저장하기</button>`,()=>{if(state.rewards.some((r,i)=>!$('#r'+i).value.trim()))return false;return Cloud.action({type:'rewards',slot:state.catalogSlot,items:state.rewards.map((r,i)=>({name:$('#r'+i).value.trim(),cost:+$('#c'+i).value}))}).then(()=>{toast('보상 메뉴를 저장했어요');return true})})}
$('#editRewards').onclick=editRewards;
$('#settings').onclick=()=>isAdmin&&modal(`<h2>보호자 설정</h2><label for="threshold">골든티켓 1장에 필요한 별</label><input type="number" id="threshold" min="1" max="100" value="${state.threshold}" required><p>규칙과 기록은 서버에 저장되고 모든 기기에 반영돼요.</p><button class="primary">설정 저장하기</button>`,()=>Cloud.action({type:'threshold',value:+$('#threshold').value}).then(()=>true));render();

function openPhoto(index){
 const reward=state.rewards[index];
 if(!reward)return;
 $('#photoTitle').textContent=reward.name;
 const image=$('#photoImage');
 image.src=reward.image||'';
 image.alt=reward.name+' 확대 사진';
 image.hidden=!reward.image;
 $('#photoEmoji').textContent=reward.image?'':reward.emoji;
 $('#photoPrice').textContent='골든티켓 '+reward.cost+'장';
 $('#photoDialog').showModal();
}
$('#closePhoto').onclick=()=>$('#photoDialog').close();
let photoBackdropDown=false;
$('#photoDialog').addEventListener('pointerdown',event=>{photoBackdropDown=event.target===$('#photoDialog')});
$('#photoDialog').addEventListener('click',event=>{if(photoBackdropDown&&event.target===$('#photoDialog'))$('#photoDialog').close();photoBackdropDown=false});

function renderAdmin(){
 $('#adminChildren').innerHTML=state.children.map((c,i)=>`<article class="admin-child"><div class="admin-child-top"><img class="admin-avatar" src="assets/${i===0?'melody':'areum'}-character.png" alt="${esc(c.name)} 캐릭터"><h3>${esc(c.name)}</h3><a href="?page=${i===0?'melody':'areum'}">아이 페이지</a></div><div class="admin-totals"><span>⭐ 별 <b>${c.stars}</b>개</span><span><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> 티켓 <b>${c.tickets}</b>장</span></div><button class="primary" data-admin-give="${i}">별 선물하기</button></article>`).join('');
 $('#adminRule').textContent='별 '+state.threshold+'개 = 골든티켓 1장';
}
$('#adminChildren').onclick=e=>{const b=e.target.closest('[data-admin-give]');if(!isAdmin||!b)return;active=+b.dataset.adminGive;render();$('#give').click()};
$('#adminRewards').onclick=editRewards;
$('#adminSettings').onclick=()=>$('#settings').click();
function seoulDay(date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
function earnedToday(){return state.dailyStars?.[active]||0}
function renderDailyStars(){const count=earnedToday();$('#todayCount').textContent='오늘 받은 별 '+count+'개';$('#todayStars').innerHTML=Array.from({length:4},(_,i)=>`<span class="daily-star ${i<count?'earned':''}" aria-label="오늘의 ${i+1}번째 별 ${i<count?'받음':'아직'}">${cuteStar()}<small>${i<count?'반짝!':'기다리는 중'}</small></span>`).join('');$('#todayMessage').textContent=count>=4?'오늘의 반짝임이 가득해요. 정말 멋졌어!':'하루에 별 네 개쯤, 작은 노력을 모아봐요.'}
window.addEventListener('focus',renderDailyStars);
setInterval(()=>{if(!document.hidden)renderDailyStars()},60000);

function cuteStar(){return `<svg class="cute-star" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path class="star-body" d="M43 13 Q50 1 57 13 L66 30 Q68 34 73 34 L90 37 Q104 39 94 50 L81 63 Q78 66 79 71 L82 88 Q84 102 71 95 L54 87 Q50 85 46 87 L29 95 Q16 102 18 88 L21 71 Q22 66 19 63 L6 50 Q-4 39 10 37 L27 34 Q32 34 34 30 Z"/><path class="star-shine" d="M45 21 Q48 14 51 16"/><g class="star-face"><ellipse class="star-blush" cx="31" cy="64" rx="7" ry="4"/><ellipse class="star-blush" cx="69" cy="64" rx="7" ry="4"/><ellipse class="star-eye" cx="38" cy="54" rx="2.7" ry="3.6"/><ellipse class="star-eye" cx="62" cy="54" rx="2.7" ry="3.6"/><path class="star-smile" d="M44 63 Q50 70 56 63"/></g></svg>`}

function goldenTicket(){return `<img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true">`}

function renderGiftScene(){
 document.querySelectorAll('[data-gift-to]').forEach(button=>{const target=+button.dataset.giftTo;button.disabled=isAdmin||target===active;});
 
}
let giftTo=null,giftBusy=false;
document.querySelectorAll('[data-gift-to]').forEach(button=>button.onclick=()=>{
 const to=+button.dataset.giftTo;if(isAdmin||to===active)return;giftTo=to;
 $('#giftTitle').textContent=state.children[to].name+'에게 별 보내기';
 $('#giftBalance').textContent=child().name+'가 가진 별은 '+child().stars+'개예요. 보내는 만큼 내 별이 줄어들어요.';
 $('#giftPortraits').innerHTML=`<img src="assets/${active===0?'melody':'areum'}-character.png" alt="${esc(child().name)}"><span>★ ♡ ★</span><img src="assets/${to===0?'melody':'areum'}-character.png" alt="${esc(state.children[to].name)}">`;
 $('#giftOptions').innerHTML=[1,2,3].map(n=>`<label class="gift-option"><input type="radio" name="giftAmount" value="${n}" ${n>child().stars?'disabled':''} ${n===1&&child().stars>=1?'checked':''}><span>${cuteStar()}<b>${n}개</b></span></label>`).join('');
 $('#giftError').textContent=child().stars<1?'아직 보낼 별이 없어요. 별을 받은 뒤 다시 와 줘!':'';
 $('#sendGift').disabled=child().stars<1;$('#giftDialog').showModal();
});
$('#giftForm').onsubmit=async event=>{
 event.preventDefault();if(giftBusy||isAdmin||giftTo===null)return;const chosen=$('#giftOptions input:checked');if(!chosen)return;
 giftBusy=true;$('#sendGift').disabled=true;
 try{const amount=+chosen.value,to=giftTo;await Cloud.action({type:'transfer',child:active,amount});$('#giftDialog').close();celebrate();toast(state.children[to].name+'에게 별 '+amount+'개를 보냈어요!')}
 catch(error){$('#giftError').textContent=error.message}finally{giftBusy=false;$('#sendGift').disabled=false}
};
$('#closeGift').onclick=()=>{if(!giftBusy)$('#giftDialog').close()};
$('#giftDialog').addEventListener('cancel',event=>{if(giftBusy)event.preventDefault()});

let rouletteBusy=false,wheelRotation=0;
function wishCardHTML(card){const p=WISH_PRIZES[card.rank-1];return `<article class="saved-wish rank-${p.rank}"><span class="wish-rank">${p.rank}등 · ${p.chance}%</span><h3>${p.icon} ${p.name}</h3><p>${esc(p.text)}</p>${p.rank===1?`<form data-wish-form="${esc(card.id)}"><label>나를 위한 소원<textarea name="wish" maxlength="500" rows="3" placeholder="내가 이루고 싶은 소원을 적어봐!" required>${esc(card.wish||'')}</textarea></label><button class="secondary" type="submit">소원 저장하기</button><span class="wish-save-status" role="status"></span></form>`:''}<small>${new Date(card.date).toLocaleDateString('ko-KR')} · ${esc(state.children[card.child].name)}</small></article>`}
window.renderWishCards=()=>{
 $('#wishCollection').innerHTML=(state.wishCards||[]).filter(c=>c.child===active).map(wishCardHTML).join('');
 $('#rouletteTickets').textContent=child().tickets;
};
window.renderWishCards();
$('#wishPrizeList').innerHTML=WISH_PRIZES.map(p=>`<article class="reward wish-prize-card" aria-label="${p.rank}등 ${p.name}, 당첨 확률 ${p.chance}%"><div class="reward-heading"><span class="reward-number">${p.rank}</span><span class="reward-kind">${p.rank}등 소원카드</span><h3>${p.name}</h3></div><div class="wish-card-art" aria-hidden="true">${p.icon}</div><p class="wish-card-description">${p.text}</p><div class="wish-card-chance">당첨 확률 <strong>${p.chance}%</strong><p class="chance-for-kids">${p.rank===1?'아주 많이 돌려 보면, 평균적으로<br>100번 중 약 3번 나오는 선물이야.':p.rank===2?'아주 많이 돌려 보면, 평균적으로<br>10번 중 약 1번 나오는 선물이야.':p.rank===3?'아주 많이 돌려 보면, 평균적으로<br>5번 중 약 1번 나오는 선물이야.':'아주 많이 돌려 보면, 평균적으로<br>3번 중 약 1번 나오는 결과야.'}</p></div></article>`).join('');
$('#wishPrizeDots').innerHTML=WISH_PRIZES.map((p,i)=>`<button type="button" data-wish-slide="${i}" class="${i===0?'active':''}" aria-label="${p.rank}등 ${p.name} 보기" aria-current="${i===0?'true':'false'}"></button>`).join('');
let angle=0;$('#wishWheel').innerHTML=WISH_PRIZES.map(p=>{const center=angle+p.chance*3.6/2;angle+=p.chance*3.6;return `<span style="transform:translate(-50%,-50%) rotate(${center}deg) translateY(-105px) rotate(-${center}deg)">${p.rank}</span>`}).join('');
$('#openRoulette').onclick=()=>{
 $('#rouletteDialog').dataset.stage='wheel';
 $('#wishResult').innerHTML='';$('#rouletteStatus').textContent='';
 $('#rouletteTickets').textContent=child().tickets;
 $('#spinRoulette').disabled=isAdmin||child().tickets<5;
 if(isAdmin)$('#rouletteStatus').textContent='아이 페이지에서 참여할 수 있어요.';
 else if(child().tickets<5)$('#rouletteStatus').textContent='참가하려면 골든티켓 5장이 필요해요.';
 $('#rouletteDialog').showModal();
};
$('#closeRoulette').onclick=()=>{if(!rouletteBusy)$('#rouletteDialog').close()};
$('#rouletteDialog').addEventListener('cancel',e=>{if(rouletteBusy)e.preventDefault()});
$('#spinRoulette').onclick=async()=>{
 if(rouletteBusy||isAdmin)return;
 rouletteBusy=true;$('#spinRoulette').disabled=true;$('#closeRoulette').disabled=true;$('#wishResult').innerHTML='';
 const owner=active;
 try{
  const {card}=await Cloud.action({type:'roulette',child:owner});
  render();$('#rouletteStatus').textContent='두근두근! 소원카드를 만나러 가요…';
  const p=WISH_PRIZES[card.rank-1],start=WISH_PRIZES.slice(0,card.rank-1).reduce((v,x)=>v+x.chance*3.6,0),center=start+p.chance*3.6/2;
  const target=(360-center)%360;wheelRotation+=1800+((target-wheelRotation%360+360)%360);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#wishWheel').style.transition=reduced?'none':'transform 3.6s cubic-bezier(.16,.75,.2,1)';
  $('#wishWheel').style.transform=`rotate(${wheelRotation}deg)`;
  if(!reduced)await new Promise(resolve=>setTimeout(resolve,3700));
  $('#rouletteStatus').textContent=card.rank===5?'골든티켓 3장을 돌려드렸어요!':card.rank+'등 당첨! 소원카드를 받았어요!';
  $('#wishResult').innerHTML=wishCardHTML(card);$('#wishResult').scrollIntoView({behavior:'smooth',block:'nearest'});
  if(card.rank<5)celebrate();
 }catch(error){$('#rouletteStatus').textContent=error.message;}
 finally{rouletteBusy=false;$('#closeRoulette').disabled=false;$('#spinRoulette').disabled=child().tickets<5;}
};
document.addEventListener('submit',async event=>{
 const form=event.target.closest('[data-wish-form]');if(!form)return;event.preventDefault();
 const wish=form.elements.wish.value.trim();if(!wish){form.elements.wish.focus();return}
 const button=form.querySelector('button');button.disabled=true;
 try{await Cloud.action({type:'wish',cardId:form.dataset.wishForm,wish});form.querySelector('.wish-save-status').textContent='소원을 저장했어요!';toast('소원을 저장했어요!');if(form.closest('#wishResult'))window.renderWishCards();}
 catch{form.querySelector('.wish-save-status').textContent='저장하지 못했어요. 다시 시도해 주세요.';}
 finally{button.disabled=false;}
});

function showShopMenu(){document.body.dataset.shop='home';window.scrollTo({top:0,behavior:'instant'});$('#openDirectShop').focus()}
$('#openDirectShop').onclick=()=>{document.body.dataset.shop='direct';window.scrollTo({top:0,behavior:'instant'});$('#shopBack').focus()};
$('#shopBack').onclick=showShopMenu;
$('#showWishPrizes').onclick=()=>{ $('#rouletteDialog').dataset.stage='prizes';$('#rouletteDialog').scrollTop=0;$('#wishPrizeList').scrollLeft=0;$('#wishPrizeList').focus({preventScroll:true});updateWishDots(); };
$('#backToWheel').onclick=()=>{ $('#rouletteDialog').dataset.stage='wheel';$('#rouletteDialog').scrollTop=0;$('#showWishPrizes').focus(); };
function renderVending(){ $('#vendingProducts').innerHTML=state.rewards.map(r=>`<span><img src="${esc(r.image)}" alt=""><small>▱ × ${r.cost}</small></span>`).join(''); }
renderVending();
const previousWishRender=window.renderWishCards;window.renderWishCards=()=>{previousWishRender();renderVending()};

function wishSlideIndex(){const list=$('#wishPrizeList'),cards=[...list.children];return cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-cards[0].offsetLeft-list.scrollLeft)<Math.abs(cards[best].offsetLeft-cards[0].offsetLeft-list.scrollLeft)?i:best,0)}
function updateWishDots(){const selected=wishSlideIndex();document.querySelectorAll('[data-wish-slide]').forEach((b,i)=>{b.classList.toggle('active',i===selected);b.setAttribute('aria-current',i===selected?'true':'false')})}
function goToWishSlide(index){const list=$('#wishPrizeList'),cards=list.children;index=Math.max(0,Math.min(cards.length-1,index));list.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
$('#wishPrizeList').addEventListener('scroll',updateWishDots,{passive:true});
$('#wishPrizeDots').onclick=e=>{const b=e.target.closest('[data-wish-slide]');if(b)goToWishSlide(+b.dataset.wishSlide)};
$('#wishPrizeList').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();goToWishSlide(wishSlideIndex()+(e.key==='ArrowRight'?1:-1))}});

window.acceptCloudState=next=>{state=next;render();$('#cloudStatus').textContent='서버에 저장됨';};
let cloudRefreshing=false;
async function refreshCloud(){if(cloudRefreshing||document.hidden)return;cloudRefreshing=true;try{if(!document.querySelector('dialog[open]'))await Cloud.recover();const next=await Cloud.request('/state');$('#cloudStatus').textContent='서버에 연결됨';if(!document.querySelector('dialog[open]')&&next.revision>state.revision){state=next;render()}else if(next.revision===state.revision&&!document.querySelector('dialog[open]')&&(next.catalogSlot!==state.catalogSlot||JSON.stringify(next.dailyStars)!==JSON.stringify(state.dailyStars))){state=next;render()}}catch(e){$('#cloudStatus').textContent=e.message}finally{cloudRefreshing=false}}
setInterval(refreshCloud,4000);window.addEventListener('focus',refreshCloud);document.addEventListener('visibilitychange',refreshCloud);window.addEventListener('online',refreshCloud);window.addEventListener('offline',()=>{$('#cloudStatus').textContent='오프라인 · 인터넷 연결 후 다시 시도해 주세요.'});
$('#loadOlderHistory').onclick=async()=>{const button=$('#loadOlderHistory');button.disabled=true;try{const oldest=state.history.reduce((n,h)=>Math.min(n,h.id||n),Number.MAX_SAFE_INTEGER);const result=await Cloud.request('/history?before='+oldest);if(!result.history.length){button.textContent='모든 기록을 확인했어요';return}state.history.push(...result.history);render()}catch(e){toast(e.message)}finally{button.disabled=false}};
function downloadJSON(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.querySelectorAll('[data-pair-child]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const result=await Cloud.request('/pair/create',{child:+b.dataset.pairChild});$('#pairLink').value=result.url;$('#pairLink').hidden=false;$('#copyPairLink').hidden=false;$('#pairMessage').textContent='이 링크를 해당 아이패드에서 한 번 열어 주세요. 1시간 동안 사용할 수 있어요.'}catch(e){$('#pairMessage').textContent=e.message}finally{b.disabled=false}});
$('#copyPairLink').onclick=async()=>{try{await navigator.clipboard.writeText($('#pairLink').value);toast('연결 링크를 복사했어요')}catch{$('#pairLink').select();toast('선택된 링크를 복사해 주세요')}};
$('#showDevices').onclick=async()=>{try{const result=await Cloud.request('/devices');$('#deviceList').innerHTML=result.devices.map(d=>`<p>${esc(d.label)} · ${new Date(d.created).toLocaleDateString('ko-KR')} <button data-revoke="${esc(d.id)}">연결 해제</button></p>`).join('')||'<p>아직 연결된 아이패드가 없어요.</p>'}catch(e){toast(e.message)}};
$('#deviceList').onclick=async e=>{const b=e.target.closest('[data-revoke]');if(!b)return;b.disabled=true;try{await Cloud.request('/devices/revoke',{id:b.dataset.revoke});$('#showDevices').click()}catch(e){toast(e.message);b.disabled=false}};
$('#exportCloud').onclick=async()=>{const b=$('#exportCloud');b.disabled=true;try{let after=0,history=[],snapshot;do{const part=await Cloud.request('/export?after='+after);snapshot=part.state;history.push(...part.history);after=part.next}while(after!==null);downloadJSON('반짝정원-서버백업-'+new Date().toISOString().slice(0,10)+'.json',{...snapshot,history});toast('전체 기록을 저장했어요')}catch(e){toast(e.message)}finally{b.disabled=false}};
$('#importCloud').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('파일이 너무 커요.');const snapshot=JSON.parse(await file.text());modal('<h2>기존 기록 가져오기</h2><p>선택한 파일의 별·티켓·소원을 비어 있는 서버에 한 번 저장해요. 지금 이 파일을 기준으로 시작할까요?</p><button class="primary">이 기록으로 시작하기</button>',()=>Cloud.action({type:'import',snapshot}).then(()=>{toast('기존 기록을 서버에 저장했어요');return true}))}catch(e){toast(e.message)}finally{e.target.value=''}};
