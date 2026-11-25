const SHOP_INTERVAL = 7 * 24 * 60 * 60 * 1000;
// Monday midnight in Korea (1970-01-05 KST).
const SHOP_WEEK_ANCHOR = Date.UTC(1970,0,4,15);
const EXTRA_REWARDS = [
 {image:'assets/milk-chocolate.png',name:'밀크 초콜릿',note:'부드럽고 달콤한 한 조각',emoji:'🍫',cost:1,category:'초콜릿'},
 {image:'assets/tuna-rice.png',name:'참치마요 삼각김밥',note:'고소한 참치마요 한입',emoji:'🍙',cost:1,category:'삼각김밥'},
 {image:'assets/fruit-jelly.png',name:'과일 젤리',note:'쫀득쫀득 알록달록',emoji:'🍬',cost:1,category:'젤리'},
 {image:'assets/banana-milk.png',name:'바나나 우유',note:'달콤한 바나나 맛 한 모금',emoji:'🥛',cost:1,category:'음료'},
 {image:'assets/potato-chips.png',name:'감자칩',note:'바삭바삭 고소한 간식',emoji:'🥔',cost:1,category:'과자'},
 {image:'assets/choco-icecream.png',name:'초콜릿 아이스크림',note:'시원하고 달콤한 즐거움',emoji:'🍦',cost:2,category:'아이스크림'},
 {image:'assets/strawberry-milk.png',name:'딸기 우유',note:'딸기 향이 가득한 우유',emoji:'🥛',cost:1,category:'음료'},
 {image:'assets/choco-cookie.png',name:'초코 쿠키',note:'바삭한 쿠키 속 초코칩',emoji:'🍪',cost:1,category:'과자'},
 {image:'assets/beef-rice.png',name:'소고기 삼각김밥',note:'달콤짭짤한 소고기가 쏙',emoji:'🍙',cost:1,category:'삼각김밥'},
 {image:'assets/mini-pudding.png',name:'미니 푸딩',note:'탱글탱글 부드러운 한 컵',emoji:'🍮',cost:2,category:'디저트'}
];
function shopSlot(now=Date.now()){return Math.floor((now-SHOP_WEEK_ANCHOR)/SHOP_INTERVAL)}
function catalogForSlot(slot,desserts){
 // Interleave the existing desserts and other treats so every selection is mixed.
 const pool=[];
 for(let i=0;i<5;i++){
  pool.push({...desserts[i],category:'디저트'},EXTRA_REWARDS[i],EXTRA_REWARDS[i+5]);
 }
 const start=((slot*5)%pool.length+pool.length)%pool.length;
 return Array.from({length:5},(_,i)=>({...pool[(start+i)%pool.length],bg:'#fff'}));
}
