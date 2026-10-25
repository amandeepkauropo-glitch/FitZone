import { $, addDays, db, escapeHtml, memberName, PLANS, recordConfig, save, status, today, uid } from './data.js';

let filters = { q: '', s: '' };

export function resetRecordFilters() {
  filters = { q: '', s: '' };
}

function showForm(page, id, onSaved) {
  const config = recordConfig[page];
  const record = id
    ? db[config.key].find(item => item.id === id)
    : { date: today, joined: today, expiry: addDays(30), amount: PLANS.Basic, plan: 'Basic', method: 'Card', status: 'Paid' };
  const form = $('#modalForm');
  form.innerHTML = `<h2>${id ? 'Edit' : 'Add'} ${page.slice(0, -1)}</h2>` + config.fields.map(([key, label, type, options]) =>
    `<label for="f_${key}">${label}</label>` + (type === 'select'
      ? `<select id="f_${key}">${options().map(option => {
        const [value, name] = Array.isArray(option) ? option : [option, option];
        return `<option value="${escapeHtml(value)}" ${record[key] === value ? 'selected' : ''}>${escapeHtml(name)}</option>`;
      }).join('')}</select>`
      : `<input id="f_${key}" type="${type}" value="${escapeHtml(record[key] || '')}">`)
  ).join('') + '<p class="err" id="fe" role="alert"></p><div class="row"><button class="btn">Save</button><button type="button" class="ghost" id="cancel">Cancel</button></div>';

  $('#modal').hidden = false;
  form.querySelector('input,select').focus();
  $('#cancel').onclick = () => { $('#modal').hidden = true; };
  form.onsubmit = event => {
    event.preventDefault();
    const values = {};
    config.fields.forEach(([key, , type]) => {
      const value = $('#f_' + key).value;
      values[key] = type === 'number' ? +value : value.trim();
    });
    const missing = config.fields.find(([key]) => values[key] === '' || Number.isNaN(values[key]));
    if (missing) {
      $('#fe').textContent = missing[1] + ' is required.';
      return;
    }
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
      $('#fe').textContent = 'Enter a valid email.';
      return;
    }
    if (values.expiry && values.expiry < values.joined) {
      $('#fe').textContent = 'Expiry must be after the joining date.';
      return;
    }
    if (values.amount !== undefined && values.amount <= 0) {
      $('#fe').textContent = 'Amount must be above 0.';
      return;
    }

    const others = db[config.key].filter(item => item.id !== id);
    if (config.unique && others.some(item => item[config.unique].toLowerCase() === values[config.unique].toLowerCase())) {
      $('#fe').textContent = 'That ' + config.unique + ' already exists.';
      return;
    }
    if (config.dup && others.some(item => config.dup.every(key => item[key] === values[key]))) {
      $('#fe').textContent = 'Already marked present for that date.';
      return;
    }
    if (id) Object.assign(record, values);
    else db[config.key].push({
      id: page === 'Members'
        ? 'M' + (101 + db.members.length + Math.floor(Math.random() * 900))
        : uid(config.prefix),
      ...values
    });
    save();
    $('#modal').hidden = true;
    onSaved(page);
  };
}

function deleteRecord(page, id, onChanged) {
  if (!confirm('Delete this record? This cannot be undone.')) return;
  const key = recordConfig[page].key;
  db[key] = db[key].filter(record => record.id !== id);
  save();
  onChanged(page, 'Deleted');
}

function cell(record, key) {
  if (key === '_s') {
    const memberStatus = status(record);
    return `<span class="tag ${memberStatus.toLowerCase()}">${memberStatus}</span>`;
  }
  if (key === '_m') return escapeHtml(memberName(record.memberId));
  if (key === 'status') return `<span class="tag ${record.status.toLowerCase()}">${record.status}</span>`;
  return escapeHtml(key === 'amount' ? '$' + record[key] : record[key]);
}

function rowText(config, record) {
  return config.cols.map(([key]) => key === '_m' ? memberName(record.memberId) : record[key] || '').join(' ').toLowerCase();
}

export function renderRecords(page, onChanged) {
  const config = recordConfig[page];
  let rows = db[config.key].filter(record => rowText(config, record).includes(filters.q.toLowerCase()));
  if (filters.s && page === 'Members') rows = rows.filter(record => status(record) === filters.s);
  if (filters.s && page === 'Payments') rows = rows.filter(record => record.status === filters.s);

  $('#view').innerHTML = `<div class="card"><div class="tools"><input id="q" aria-label="Search" placeholder="Search…" value="${escapeHtml(filters.q)}">
    ${page === 'Members' ? `<select id="s" aria-label="Filter status"><option value="">All statuses</option>${['Active', 'Expired', 'Pending'].map(value => `<option ${filters.s === value ? 'selected' : ''}>${value}</option>`).join('')}</select>` : ''}
    ${page === 'Payments' ? `<select id="s" aria-label="Filter status"><option value="">All</option>${['Paid', 'Pending'].map(value => `<option ${filters.s === value ? 'selected' : ''}>${value}</option>`).join('')}</select>` : ''}
    <button class="btn" id="add">${page === 'Attendance' ? 'Mark attendance' : 'Add ' + page.slice(0, -1).toLowerCase()}</button></div>
    <div class="wrap"><table><thead><tr>${config.cols.map(column => `<th>${column[1]}</th>`).join('')}<th></th></tr></thead><tbody>
    ${rows.length ? rows.map(record => `<tr>${config.cols.map(column => `<td>${cell(record, column[0])}</td>`).join('')}<td>${page === 'Attendance' ? '' : `<button class="ghost" data-e="${record.id}">Edit</button> `}<button class="ghost danger" data-d="${record.id}">Delete</button></td></tr>`).join('') : '<tr><td class="empty" colspan="9">No records yet. Use the button above to add one.</td></tr>'}
    </tbody></table></div></div>`;

  $('#q').oninput = event => {
    filters.q = event.target.value;
    renderRecords(page, onChanged);
    $('#q').focus();
    $('#q').setSelectionRange(99, 99);
  };
  if ($('#s')) $('#s').onchange = event => {
    filters.s = event.target.value;
    renderRecords(page, onChanged);
  };
  $('#add').onclick = () => showForm(page, null, onChanged);
  $('#view').onclick = event => {
    if (event.target.dataset.e) showForm(page, event.target.dataset.e, onChanged);
    if (event.target.dataset.d) deleteRecord(page, event.target.dataset.d, onChanged);
  };
}
