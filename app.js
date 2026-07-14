const app = document.getElementById('app');
const STORAGE_KEY = 'lamma-family-v1';

const spyWords = {
  'أكلات': ['تفاحة','كشري','محشي','بيتزا','بطاطس','ملوخية','فراخ مشوية','رز بلبن','سمك','شاورما','كبدة','طعمية','فول','مكرونة','كفتة','بسبوسة','كنافة','مانجا','بطيخ','جبنة'],
  'أماكن': ['البيت','المدرسة','النادي','المصيف','المطبخ','الجنينة','السطح','المول','المترو','السينما','المطار','القاهرة','الإسكندرية','الصيدلية','المستشفى'],
  'حيوانات': ['قطة','كلب','أسد','فيل','زرافة','بطريق','دولفين','حصان','نمر','قرد','سلحفاة','عصفورة','تمساح','ديك','أرنب'],
  'حاجات مصرية': ['ميكروباص','كوبري','فانوس','عربية فول','فرح شعبي','طبلية','قهوة بلدي','توك توك','شنطة رمضان','اللمة','العيدية','الفسيخ','كحك','كشري التحرير']
};
const avatars = ['😀','😎','🤠','🥳','🦁','🐼','🐸','🐵','🦊','🐯','🐰','🐨'];
let state = load();
let audioOn = state.settings.audioOn;
let musicOn = state.settings.musicOn;
let audioCtx = null;
let musicTimer = null;

function load() {
  const defaults = { people: [], memories: [], stats: {}, settings: { audioOn: true, musicOn: false }, usedSpyWords: [] };
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return defaults; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function clickSound() {
  if (!audioOn) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = 520;
  gain.gain.value = .06;
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .08); osc.stop(audioCtx.currentTime + .09);
}
function startMusic() {
  if (!musicOn || musicTimer) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const notes = [262,330,392,330,294,349,440,349]; let i = 0;
  musicTimer = setInterval(() => {
    if (!musicOn) return stopMusic();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = notes[i++ % notes.length]; gain.gain.value = .025;
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .22); osc.stop(audioCtx.currentTime + .24);
  }, 420);
}
function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
function btn(text, fn, cls='') { return `<button class="btn ${cls}" data-action="${fn}">${text}</button>`; }
function backButton(target='home') { return `<button class="btn small secondary" data-action="${target}">رجوع</button>`; }
function screen(html) { app.innerHTML = `<main class="screen">${html}</main>`; bind(); }
function bind() { document.querySelectorAll('[data-action]').forEach(el => el.onclick = () => { clickSound(); actions[el.dataset.action]?.(el); }); }
function personAvatar(p) { return p.photo ? `<img src="${p.photo}" alt="${p.name}">` : (p.avatar || '😀'); }
function currentEgyptCode() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const egypt = new Date(utc + 2 * 60 * 60000 - 12 * 60000);
  return String(egypt.getHours()).padStart(2,'0') + String(egypt.getMinutes()).padStart(2,'0');
}

const actions = {
  home: renderHome,
  games: renderGames,
  family: renderFamily,
  settings: renderSettings,
  memories: renderMemories,
  spySetup: renderSpySetup,
  addPerson: () => renderPersonForm(),
  savePerson: async () => {
    const name = document.getElementById('personName').value.trim();
    const file = document.getElementById('personPhoto').files[0];
    if (!name) return alert('اكتب الاسم الأول يا جميل');
    let photo = '';
    if (file) photo = await fileToDataUrl(file);
    const avatar = avatars[Math.floor(Math.random()*avatars.length)];
    state.people.push({ id: uid(), name, photo, avatar, wins: 0, caught: 0 });
    save(); renderFamily();
  },
  toggleAudio: () => { audioOn = !audioOn; state.settings.audioOn = audioOn; save(); renderSettings(); },
  toggleMusic: () => { musicOn = !musicOn; state.settings.musicOn = musicOn; save(); musicOn ? startMusic() : stopMusic(); renderSettings(); },
  startSpy: () => startSpyGame(),
  nextReveal: () => nextReveal(),
  deletePerson: (el) => {
    const id = el.dataset.id;
    const code = prompt('علشان تمسح الشخصية اكتب رمز التعديل الحالي.');
    if (code !== currentEgyptCode()) return alert('الرمز مش صح. محدش هيتشال بالغلط 😄');
    state.people = state.people.filter(p => p.id !== id); save(); renderFamily();
  }
};

function renderHome() {
  if (musicOn) startMusic();
  screen(`<section class="card logo"><h1>لَمّة</h1><p>ألعاب وضحك للعيلة من غير إنترنت</p></section>
  <section class="card menu">
    ${btn('🎲 يلا نلعب', 'games')}
    ${btn('👨‍👩‍👧 أفراد العيلة', 'family', 'green')}
    ${btn('📸 الذكريات', 'memories', 'pink')}
    ${btn('⚙️ الإعدادات', 'settings', 'secondary')}
  </section>`);
}
function renderGames() {
  screen(`<section class="card"><div class="topbar"><h2 class="title">اختار اللعبة</h2>${backButton()}</div>
    <div class="grid">
      <div class="game-card" data-action="spySetup"><div class="game-icon">🕵️</div><div><h3>لعبة الجاسوس</h3><p class="hint">كل الناس تعرف الكلمة... ماعدا الجاسوس.</p></div></div>
      <div class="game-card"><div class="game-icon">😂</div><div><h3>مين فينا؟</h3><p class="hint">قريبًا في النسخة الجاية.</p></div></div>
    </div></section>`); bind();
}
function renderFamily() {
  const peopleHtml = state.people.length ? state.people.map(p => `<div class="person"><div class="avatar">${personAvatar(p)}</div><strong>${p.name}</strong><small class="hint">فوز: ${p.wins || 0}</small><button class="btn small pink" data-action="deletePerson" data-id="${p.id}">حذف</button></div>`).join('') : `<p class="notice">لسه مفيش أفراد. ضيف أول واحد في العيلة 🎉</p>`;
  screen(`<section class="card"><div class="topbar"><h2 class="title">أفراد العيلة</h2>${backButton()}</div>${btn('➕ إضافة شخص', 'addPerson', 'green')}<div class="people">${peopleHtml}</div></section>`);
}
function renderPersonForm() {
  screen(`<section class="card"><div class="topbar"><h2 class="title">إضافة شخص</h2>${backButton('family')}</div>
    <div class="field"><label>الاسم</label><input class="input" id="personName" placeholder="مثلاً: عم محمد" /></div>
    <div class="field"><label>الصورة اختياري</label><input class="input" id="personPhoto" type="file" accept="image/*" /></div>
    <p class="hint">لو ما اخترتش صورة، هنحط أفاتار كرتوني تلقائي.</p>
    ${btn('حفظ الشخصية', 'savePerson', 'green')}</section>`);
}
function renderSettings() {
  screen(`<section class="card"><div class="topbar"><h2 class="title">الإعدادات</h2>${backButton()}</div>
    ${btn(audioOn ? '🔊 المؤثرات شغالة' : '🔇 المؤثرات مقفولة', 'toggleAudio')}
    <br><br>${btn(musicOn ? '🎵 الموسيقى شغالة' : '🎵 الموسيقى مقفولة', 'toggleMusic', 'secondary')}
    <p class="notice">حذف الشخصيات محمي برمز تعديل متغير، علشان محدش يمسح حد بالغلط.</p>
  </section>`);
}
function renderMemories() {
  screen(`<section class="card"><div class="topbar"><h2 class="title">الذكريات</h2>${backButton()}</div><p class="notice">هنضيف هنا حفظ المواقف المضحكة في مرحلة قريبة.</p></section>`);
}
function renderSpySetup() {
  if (state.people.length < 3) return screen(`<section class="card"><div class="topbar"><h2 class="title">لعبة الجاسوس</h2>${backButton('games')}</div><p class="notice">لازم تضيف ٣ أفراد على الأقل علشان تلعبوا.</p>${btn('إضافة أفراد العيلة', 'family', 'green')}</section>`);
  const cats = Object.keys(spyWords).map(c => `<option>${c}</option>`).join('');
  screen(`<section class="card"><div class="topbar"><h2 class="title">تجهيز الجاسوس</h2>${backButton('games')}</div>
    <div class="field"><label>الفئة</label><select class="select" id="spyCat">${cats}</select></div>
    <div class="field"><label>عدد الجواسيس</label><input class="input" id="spyCount" type="number" min="1" value="1" /></div>
    <div class="field"><label>وضع الجاسوس</label><select class="select" id="spyMode"><option value="hidden">يظهر له: أنت الجاسوس</option><option value="out">يظهر له: أنت برا</option><option value="different">كلمة مختلفة قريبة</option></select></div>
    <p class="hint">لازم يفضل على الأقل ٢ لاعبين عاديين.</p>${btn('ابدأ الجولة', 'startSpy', 'green')}</section>`);
}
let spyRound = null;
function startSpyGame() {
  const cat = document.getElementById('spyCat').value;
  let spyCount = Number(document.getElementById('spyCount').value || 1);
  const mode = document.getElementById('spyMode').value;
  const players = [...state.people];
  if (spyCount < 1) spyCount = 1;
  if (players.length - spyCount < 2) return alert('لازم يكون فيه ٢ لاعبين عاديين على الأقل. قلل عدد الجواسيس.');
  const words = spyWords[cat];
  let word = pickFreshWord(cat);
  let otherWord = words.find(w => w !== word) || word;
  const shuffled = players.sort(() => Math.random() - .5);
  const spies = new Set(shuffled.slice(0, spyCount).map(p => p.id));
  spyRound = { players: shuffled, spies, index: 0, word, otherWord, mode };
  nextReveal();
}
function nextReveal() {
  if (!spyRound) return renderGames();
  if (spyRound.index >= spyRound.players.length) return screen(`<section class="card"><div class="reveal"><h2>الجولة بدأت!</h2><p class="notice">اسألوا بعض وحاولوا تعرفوا مين الجاسوس من غير ما تكشفوا الكلمة.</p>${btn('جولة جديدة', 'spySetup', 'green')}${btn('القائمة', 'home', 'secondary')}</div></section>`);
  const p = spyRound.players[spyRound.index++];
  const isSpy = spyRound.spies.has(p.id);
  let shown = spyRound.word;
  if (isSpy && spyRound.mode === 'hidden') shown = 'أنت الجاسوس 🕵️';
  if (isSpy && spyRound.mode === 'out') shown = 'أنت برا 🚪';
  if (isSpy && spyRound.mode === 'different') shown = spyRound.otherWord;
  screen(`<section class="card"><div class="reveal"><div class="avatar">${personAvatar(p)}</div><h2>${p.name}</h2><p class="hint">خلي الشاشة ليك بس</p><div class="secret">${shown}</div><p class="notice">بعد ما تشوف، دوس وناول الموبايل للي بعدك.</p>${btn('تمام، اللي بعده', 'nextReveal', 'green')}</div></section>`);
}
function pickFreshWord(cat) {
  const words = spyWords[cat];
  const used = new Set(state.usedSpyWords.filter(x => x.cat === cat).map(x => x.word));
  let available = words.filter(w => !used.has(w));
  if (!available.length) { state.usedSpyWords = state.usedSpyWords.filter(x => x.cat !== cat); available = words; }
  const word = available[Math.floor(Math.random()*available.length)];
  state.usedSpyWords.push({ cat, word, at: Date.now() });
  state.usedSpyWords = state.usedSpyWords.slice(-200);
  save(); return word;
}
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); }); }

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
renderHome();
