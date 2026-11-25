const WISH_PRIZES = [
 {rank:1,name:'무조건소원카드',chance:3,weight:30,icon:'👑',text:'직접 소원 내용을 입력할 수 있어요. 아빠는 소원을 거부할 수 없어요! 단, 자기 자신을 위해서만 사용할 수 있어요.'},
 {rank:2,name:'최강소원카드',chance:10,weight:100,icon:'💎',text:'10만원까지 무엇이든 살 수 있어요. 여러 개를 사도 돼요! 총금액은 10만원까지예요.'},
 {rank:3,name:'금색소원카드',chance:20,weight:200,icon:'🌟',text:'다이소에서 1만원 이하의 갖고 싶은 물건을 딱 한 개 고를 수 있어요.'},
 {rank:4,name:'그냥그저그런소원카드',chance:33.5,weight:335,icon:'🍕',text:'아빠가 배달음식을 시켜줘요!'},
 {rank:5,name:'앗!망했다카드',chance:33.5,weight:335,icon:'🙈',text:'꽝이에요. 그래도 골든티켓 3장을 돌려드려요! (5장 사용 후 3장 반환)'}
];
function wishPrizeFor(draw){
 if(!Number.isInteger(draw)||draw<0||draw>=1000)throw Error('Invalid draw');
 let limit=0;return WISH_PRIZES.find(p=>{limit+=p.weight;return draw<limit});
}
function drawWishNumber(){const a=new Uint32Array(1);do{crypto.getRandomValues(a)}while(a[0]>=4294967000);return a[0]%1000}
function applyWishDraw(data,owner,draw,id,date){
 if(![0,1].includes(owner)||data.children[owner].tickets<5)throw Error('골든티켓 5장이 필요해요.');
 if((data.wishCards||[]).some(c=>c.id===id))throw Error('이미 완료된 룰렛이에요.');
 const prize=wishPrizeFor(draw),refund=prize.rank===5?3:0;
 data.children[owner].tickets-=5;data.children[owner].tickets+=refund;
 const card={id,child:owner,rank:prize.rank,date,wish:''};
 data.wishCards=[card,...(data.wishCards||[])];
 data.history.unshift({child:owner,icon:'🎟️',text:'룰렛 '+prize.rank+'등 · '+prize.name+(refund?' (5장 사용 · 3장 반환)':''),amount:refund?'−2 티켓':'−5 티켓',date});
 data.history=data.history.slice(0,200);return card;
}
