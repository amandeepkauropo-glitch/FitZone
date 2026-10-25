export const $ = selector => document.querySelector(selector);
export const today = new Date().toISOString().slice(0, 10);
export const addDays = amount => {
  const date = new Date();
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
};
export const uid = prefix => prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
export const PLANS = { Basic: 29, Standard: 49, Premium: 79 };

function seed() {
  const trainers = ['Aman Singh', 'Priya Kaur', 'Rohan Verma'].map((name, index) => ({
    id: 'T' + (index + 1),
    name,
    spec: ['Strength', 'Yoga', 'Cardio'][index],
    contact: '9876500' + index + '00'
  }));
  const names = ['Harpreet Gill', 'Simran Kaur', 'Karan Mehta', 'Neha Sharma', 'Jasleen Bedi', 'Vikram Rana'];
  const members = names.map((name, index) => ({
    id: 'M' + (101 + index),
    name,
    email: name.split(' ')[0].toLowerCase() + '@mail.demo',
    phone: '98' + (76543210 - index * 111),
    plan: Object.keys(PLANS)[index % 3],
    joined: addDays(-60 + index * 8),
    expiry: addDays([-5, 20, 45, 3, 60, -20][index]),
    trainer: trainers[index % 3].name
  }));
  const attendance = [];
  members.forEach((member, index) => [0, 1, 2, 3, 4, 5, 6].forEach(day => {
    if ((index + day) % 3) attendance.push({ id: uid('A'), memberId: member.id, date: addDays(-day) });
  }));
  const payments = members.map((member, index) => ({
    id: uid('P'),
    memberId: member.id,
    amount: PLANS[member.plan],
    date: addDays(-index * 20),
    method: ['Card', 'Cash', 'UPI'][index % 3],
    status: index === 3 ? 'Pending' : 'Paid'
  }));
  return { members, trainers, attendance, payments, user: null };
}

const STORAGE_KEY = 'fitzone_v1';
export const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || seed();
export const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
export const status = member => member.expiry < today ? 'Expired' : member.joined > today ? 'Pending' : 'Active';
export const memberName = id => (db.members.find(member => member.id === id) || { name: '(deleted)' }).name;
export const escapeHtml = value => String(value).replace(/[&<>"]/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
}[character]));

export const recordConfig = {
  Members: {
    key: 'members',
    prefix: 'M',
    fields: [
      ['name', 'Name', 'text'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'tel'],
      ['plan', 'Plan', 'select', () => Object.keys(PLANS)],
      ['joined', 'Joining date', 'date'],
      ['expiry', 'Expiry date', 'date'],
      ['trainer', 'Trainer', 'select', () => db.trainers.map(trainer => trainer.name)]
    ],
    cols: [['id', 'ID'], ['name', 'Name'], ['email', 'Email'], ['plan', 'Plan'], ['expiry', 'Expiry'], ['trainer', 'Trainer'], ['_s', 'Status']],
    unique: 'email'
  },
  Trainers: {
    key: 'trainers',
    prefix: 'T',
    fields: [['name', 'Name', 'text'], ['spec', 'Specialization', 'text'], ['contact', 'Contact', 'tel']],
    cols: [['id', 'ID'], ['name', 'Name'], ['spec', 'Specialization'], ['contact', 'Contact']]
  },
  Attendance: {
    key: 'attendance',
    prefix: 'A',
    fields: [
      ['memberId', 'Member', 'select', () => db.members.map(member => [member.id, member.name])],
      ['date', 'Date', 'date']
    ],
    cols: [['date', 'Date'], ['_m', 'Member']],
    dup: ['memberId', 'date']
  },
  Payments: {
    key: 'payments',
    prefix: 'P',
    fields: [
      ['memberId', 'Member', 'select', () => db.members.map(member => [member.id, member.name])],
      ['amount', 'Amount (USD, simulated)', 'number'],
      ['date', 'Date', 'date'],
      ['method', 'Method', 'select', () => ['Card', 'Cash', 'UPI']],
      ['status', 'Status', 'select', () => ['Paid', 'Pending']]
    ],
    cols: [['date', 'Date'], ['_m', 'Member'], ['amount', 'Amount'], ['method', 'Method'], ['status', 'Status']]
  }
};
