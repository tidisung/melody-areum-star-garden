(async () => {
 const isAdmin=Cloud.page==='admin',params=new URLSearchParams(location.hash.slice(1));
 let adminKey=params.get('adminKey')||localStorage.getItem('star-garden-admin-key')||'';
 const pair=params.get('pair');
 if(params.has('adminKey'))localStorage.setItem('star-garden-admin-key',adminKey);
 if(location.hash)history.replaceState(null,'',location.pathname+location.search);
 const form=document.getElementById('adminLoginForm'),input=document.getElementById('adminPassword'),error=document.getElementById('loginError');
 document.getElementById('loginTitle').textContent=isAdmin?'아빠의 반짝정원':'아이패드 연결하기';
 document.getElementById('loginDescription').textContent=isAdmin?'아빠 전용 링크에서 비밀번호를 입력해 주세요.':'아빠가 보내준 연결 링크를 이 아이패드에서 열어 주세요.';
 form.querySelector('label').hidden=!isAdmin;input.hidden=!isAdmin;input.required=isAdmin;form.querySelector('button').hidden=!isAdmin;
 document.getElementById('localBackup').hidden=!localStorage.getItem('star-garden-v1');
 document.getElementById('localBackup').onclick=()=>{const raw=localStorage.getItem('star-garden-v1');if(!raw)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.download='기존-반짝정원-기록.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 let started=false;
 async function start(){
  await Cloud.recover();
  const initial=await Cloud.request('/state');
  if(!isAdmin&&initial.role==='child'&&initial.accountChild!==(Cloud.page==='areum'?1:0))throw Error('이 아이패드에 맞는 아이의 연결 링크로 열어 주세요.');
  if(isAdmin&&initial.role!=='admin')throw Error('관리자 계정으로 연결해 주세요.');
  window.cloudInitialState=initial;if(started)return;started=true;
  const script=document.createElement('script');script.src='app.js?v=gift-1';script.onload=()=>{document.documentElement.classList.remove('admin-locked');document.getElementById('adminLogout').onclick=()=>Cloud.logout()};script.onerror=()=>{started=false;error.textContent='화면을 불러오지 못했어요. 새로고침해 주세요.'};document.body.append(script);
 }
 form.onsubmit=async e=>{e.preventDefault();if(!isAdmin)return;const b=form.querySelector('button');b.disabled=true;error.textContent='연결 중…';try{const result=await Cloud.request('/login',{key:adminKey,pin:input.value});Cloud.setToken(result.token);input.value='';await start()}catch(e){error.textContent=e.message}finally{b.disabled=false}};
 try{if(pair){error.textContent='아이패드를 연결하고 있어요…';const r=await Cloud.request('/pair',{code:pair});if((r.child===1?'areum':'melody')!==Cloud.page){localStorage.setItem('star-garden-session-'+(r.child===1?'areum':'melody'),r.token);location.replace('?page='+(r.child===1?'areum':'melody'));return}Cloud.setToken(r.token)}if(Cloud.connected)await start();else if(isAdmin)input.focus()}catch(e){error.textContent=e.message}
})();
