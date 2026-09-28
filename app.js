'use strict';
const KEY = 'phr:v1';
const $ = id => document.getElementById(id);
const DEFAULTS = { name: '', goal: 2000, interval: 60, start: '08:00', end: '21:00' };

let state = load();
let lastNotified = 0;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.profile) return s;
  } catch (e) { /* first run or corrupt data */ }
  return { profile: { ...DEFAULTS }, days: {} };
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA');
const todayLog = () => (state.days[dayKey()] ||= []);
const total = () => todayLog().reduce((s, e) => s + e.ml, 0);
const fmtTime = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function atTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime();
}

function addDrink(ml) {
  ml = Math.round(Number(ml));
  if (!ml || ml < 10 || ml > 1500) return;
  todayLog().push({ t: Date.now(), ml });
  hideBanner(); save(); render();
}

function nextDue() {
  const { start, interval } = state.profile;
  const log = todayLog();
  const anchor = log.length ? log[log.length - 1].t : atTime(start);
  return Math.max(anchor, lastNotified) + interval * 60000;
}

function status() {
  const { goal, start, end } = state.profile;
  const now = Date.now(), drank = total();
  if (drank >= goal) return { text: 'Goal reached. Well done.', next: '' };
  if (now < atTime(start)) return { text: 'Reminders begin at ' + start + '.', next: '' };
  if (now > atTime(end)) return { text: goal - drank + ' ml short of today\'s goal.', next: 'Reminders resume at ' + start + '.' };
  const mins = Math.ceil((nextDue() - now) / 60000);
  return {
    text: goal - drank + ' ml to go.',
    next: mins > 0 ? 'Next reminder in ' + mins + ' min' : 'Drink some water now'
  };
}

function render() {
  const { goal, name } = state.profile;
  const drank = total();
  $('drank').textContent = drank;
  $('goal').textContent = goal;
  const pct = Math.min(drank / goal, 1), H = 190;
  $('water').setAttribute('height', pct * H);
  $('water').setAttribute('y', 230 - pct * H);
  $('bottle').setAttribute('aria-label', 'Bottle is ' + Math.round(pct * 100) + ' percent full');
  const st = status();
  $('status').textContent = (name ? name + ': ' : '') + st.text;
  $('next').textContent = st.next;

  const ul = $('log'); ul.innerHTML = '';
  const log = todayLog();
  if (!log.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No drinks logged yet. Tap an amount above.'; ul.appendChild(li); }
  [...log].reverse().forEach(e => {
    const li = document.createElement('li');
    li.innerHTML = '<span></span><strong></strong>';
    li.firstChild.textContent = fmtTime(e.t);
    li.lastChild.textContent = e.ml + ' ml';
    ul.appendChild(li);
  });
}

function remind() {
  const { start, end, goal } = state.profile;
  const now = Date.now();
  if (total() >= goal || now < atTime(start) || now > atTime(end)) return;
  if (now < nextDue()) return;
  lastNotified = now;
  const msg = 'Time to drink some water. ' + (goal - total()) + ' ml to go.';
  $('bannerText').textContent = msg; $('banner').hidden = false;
  if ('Notification' in window && Notification.permission === 'granted') new Notification('Hydration reminder', { body: msg });
}
const hideBanner = () => { $('banner').hidden = true; };

function fillSettings() {
  const p = state.profile;
  $('sName').value = p.name; $('sGoal').value = p.goal; $('sInterval').value = p.interval;
  $('sStart').value = p.start; $('sEnd').value = p.end;
}

document.querySelectorAll('.quick button').forEach(b => b.addEventListener('click', () => addDrink(b.dataset.ml)));
$('addCustom').addEventListener('click', () => { addDrink($('customMl').value); $('customMl').value = ''; });
$('undo').addEventListener('click', () => { todayLog().pop(); save(); render(); });
$('bannerClose').addEventListener('click', hideBanner);
$('settingsBtn').addEventListener('click', () => {
  const p = $('settings'); p.hidden = !p.hidden;
  $('settingsBtn').setAttribute('aria-expanded', String(!p.hidden));
});
$('save').addEventListener('click', () => {
  const goal = Math.min(5000, Math.max(500, Number($('sGoal').value) || DEFAULTS.goal));
  const interval = Math.min(240, Math.max(15, Number($('sInterval').value) || DEFAULTS.interval));
  state.profile = {
    name: $('sName').value.trim(), goal, interval,
    start: $('sStart').value || DEFAULTS.start, end: $('sEnd').value || DEFAULTS.end
  };
  save(); fillSettings(); render();
});
$('enableNotif').addEventListener('click', () => {
  if ('Notification' in window) Notification.requestPermission();
  else alert('This browser does not support notifications. In-page reminders will still work.');
});
$('reset').addEventListener('click', () => {
  if (confirm('Delete all saved data on this device?')) { state = { profile: { ...DEFAULTS }, days: {} }; save(); fillSettings(); render(); }
});

fillSettings(); render();
setInterval(() => { remind(); render(); }, 30000);
