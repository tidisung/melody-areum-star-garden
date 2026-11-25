(() => {
 const isAdminPage = new URLSearchParams(location.search).get('page') === 'admin';
 const form = document.getElementById('adminLoginForm');
 const input = document.getElementById('adminPassword');
 let loading = false;
 function startApp() {
  const script = document.createElement('script');
  script.src = 'app.js?v=wish-carousel-1';
  script.onload = () => {
   document.documentElement.classList.remove('admin-locked');
   document.getElementById('adminLogout').onclick = () => location.reload();
   if (isAdminPage) document.getElementById('adminLogout').focus();
  };
  script.onerror = () => {
   loading = false;
   form.querySelector('button').disabled = false;
   document.getElementById('loginError').textContent = '화면을 불러오지 못했어요. 다시 시도해 주세요.';
   script.remove();
  };
  document.body.append(script);
 }
 if (!isAdminPage) { startApp(); return; }
 input.focus();
 form.onsubmit = event => {
  event.preventDefault();
  if (loading) return;
  if (input.value !== '1986') {
   document.getElementById('loginError').textContent = '비밀번호가 맞지 않아요. 다시 입력해 주세요.';
   input.value = '';
   input.focus();
   return;
  }
  loading = true;
  input.value = '';
  document.getElementById('loginError').textContent = '';
  form.querySelector('button').disabled = true;
  startApp();
 };
})();
