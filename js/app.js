import { $ } from './data.js';
import { initializeLogin } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderRecords, resetRecordFilters } from './records.js';
import { renderReports } from './reports.js';
import { mountLayout } from './layout.js';

const navigation = ['Dashboard', 'Members', 'Attendance', 'Trainers', 'Payments', 'Reports', 'Logout'];
let charts = [];
let toastTimer;

await mountLayout();

$('#nav').innerHTML = navigation.map(page => `<button data-p="${page}">${page}</button>`).join('');
$('#nav').onclick = event => {
  const page = event.target.dataset.p;
  if (!page) return;
  if (page === 'Logout') {
    logout();
    return;
  }
  resetRecordFilters();
  navigate(page);
};

function navigate(page) {
  $('#title').textContent = page;
  document.querySelectorAll('nav button').forEach(button => button.classList.toggle('on', button.dataset.p === page));
  charts.forEach(chart => chart.destroy());
  charts = [];
  if (page === 'Dashboard') charts = renderDashboard(openRecordForm);
  else if (page === 'Reports') renderReports();
  else renderRecords(page, handleRecordChange);
}

function openRecordForm(page) {
  renderRecords(page, handleRecordChange);
  $('#add').click();
}

function handleRecordChange(page, message) {
  if (message) showToast(message);
  navigate(page);
}

function showToast(message, duration = 2200, variant = '') {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `show ${variant}`.trim();
  toastTimer = setTimeout(() => { toast.className = ''; }, duration);
}

function start(email) {
  $('#login').hidden = true;
  $('#app').hidden = false;
  navigate('Dashboard');
  if (email) {
    const username = email.split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());
    showToast(`Welcome, ${username}! Ready to make today count?`, 60000, 'welcome');
  }
}

function logout() {
  sessionStorage.removeItem('fz_in');
  clearTimeout(toastTimer);
  $('#toast').className = '';
  $('#app').hidden = true;
  $('#login').hidden = false;
}

initializeLogin(start);
if (sessionStorage.getItem('fz_in')) start();
