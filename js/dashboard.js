import { $, addDays, db, escapeHtml, status, today } from './data.js';

function monthlyRevenue() {
  const revenue = {};
  db.payments.filter(payment => payment.status === 'Paid').forEach(payment => {
    const month = payment.date.slice(0, 7);
    revenue[month] = (revenue[month] || 0) + payment.amount;
  });
  return revenue;
}

export function renderDashboard(openForm) {
  const currentMonth = today.slice(0, 7);
  const expiringSoon = db.members.filter(member => member.expiry >= today && member.expiry <= addDays(7));
  const revenueByMonth = monthlyRevenue();
  const stats = [
    ['Total members', db.members.length],
    ['Active memberships', db.members.filter(member => status(member) === 'Active').length],
    ["Today's attendance", db.attendance.filter(record => record.date === today).length],
    ['Trainers', db.trainers.length],
    ['Revenue this month', '$' + (revenueByMonth[currentMonth] || 0)]
  ];

  $('#view').innerHTML = `<div class="grid">${stats.map(([label, value]) => `<div class="card stat"><span class="muted">${label}</span><b>${value}</b></div>`).join('')}</div>
    <div class="tools"><button class="btn" id="qa">Add member</button><button class="btn" id="qb">Mark attendance</button></div>
    <div class="two"><div class="card"><h3>Attendance, last 7 days</h3><canvas id="c1"></canvas></div><div class="card"><h3>Monthly revenue</h3><canvas id="c2"></canvas></div></div>
    <div class="two"><div class="card"><h3>Expiring within 7 days</h3>${expiringSoon.length ? expiringSoon.map(member => `<p>${escapeHtml(member.name)} – ${member.expiry}</p>`).join('') : '<p class="muted">No memberships expiring soon.</p>'}</div>
    <div class="card"><h3>Recent registrations</h3>${[...db.members].sort((a, b) => b.joined.localeCompare(a.joined)).slice(0, 4).map(member => `<p>${escapeHtml(member.name)} – ${member.joined}</p>`).join('')}</div></div>`;
  $('#qa').onclick = () => openForm('Members');
  $('#qb').onclick = () => openForm('Attendance');

  const days = [...Array(7)].map((_, index) => addDays(index - 6));
  const months = Object.keys(revenueByMonth).sort();
  const theme = getComputedStyle(document.documentElement);
  const chartText = theme.getPropertyValue('--color-muted').trim();
  const chartGrid = theme.getPropertyValue('--color-border-subtle').trim();
  const chartBrand = theme.getPropertyValue('--color-brand').trim();
  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: chartText }, grid: { color: chartGrid } },
      y: { ticks: { color: chartText }, grid: { color: chartGrid }, beginAtZero: true }
    }
  };
  return [
    new window.Chart($('#c1'), {
      type: 'bar',
      data: { labels: days, datasets: [{ data: days.map(day => db.attendance.filter(record => record.date === day).length), backgroundColor: chartBrand, borderRadius: 6 }] },
      options
    }),
    new window.Chart($('#c2'), {
      type: 'line',
      data: { labels: months, datasets: [{ data: months.map(month => revenueByMonth[month]), borderColor: chartBrand, backgroundColor: 'rgb(255 56 92 / 10%)', fill: true, tension: 0.3 }] },
      options
    })
  ];
}
