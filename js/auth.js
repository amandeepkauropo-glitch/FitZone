import { $ } from './data.js';

const THEME_KEY = 'fitzone_theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const isDark = theme === 'dark';
  $('#themeToggle').setAttribute('aria-pressed', String(isDark));
  $('#themeLabel').textContent = isDark ? 'Light mode' : 'Dark mode';
  $('#themeIcon').textContent = isDark ? '☀' : '☾';
}

export function initializeLogin(onLogin) {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  $('#themeToggle').onclick = () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  };

  $('#togglePw').onclick = event => {
    const password = $('#pw');
    password.type = password.type === 'password' ? 'text' : 'password';
    event.target.textContent = password.type === 'password' ? 'Show' : 'Hide';
  };

  $('#loginForm').onsubmit = event => {
    event.preventDefault();
    const email = $('#email').value.trim();
    const password = $('#pw').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      $('#loginMsg').textContent = 'Enter a valid email address.';
      return;
    }
    if (email !== 'admin@fitzone.demo' || password !== 'Admin123') {
      $('#loginMsg').textContent = 'Wrong email or password. Use the demo credentials below.';
      return;
    }
    sessionStorage.setItem('fz_in', '1');
    onLogin(email);
  };
}
