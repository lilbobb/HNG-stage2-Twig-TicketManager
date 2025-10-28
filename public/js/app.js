function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  
  const icons = {
    success: '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    error: '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
  };
  
  toastMessage.textContent = message;
  toastIcon.innerHTML = icons[type];
  toast.classList.remove('hidden');
  
  setTimeout(() => hideToast(), 4000);
}

function hideToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('hidden');
}

function checkAuth() {
  const session = localStorage.getItem('ticketapp_session');
  return session ? JSON.parse(session) : null;
}

function requireAuth() {
  const user = checkAuth();
  if (!user) {
    window.location.href = '?route=login';
  }
  return user;
}