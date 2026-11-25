export const initialState=()=>({children:[{name:'멜로디',stars:0,tickets:0},{name:'아름이',stars:0,tickets:0}],threshold:10,wishCards:[],rewardOverrides:{},imported:false});
export const prizes=[{rank:1,name:'무조건소원카드',weight:30},{rank:2,name:'최강소원카드',weight:100},{rank:3,name:'금색소원카드',weight:200},{rank:4,name:'그냥그저그런소원카드',weight:335},{rank:5,name:'앗!망했다카드',weight:335}];
export function pickPrize(draw){if(!Number.isInteger(draw)||draw<0||draw>=1000)throw Error('올바르지 않은 추첨입니다.');let end=0;return prizes.find(p=>(end+=p.weight)>draw)}
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
function check(ok,msg){if(!ok)throw Error(msg)}
function admin(actor){check(actor.role==='admin','관리자만 할 수 있어요.')}
function owner(actor,id){check(integer(id,0,1)&&(actor.role==='admin'||actor.child===id),'내 계정에서만 할 수 있어요.')}
function text(value,max){check(typeof value==='string'&&value.trim().length>0&&value.trim().length<=max,'내용을 다시 확인해 주세요.');return value.trim()}
export function mutate(data,actor,input,{id,date,draw=0,rewards=[]}){
 const events=[],event=(child,icon,text,amount)=>events.push({child,icon,text,amount,date});
 const c=input.child;let result={};
 switch(input.type){
 case 'give':{admin(actor);check(integer(c,0,1)&&input.amount===1,'별 개수를 확인해 주세요.');const reason=text(input.reason,60);data.children[c].stars+=input.amount;event(c,'⭐',reason,'+'+input.amount+' 별');break}
 case 'transfer':{owner(actor,c);check(actor.role==='child','아이 페이지에서 보내 주세요.');check(integer(input.amount,1,3),'별은 1~3개만 보낼 수 있어요.');check(data.children[c].stars>=input.amount,'보낼 별이 부족해요.');data.children[c].stars-=input.amount;data.children[1-c].stars+=input.amount;event(c,'💝',data.children[1-c].name+'에게 별을 보냈어요','−'+input.amount+' 별');event(1-c,'💌',data.children[c].name+'에게 별을 받았어요','+'+input.amount+' 별');break}
 case 'convert':{owner(actor,c);check(data.children[c].stars>=data.threshold,'별이 부족해요.');data.children[c].stars-=data.threshold;data.children[c].tickets++;event(c,'🎟️','골든티켓을 만들었어요','+1 티켓');break}
 case 'redeem':{owner(actor,c);const r=rewards.find(x=>x.image===input.image);check(r&&r.name===input.name&&r.cost===input.cost,'상품이 바뀌었어요. 새 목록에서 다시 골라 주세요.');check(data.children[c].tickets>=r.cost,'골든티켓이 부족해요.');data.children[c].tickets-=r.cost;event(c,'🎁',r.name+' 교환','−'+r.cost+' 티켓');break}
 case 'roulette':{owner(actor,c);check(actor.role==='child','아이 페이지에서 참여해 주세요.');check(data.children[c].tickets>=5,'골든티켓 5장이 필요해요.');const p=pickPrize(draw);data.children[c].tickets-=p.rank===5?2:5;const card={id,child:c,rank:p.rank,date,wish:''};data.wishCards.unshift(card);event(c,'🎟️','룰렛 '+p.rank+'등 · '+p.name+(p.rank===5?' (5장 사용 · 3장 반환)':''),p.rank===5?'−2 티켓':'−5 티켓');result={card};break}
 case 'wish':{const card=data.wishCards.find(x=>x.id===input.cardId&&x.rank===1);check(card,'소원카드를 찾을 수 없어요.');owner(actor,card.child);card.wish=text(input.wish,500);event(card.child,'💌','1등 소원을 저장했어요','');break}
 case 'threshold':{admin(actor);check(integer(input.value,1,100),'별 개수를 확인해 주세요.');data.threshold=input.value;event(-1,'⚙','교환 기준을 별 '+input.value+'개로 변경','');break}
 case 'rewards':{admin(actor);check(Array.isArray(input.items)&&input.items.length===5,'선물 5개를 입력해 주세요.');data.rewardOverrides={slot:input.slot,items:input.items.map(x=>({name:text(x.name,50),cost:integer(x.cost,1,5)?x.cost:(()=>{throw Error('티켓 수를 확인해 주세요.')})()}))};event(-1,'⚙','이번 주 보상 메뉴 변경','');break}
 case 'import':{admin(actor);check(!data.imported&&data.children.every(x=>x.stars===0&&x.tickets===0)&&data.wishCards.length===0,'처음 비어 있는 계정에만 기록을 가져올 수 있어요.');const old=input.snapshot;check(old&&Array.isArray(old.children)&&old.children.length===2,'기록 파일을 확인해 주세요.');for(let i=0;i<2;i++){check(integer(old.children[i].stars,0,100000)&&integer(old.children[i].tickets,0,100000),'잔액을 확인해 주세요.');data.children[i].stars=old.children[i].stars;data.children[i].tickets=old.children[i].tickets;}if(integer(old.threshold,1,100))data.threshold=old.threshold;
 for(const h of (old.history||[]).slice(0,2000)){if(integer(h.child,0,1)&&typeof h.text==='string'&&typeof h.amount==='string'&&Number.isFinite(h.date))events.push({child:h.child,icon:typeof h.icon==='string'?h.icon.slice(0,10):'♡',text:h.text.slice(0,300),amount:h.amount.slice(0,50),date:h.date});}
 data.wishCards=(old.wishCards||[]).slice(0,1000).filter(x=>integer(x.child,0,1)&&integer(x.rank,1,5)).map((x,i)=>({id:id+'-'+i,child:x.child,rank:x.rank,date:Number.isFinite(x.date)?x.date:date,wish:typeof x.wish==='string'?x.wish.slice(0,500):''}));data.imported=true;event(-1,'📦','기존 브라우저 기록 가져오기','');break}
 default:throw Error('지원하지 않는 작업이에요.');
 }
 return {data,events,result};
}
