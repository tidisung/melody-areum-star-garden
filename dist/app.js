const pageParam=new URLSearchParams(location.search).get('page');
const page=['melody','areum','admin'].includes(pageParam)?pageParam:'melody';
const isAdmin=page==='admin';
document.body.dataset.role=isAdmin?'admin':'child';
const DESSERTS=[{"name": "혜자로운 소보로땅콩크림빵", "note": "고소한 땅콩크림이 가득!", "emoji": "🥜", "cost": 1, "bg": "#fff", "image": "assets/peanut.png"}, {"name": "혜자로운 단팥크림빵", "note": "단팥과 크림의 달콤한 만남", "emoji": "🍞", "cost": 1, "bg": "#fff", "image": "assets/redbean.png"}, {"name": "서울우유 우유크림빵", "note": "부드러운 우유크림 한가득", "emoji": "🥛", "cost": 1, "bg": "#fff", "image": "assets/milk-bread.png"}, {"name": "서울우유 우유크림모찌롤", "note": "폭신하고 쫀득한 크림 롤", "emoji": "🍰", "cost": 2, "bg": "#fff", "image": "assets/milk-roll.png"}, {"name": "한정선 요거트 찹쌀떡", "note": "쫀득한 찹쌀떡 속 요거트 크림", "emoji": "🍡", "cost": 2, "bg": "#fff", "image": "assets/yogurt.png"}];
const KEY='star-garden-v1';
const defaults=()=>({children:[{name:'멜로디',stars:0,tickets:0},{name:'아름이',stars:0,tickets:0}],threshold:10,rewards:DESSERTS.map(r=>({...r})),history:[]});
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Array.isArray(state.children)||!Array.isArray(state.rewards))throw Error()}catch{state=defaults()}if(state.catalogVersion!==2){state.rewards=DESSERTS.map(r=>({...r}));state.catalogVersion=2;try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}let active=page==='areum'?1:0;const $=s=>document.querySelector(s),child=()=>state.children[active],esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{toast('저장 공간을 확인해 주세요. 기록을 저장하지 못했어요.');return false}}
function record(icon,text,amount){state.history.unshift({child:active,icon,text,amount,date:Date.now()});state.history=state.history.slice(0,200)}
function render(){const c=child();renderGiftScene();renderDailyStars();document.title=isAdmin?'관리자 · 반짝정원':c.name+'의 반짝정원';if(isAdmin)renderAdmin();$('#childName').textContent=c.name;$('#greetingName').textContent=c.name;$('#shopName').textContent=c.name;$('#shopTickets').textContent=c.tickets;$('#stars').textContent=c.stars;$('#tickets').textContent=c.tickets;document.querySelectorAll('[data-child]').forEach(b=>{b.classList.toggle('selected',+b.dataset.child===active);b.setAttribute('aria-pressed',+b.dataset.child===active)});$('#starTrack').innerHTML=Array.from({length:state.threshold},(_,i)=>`<span class="${i<c.stars?'filled':''}" aria-label="${i+1}번째 별 ${i<c.stars?'완료':'빈칸'}">${cuteStar()}<small>${i<c.stars?'참 잘했어':i+1}</small></span>`).join('');$('#progressText').textContent=c.stars>=state.threshold?'골든티켓을 만들 준비가 됐어요!':`별 ${state.threshold-c.stars}개 더 모으면 골든티켓 1장!`;$('#progressCount').textContent=`${c.stars} / ${state.threshold}`;$('#convert').disabled=c.stars<state.threshold;$('#rewardCards').innerHTML=state.rewards.map((r,i)=>`<article class="reward"><div class="reward-heading"><span class="reward-number">${i+1}</span><span class="reward-kind">GS25 디저트</span><h3>${esc(r.name)}</h3></div><button type="button" class="reward-art photo-preview" data-preview="${i}" aria-label="${esc(r.name)} 사진 확대" aria-haspopup="dialog" style="--bg:${r.bg}">${r.image?`<img src="${esc(r.image)}" alt="${esc(r.name)} 상품 사진" loading="lazy">`:r.emoji}<span class="zoom-badge" aria-hidden="true">⊕</span><span class="zoom-hint" aria-hidden="true">사진 크게 보기</span></button><p>${esc(r.note)}</p><div class="reward-price"><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> × ${r.cost}</div><button data-reward="${i}">이 선물 고르기</button></article>`).join('');$('#dots').innerHTML=state.rewards.map((r,i)=>`<button class="${i===0?'active':''}" aria-label="${esc(r.name)} 보기" data-slide="${i}"></button>`).join('');const list=state.history.filter(h=>h.child===active).slice(0,15);$('#history').innerHTML=list.length?list.map(h=>`<div class="entry"><div class="entry-icon">${h.icon==='🎟️'||h.icon==='🎟'?goldenTicket():esc(h.icon)}</div><div class="entry-body">${esc(h.text)}<small>${new Date(h.date).toLocaleDateString('ko-KR',{month:'long',day:'numeric'})}</small></div><b>${esc(h.amount)}</b></div>`).join(''):'<div class="empty">아직 정원에 별이 없어요 ✧<br><br>첫 번째 반짝이는 순간을 선물해 주세요.</div>'}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000)}
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<22;i++){let el=document.createElement('span');el.className='confetti-piece';el.textContent=['⭐','✦','🌸'][i%3];el.style.left=Math.random()*100+'%';el.style.animationDelay=Math.random()*.4+'s';$('#confetti').append(el);setTimeout(()=>el.remove(),2400)}}
function modal(html,fn){$('#modalBody').innerHTML=html;$('#modalForm').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();if(fn()!==false)$('#modal').close()};$('#modal').showModal()}
function transaction(fn){const before=JSON.stringify(state);fn();if(!save()){state=JSON.parse(before);return false}render();celebrate();return true}
document.querySelectorAll('[data-child]').forEach(b=>b.onclick=()=>{if(!isAdmin)return;active=+b.dataset.child;render()});
$('#give').onclick=()=>isAdmin&&modal(`<div class="big-emoji">⭐</div><h2>${child().name}에게 별 선물하기</h2><p>오늘의 작은 노력을 칭찬해 주세요.</p><label for="reason">어떤 멋진 일이 있었나요?</label><input id="reason" maxlength="60" placeholder="예: 장난감을 스스로 정리했어요" required><label for="amount">선물할 별</label><select id="amount"><option value="1">별 1개</option><option value="2">별 2개</option><option value="3">별 3개</option><option value="4" selected>별 4개 · 하루의 반짝임</option><option value="5">별 5개</option></select><button class="primary">별 선물 보내기</button>`,()=>{let reason=$('#reason').value.trim();if(!reason){$('#reason').focus();return false}let amount=+$('#amount').value;return transaction(()=>{child().stars+=amount;record('⭐',reason,`+${amount} 별`)})});
$('#convert').onclick=()=>modal(`<div class="big-emoji"><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"></div><h2>반짝! 골든티켓 만들기</h2><p>별 ${state.threshold}개를 골든티켓 1장으로 바꿔요.<br>멋지게 모은 별로 어떤 선물을 고를까요?</p><button class="primary">별 ${state.threshold}개로 티켓 만들기</button>`,()=>{if(child().stars<state.threshold)return false;return transaction(()=>{child().stars-=state.threshold;child().tickets++;record('🎟️','골든티켓을 만들었어요','+1 티켓')})});
$('#rewardCards').onclick=e=>{const preview=e.target.closest('[data-preview]');if(preview){openPhoto(+preview.dataset.preview);return}let b=e.target.closest('[data-reward]');if(!b)return;let r=state.rewards[+b.dataset.reward];if(child().tickets<r.cost){toast(`이 선물까지 골든티켓 ${r.cost-child().tickets}장 더 모아요!`);return}modal(`<div class="big-emoji">${r.emoji}</div><h2>${esc(r.name)}, 골랐어요!</h2><p>${child().name}의 골든티켓 ${r.cost}장을 사용해요.<br>보호자와 함께 확인하고 실제 선물로 바꿔 주세요.</p><button class="primary"><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> ${r.cost}장 사용하고 교환하기</button>`,()=>{if(child().tickets<r.cost)return false;return transaction(()=>{child().tickets-=r.cost;record(r.emoji,`${r.name} 교환`, `−${r.cost} 티켓`)})})};
$('#dots').onclick=e=>{const b=e.target.closest('[data-slide]');if(b){const card=$('#rewardCards').children[+b.dataset.slide];$('#rewardCards').scrollTo({left:card.offsetLeft-$('#rewardCards').children[0].offsetLeft,behavior:'smooth'})}};
$('#rewardCards').onscroll=()=>{const el=$('#rewardCards'),width=el.children[0].getBoundingClientRect().width+16;let index=Math.round(el.scrollLeft/width);document.querySelectorAll('#dots button').forEach((b,i)=>b.classList.toggle('active',i===index))};
function setView(view){document.body.dataset.view=view;document.querySelectorAll('nav [data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false')});window.scrollTo({top:0,behavior:'instant'})}document.querySelectorAll('nav [data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('#shopGuide').onclick=()=>modal('<h2>선물을 고르기 전에</h2><p>⭐ 별을 모아 골든티켓을 만들어요.<br><img class="golden-ticket-icon" src="assets/golden-ticket.svg" alt="" aria-hidden="true"> 선물마다 필요한 티켓 수가 달라요.<br>🎁 교환을 확정하면 티켓이 차감되고 기록에 남아요.<br>♡ 실제 선물은 보호자가 준비해서 전달해 주세요.</p><button class="primary">알겠어요!</button>',()=>true);setView('board');
function editRewards(){if(!isAdmin)return;modal(`<h2>우리 가족의 보상 메뉴</h2><p>좋아하는 선물 5개와 필요한 티켓 수를 정해요.</p><div class="edit-row"><span>선물 이름</span><span>티켓</span></div>${state.rewards.map((r,i)=>`<div class="edit-row"><input aria-label="${i+1}번째 보상 이름" id="r${i}" value="${esc(r.name)}" maxlength="25" required><select aria-label="${i+1}번째 보상 티켓 수" id="c${i}">${[1,2,3,4,5].map(v=>`<option value="${v}" ${r.cost===v?'selected':''}>${v}장</option>`).join('')}</select></div>`).join('')}<button class="primary">메뉴 저장하기</button>`,()=>{if(state.rewards.some((r,i)=>!$('#r'+i).value.trim()))return false;const before=JSON.stringify(state);state.rewards.forEach((r,i)=>{r.name=$('#r'+i).value.trim();r.cost=+$('#c'+i).value});if(!save()){state=JSON.parse(before);return false}render();toast('보상 가게를 새롭게 꾸몄어요')})}
$('#editRewards').onclick=editRewards;
$('#settings').onclick=()=>isAdmin&&modal(`<h2>보호자 설정</h2><p>우리 가족에게 맞는 별 모으기 규칙을 정해요.</p><label for="threshold">골든티켓 1장에 필요한 별</label><input type="number" id="threshold" min="1" max="100" value="${state.threshold}" required><p class="hint">별 주기와 교환은 보호자와 함께 사용해 주세요. 별도 잠금 기능은 없어요.<br>기록은 이 브라우저에 저장되며 다른 기기와 자동으로 공유되지 않아요. 브라우저 데이터를 삭제하면 기록도 사라져요.</p><button class="primary">설정 저장하기</button>`,()=>{const value=+$('#threshold').value;if(!Number.isInteger(value)||value<1||value>100)return false;const old=state.threshold;state.threshold=value;if(!save()){state.threshold=old;return false}render();toast('별 모으기 규칙을 저장했어요')});render();

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
// Keep the three pages in the same browser up to date when another tab changes data.
window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;try{const next=JSON.parse(e.newValue);if(!Array.isArray(next.children)||next.children.length!==2||!Array.isArray(next.rewards))return;document.querySelectorAll('dialog[open]').forEach(d=>d.close());state=next;render()}catch{}});

function seoulDay(date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
function earnedToday(){const today=seoulDay(new Date());return state.history.filter(h=>h.child===active&&h.icon==='⭐'&&seoulDay(new Date(h.date))===today).reduce((sum,h)=>sum+(Number((h.amount||'').match(/^\+(\d+) 별$/)?.[1])||0),0)}
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
function moveStars(data,from,to,amount){
 if(![0,1].includes(from)||![0,1].includes(to)||from===to||![1,2,3].includes(amount))throw new Error('보낼 별을 다시 골라 주세요.');
 if(data.children[from].stars<amount)throw new Error('보낼 별이 부족해요. 가진 별을 다시 확인해 주세요.');
 data.children[from].stars-=amount;data.children[to].stars+=amount;
 const date=Date.now();data.history.unshift({child:to,icon:'💌',text:data.children[from].name+'에게 별을 받았어요',amount:'+'+amount+' 별',date},{child:from,icon:'💝',text:data.children[to].name+'에게 별을 보냈어요',amount:'−'+amount+' 별',date});data.history=data.history.slice(0,200);
}
$('#giftForm').onsubmit=async event=>{
 event.preventDefault();if(giftBusy||isAdmin||giftTo===null)return;
 const chosen=$('#giftOptions input:checked');if(!chosen)return;
 const amount=+chosen.value,from=active,to=giftTo;giftBusy=true;$('#sendGift').disabled=true;
 const send=()=>{const stored=localStorage.getItem(KEY);const next=stored?JSON.parse(stored):JSON.parse(JSON.stringify(state));moveStars(next,from,to,amount);localStorage.setItem(KEY,JSON.stringify(next));state=next;};
 try{if(navigator.locks)await navigator.locks.request('star-garden-state',send);else send();$('#giftDialog').close();render();celebrate();toast(state.children[to].name+'에게 별 '+amount+'개를 보냈어요!');}
 catch(error){$('#giftError').textContent=error instanceof Error&&error.message.startsWith('보낼 별')?error.message:'별을 보내지 못했어요. 잠시 후 다시 시도해 주세요.';}
 finally{giftBusy=false;$('#sendGift').disabled=false;}
};
$('#closeGift').onclick=()=>{if(!giftBusy)$('#giftDialog').close()};
$('#giftDialog').addEventListener('cancel',event=>{if(giftBusy)event.preventDefault()});
