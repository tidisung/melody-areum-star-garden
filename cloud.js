(() => {
 const API='https://melody-areum-star-garden.awakesalamander8.chatgpt.site/api';
 const page=new URLSearchParams(location.search).get('page')||'melody';
 const key='star-garden-session-'+page;
 let session=localStorage.getItem(key)||'';
 async function request(path,data,attempt=0){
  if(!navigator.onLine)throw Error('인터넷에 연결한 뒤 다시 시도해 주세요.');
  const headers={'Content-Type':'application/json'};if(session)headers.Authorization='Bearer '+session;
  let response;
  try{response=await fetch(API+path,{method:data===undefined?'GET':'POST',headers,body:data===undefined?undefined:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(20000)})}
  catch(e){if(data?.requestId&&attempt===0)return request(path,data,1);throw Error('서버 응답을 확인하지 못했어요. 기록을 새로 확인해 주세요.');}
  const result=await response.json();
  if(!response.ok){if(response.status===401&&path!=='/login'&&path!=='/pair'){localStorage.removeItem(key);session='';document.documentElement.classList.add('admin-locked');document.getElementById('loginError').textContent='연결이 만료됐어요. 다시 연결해 주세요.';}throw Object.assign(Error(result.error||'저장하지 못했어요.'),{status:response.status});}
  return result;
 }
 const pendingKey='star-garden-pending-'+page;
 async function recover(){const raw=localStorage.getItem(pendingKey);if(!raw)return null;const pending=JSON.parse(raw);try{const result=await request('/action',pending);localStorage.removeItem(pendingKey);window.acceptCloudState?.(result.state);return result}catch(e){if(e.status&&e.status>=400&&e.status<500&&e.status!==401)localStorage.removeItem(pendingKey);throw e}}
 window.Cloud={request,page,recover,get connected(){return !!session},setToken(token){session=token;localStorage.setItem(key,token)},async action(input){
  const raw=localStorage.getItem(pendingKey);
  if(raw){const pending=JSON.parse(raw),old={...pending};delete old.requestId;const recovered=await recover();if(JSON.stringify(old)===JSON.stringify(input))return recovered;}
  localStorage.setItem(pendingKey,JSON.stringify({...input,requestId:crypto.randomUUID()}));return recover();
 },async logout(){try{await request('/logout',{})}catch{}localStorage.removeItem(key);location.reload()}};
})();
