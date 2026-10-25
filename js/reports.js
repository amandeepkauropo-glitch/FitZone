import { $, db, memberName, status, today } from './data.js';

export function renderReports() {
  const activeMembers = db.members.filter(member => status(member) === 'Active').length;
  const paidRevenue = db.payments.filter(payment => payment.status === 'Paid').reduce((total, payment) => total + payment.amount, 0);
  $('#view').innerHTML = `<div class="card"><h3>Summary (${today})</h3><p>Registered members: <b>${db.members.length}</b></p>
    <p>Active: <b>${activeMembers}</b> | Expired: <b>${db.members.filter(member => status(member) === 'Expired').length}</b></p>
    <p>Attendance records: <b>${db.attendance.length}</b> (today: ${db.attendance.filter(record => record.date === today).length})</p>
    <p>Total simulated revenue: <b>$${paidRevenue}</b></p><p>Pending payments: <b>${db.payments.filter(payment => payment.status === 'Pending').length}</b></p>
    <div class="tools noprint"><button class="btn" id="csv">Download members CSV</button><button class="btn" id="csv2">Download payments CSV</button><button class="btn" id="pr">Print report</button></div></div>`;
  const downloadCsv = (name, rows) => {
    const blob = new Blob([rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = name;
    anchor.click();
  };
  $('#csv').onclick = () => downloadCsv('members.csv', [
    ['ID', 'Name', 'Email', 'Plan', 'Expiry', 'Status'],
    ...db.members.map(member => [member.id, member.name, member.email, member.plan, member.expiry, status(member)])
  ]);
  $('#csv2').onclick = () => downloadCsv('payments.csv', [
    ['Date', 'Member', 'Amount', 'Method', 'Status'],
    ...db.payments.map(payment => [payment.date, memberName(payment.memberId), payment.amount, payment.method, payment.status])
  ]);
  $('#pr').onclick = () => window.print();
}
