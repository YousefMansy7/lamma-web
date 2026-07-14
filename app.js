const app = document.getElementById('app');
const STORAGE_KEY = 'lamma-family-v1';

const spyWords = {
  'أكلات': ['تفاحة','كشري','محشي','بيتزا','بطاطس','ملوخية','فراخ مشوية','رز بلبن','سمك','شاورما','كبدة','طعمية','فول','مكرونة','كفتة','بسبوسة','كنافة','مانجا','بطيخ','جبنة','حمام محشي','ممبار','فتة','رقاق','فطير مشلتت','بطاطا','حمص الشام','ترمس','لب','آيس كريم','كريب','برجر','سوشي','لازانيا','بانيه','كبدة إسكندراني','حواوشي','مسقعة','طاجن عكاوي'],
  'أماكن': ['البيت','المدرسة','النادي','المصيف','المطبخ','الجنينة','السطح','المول','المترو','السينما','المطار','القاهرة','الإسكندرية','الصيدلية','المستشفى','البلكونة','الأسانسير','الجراج','الكافيه','الجامعة','المكتب','الشغل','الملاهي','حديقة الحيوان','كورنيش النيل','محطة القطر','السوبر ماركت','الفرن','الحلاق','الشارع'],
  'حيوانات': ['قطة','كلب','أسد','فيل','زرافة','بطريق','دولفين','حصان','نمر','قرد','سلحفاة','عصفورة','تمساح','ديك','أرنب','بطة','وزة','حمار وحشي','دب','ثعلب','ذئب','كنغر','باندا','كوالا','نسر','بومة','سمكة قرش','أخطبوط','جمل','خروف'],
  'حاجات مصرية': ['ميكروباص','كوبري','فانوس','عربية فول','فرح شعبي','طبلية','قهوة بلدي','توك توك','شنطة رمضان','اللمة','العيدية','الفسيخ','كحك','كشري التحرير','كوباية شاي','السبتية','العتبة','خان الخليلي','الزحمة','كارت شحن','ريموت التكييف','كيس لب','طبق مخلل','الطابور','الجرنال القديم','كرسي بلاستيك'],
  'أفلام ومسلسلات': ['الكبير أوي','الناظر','عسل أسود','إكس لارج','صعيدي في الجامعة الأمريكية','عبود على الحدود','اللمبي','فول الصين العظيم','الوصية','بـ100 وش','لن أعيش في جلباب أبي','رأفت الهجان','الحفيد','سمير وشهير وبهير','واحد تاني','إبراهيم الأبيض','تيتو','جزيرة غمام','موضوع عائلي','بالطو'],
  'رياضة': ['كورة قدم','تنس','سباحة','جيم','ماتش قمة','حارس مرمى','بلنتي','تسلل','كابتن الفريق','مدرب','حكم','كأس العالم','أولمبياد','ملاكمة','سلة','طائرة','إسكواش','مضرب','استاد','تشجيع']
};

const avatars = ['😀','😎','🤠','🥳','🦁','🐼','🐸','🐵','🦊','🐯','🐰','🐨','🦄','🐧','🐥','🐙'];
let state = load();
let audioOn = state.settings.audioOn;
let musicOn = state.settings.musicOn;
let audioCtx = null;
let musicTimer = null;
let spyRound = null;
let addPersonReturn = 'family';

function defaultStats() {
  return { played: 0, spyRounds: 0, citizenRounds: 0, spyWins: 0, citizenWins: 0, caughtAsSpy: 0, correctVotes: 0, wrongVotes: 0, guessedWord: 0, votesReceived: 0 };
}
function load() {
  const defaults = { people: [], memories: [], stats: {}, settings: { audioOn: true, musicOn: false }, usedSpyWords: [] };
  try {
    const data = { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    data.people ||= [];
    data.stats ||= {};
    data.people.forEach(p => { data.stats[p.id] = { ...defaultStats(), ...(data.stats[p.id] || {}) }; });
    data.settings = { ...defaults.settings, ...(data.settings || {}) };
    data.usedSpyWords ||= [];
    return data;
  } catch { return defaults; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function escapeHtml(str='') { return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
function sample(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function getPerson(id) { return state.people.find(p => p.id === id) || spyRound?.players.find(p => p.id === id); }
function statsFor(id) { state.stats[id] = { ...defaultStats(), ...(state.stats[id] || {}) }; return state.stats[id]; }

function clickSound(kind='click') {
  if (!audioOn) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const freqs = { click: 520, success: 740, sad: 260 };
  osc.frequency.value = freqs[kind] || 520;
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
function bind() {
  document.querySelectorAll('[data-action]').forEach(el => el.onclick = () => { clickSound(); actions[el.dataset.action]?.(el); });
}
function personAvatar(p) { return p.photo ? `<img src="${p.photo}" alt="${escapeHtml(p.name)}">` : (p.avatar || '😀'); }
function personChip(p, extra='') { return `<div class="person ${extra}"><div class="avatar">${personAvatar(p)}</div><strong>${escapeHtml(p.name)}</strong></div>`; }
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
  leaderboard: renderLeaderboard,
  settings: renderSettings,
  memories: renderMemories,
  spySetup: renderSpySetup,
  addPerson: () => renderPersonForm('family'),
  addPersonFromSpy: () => renderPersonForm('spySetup'),
  savePerson: async () => savePersonForm(),
  toggleAudio: () => { audioOn = !audioOn; state.settings.audioOn = audioOn; save(); renderSettings(); },
  toggleMusic: () => { musicOn = !musicOn; state.settings.musicOn = musicOn; save(); musicOn ? startMusic() : stopMusic(); renderSettings(); },
  startSpy: () => startSpyGame(),
  spyRevealNow: () => renderSpySecret(),
  spyNextPlayer: () => spyNextPlayer(),
  spyMoreQuestions: () => renderQuestionPrompt(),
  spyStartVoting: () => startVoting(),
  spySubmitVote: () => submitVote(),
  spySubmitGuess: () => submitSpyGuess(),
  spyFinishRound: () => finishSpyRound(),
  deletePerson: (el) => deletePerson(el.dataset.id)
};

function renderHome() {
  if (musicOn) startMusic();
  screen(`<section class="card logo"><h1>لَمّة</h1><p>ألعاب وضحك للعيلة من غير إنترنت</p></section>
  <section class="card menu">
    ${btn('🎲 يلا نلعب', 'games')}
    ${btn('👨‍👩‍👧 أفراد العيلة', 'family', 'green')}
    ${btn('🏆 لوحة الصدارة', 'leaderboard', 'pink')}
    ${btn('📸 الذكريات', 'memories', 'secondary')}
    ${btn('⚙️ الإعدادات', 'settings', 'secondary')}
  </section>`);
}
function renderGames() {
  screen(`<section class="card"><div class="topbar"><h2 class="title">اختار اللعبة</h2>${backButton()}</div>
    <div class="grid">
      <div class="game-card" data-action="spySetup"><div class="game-icon">🕵️</div><div><h3>لعبة الجاسوس</h3><p class="hint">اختار اللاعبين من أفراد العيلة، وكل واحد يشوف كلمته لوحده.</p></div></div>
      <div class="game-card"><div class="game-icon">😂</div><div><h3>مين فينا؟</h3><p class="hint">قريبًا في نسخة جاية.</p></div></div>
    </div></section>`); bind();
}
function renderFamily() {
  const peopleHtml = state.people.length ? state.people.map(p => {
    const s = statsFor(p.id);
    return `<div class="person"><div class="avatar">${personAvatar(p)}</div><strong>${escapeHtml(p.name)}</strong><small class="hint">لعب: ${s.played} · فاز: ${s.spyWins + s.citizenWins}</small><button class="btn small pink" data-action="deletePerson" data-id="${p.id}">حذف</button></div>`;
  }).join('') : `<p class="notice">لسه مفيش أفراد. ضيف أول واحد في العيلة 🎉</p>`;
  screen(`<section class="card"><div class="topbar"><h2 class="title">أفراد العيلة</h2>${backButton()}</div>${btn('➕ إضافة شخص', 'addPerson', 'green')}<div class="people">${peopleHtml}</div></section>`);
}
function renderPersonForm(returnTo='family') {
  addPersonReturn = returnTo;
  screen(`<section class="card"><div class="topbar"><h2 class="title">إضافة شخص</h2>${backButton(returnTo)}</div>
    <div class="field"><label>الاسم</label><input class="input" id="personName" placeholder="مثلاً: يوسف" /></div>
    <div class="field"><label>الصورة اختياري</label><input class="input" id="personPhoto" type="file" accept="image/*" /></div>
    <p class="hint">لو ما اخترتش صورة، هنحط أفاتار كرتوني تلقائي.</p>
    ${btn('حفظ الشخصية', 'savePerson', 'green')}</section>`);
}
async function savePersonForm() {
  const name = document.getElementById('personName').value.trim();
  const file = document.getElementById('personPhoto').files[0];
  if (!name) return alert('اكتب الاسم الأول يا جميل');
  let photo = '';
  if (file) photo = await fileToDataUrl(file);
  const avatar = avatars[Math.floor(Math.random()*avatars.length)];
  const person = { id: uid(), name, photo, avatar };
  state.people.push(person);
  state.stats[person.id] = defaultStats();
  save();
  if (addPersonReturn === 'spySetup') renderSpySetup(); else renderFamily();
}
function deletePerson(id) {
  const code = prompt('علشان تمسح الشخصية اكتب رمز التعديل الحالي.');
  if (code !== currentEgyptCode()) return alert('الرمز مش صح. محدش هيتشال بالغلط 😄');
  state.people = state.people.filter(p => p.id !== id);
  delete state.stats[id];
  save(); renderFamily();
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

function renderLeaderboard() {
  const rows = state.people.map(p => {
    const s = statsFor(p.id);
    const wins = s.spyWins + s.citizenWins;
    const score = wins * 3 + s.correctVotes + s.guessedWord * 2 - s.wrongVotes;
    return { p, s, wins, score };
  }).sort((a,b) => b.score - a.score || b.wins - a.wins);
  const html = rows.length ? rows.map((r, i) => `<div class="leader-row">
    <div class="rank">${i+1}</div><div class="avatar mini">${personAvatar(r.p)}</div><div><strong>${escapeHtml(r.p.name)}</strong><small class="hint">نقاط: ${r.score} · فوز: ${r.wins} · تصويت صح: ${r.s.correctVotes}</small></div>
  </div>`).join('') : '<p class="notice">لسه مفيش نتائج. العبوا كام جولة وهنحسب كل حاجة هنا.</p>';
  screen(`<section class="card"><div class="topbar"><h2 class="title">لوحة الصدارة</h2>${backButton()}</div>${html}</section>`);
}

function renderSpySetup() {
  if (state.people.length < 3) return screen(`<section class="card"><div class="topbar"><h2 class="title">لعبة الجاسوس</h2>${backButton('games')}</div><p class="notice">ضيف ٣ أفراد على الأقل، وبعدها في كل جولة هتختار مين حاضر من الليستة.</p>${btn('➕ إضافة شخص', 'addPersonFromSpy', 'green')}</section>`);
  const cats = Object.keys(spyWords).map(c => `<option>${c}</option>`).join('');
  const peopleOptions = state.people.map(p => `<label class="check-card"><input type="checkbox" class="spy-player" value="${p.id}" checked><span class="avatar mini">${personAvatar(p)}</span><span>${escapeHtml(p.name)}</span></label>`).join('');
  screen(`<section class="card"><div class="topbar"><h2 class="title">تجهيز الجاسوس</h2>${backButton('games')}</div>
    <p class="notice">اختار مين موجود في الجولة دي. مش لازم كل أفراد العيلة يلعبوا كل مرة.</p>
    <div class="people-select">${peopleOptions}</div>
    ${btn('➕ شخص مش في الليستة؟ ضيفه', 'addPersonFromSpy', 'secondary')}
    <hr>
    <div class="field"><label>الفئة</label><select class="select" id="spyCat">${cats}</select></div>
    <div class="field"><label>عدد الجواسيس</label><input class="input" id="spyCount" type="number" min="1" value="1" /></div>
    <div class="field"><label>وضع الجاسوس</label><select class="select" id="spyMode"><option value="hidden">يظهر له: أنت الجاسوس</option><option value="out">يظهر له: أنت برا</option><option value="different">كلمة مختلفة قريبة</option></select></div>
    <p class="hint">لازم تختار ٣ لاعبين على الأقل، ولازم يفضل على الأقل ٢ لاعبين عاديين.</p>${btn('ابدأ الجولة', 'startSpy', 'green')}</section>`);
}

function startSpyGame() {
  const selectedIds = [...document.querySelectorAll('.spy-player:checked')].map(x => x.value);
  const players = selectedIds.map(id => state.people.find(p => p.id === id)).filter(Boolean);
  if (players.length < 3) return alert('اختار ٣ لاعبين على الأقل.');
  const cat = document.getElementById('spyCat').value;
  let spyCount = Number(document.getElementById('spyCount').value || 1);
  const mode = document.getElementById('spyMode').value;
  if (spyCount < 1) spyCount = 1;
  if (players.length - spyCount < 2) return alert('لازم يكون فيه ٢ لاعبين عاديين على الأقل. قلل عدد الجواسيس أو زود اللاعبين.');
  const words = spyWords[cat];
  let word = pickFreshWord(cat);
  let otherWord = words.find(w => w !== word) || word;
  const shuffled = shuffle(players);
  const spies = new Set(shuffled.slice(0, spyCount).map(p => p.id));
  spyRound = {
    players: shuffled, spies, revealIndex: 0, currentReveal: null,
    word, otherWord, mode, cat,
    askedPairs: [], votes: {}, voteIndex: 0,
    spyIds: [...spies], guessIndex: 0, guesses: {}, result: null
  };
  renderSpyHandover();
}
function renderSpyHandover() {
  if (!spyRound) return renderGames();
  if (spyRound.revealIndex >= spyRound.players.length) return renderQuestionPrompt();
  const p = spyRound.players[spyRound.revealIndex];
  spyRound.currentReveal = p.id;
  screen(`<section class="card"><div class="reveal">
    <div class="avatar big">${personAvatar(p)}</div>
    <h2>${escapeHtml(p.name)}</h2>
    <p class="notice">ادي الجهاز لـ <strong>${escapeHtml(p.name)}</strong> بس. محدش يبص غيره.</p>
    <p class="hint">لما ${escapeHtml(p.name)} يمسك الجهاز، يدوس الزرار اللي تحت علشان يشوف الكلمة.</p>
    ${btn(`أنا ${escapeHtml(p.name)}، ورّيني`, 'spyRevealNow', 'green')}
  </div></section>`);
}
function renderSpySecret() {
  const p = getPerson(spyRound.currentReveal);
  const isSpy = spyRound.spies.has(p.id);
  let shown = spyRound.word;
  if (isSpy && spyRound.mode === 'hidden') shown = 'أنت الجاسوس 🕵️';
  if (isSpy && spyRound.mode === 'out') shown = 'أنت برا 🚪';
  if (isSpy && spyRound.mode === 'different') shown = spyRound.otherWord;
  screen(`<section class="card"><div class="reveal">
    <div class="avatar big">${personAvatar(p)}</div>
    <h2>${escapeHtml(p.name)}</h2>
    <p class="hint">خلي الشاشة ليك بس</p>
    <div class="secret">${escapeHtml(shown)}</div>
    <p class="notice">حفظت؟ دوس الزرار وناول الموبايل للي بعدك.</p>
    ${btn('خلصت، اخفيها', 'spyNextPlayer', 'green')}
  </div></section>`);
}
function spyNextPlayer() {
  spyRound.revealIndex += 1;
  spyRound.currentReveal = null;
  renderSpyHandover();
}
function makeQuestionPair() {
  const a = sample(spyRound.players);
  let b = sample(spyRound.players.filter(p => p.id !== a.id));
  let key = `${a.id}-${b.id}`;
  let guard = 0;
  while (spyRound.askedPairs.includes(key) && guard++ < 30) {
    const aa = sample(spyRound.players);
    const bb = sample(spyRound.players.filter(p => p.id !== aa.id));
    key = `${aa.id}-${bb.id}`;
    if (!spyRound.askedPairs.includes(key)) return { a: aa, b: bb, key };
  }
  return { a, b, key };
}
function renderQuestionPrompt() {
  const pair = makeQuestionPair();
  spyRound.askedPairs.push(pair.key);
  screen(`<section class="card"><div class="reveal">
    <h2>وقت الأسئلة 👀</h2>
    <div class="versus">
      ${personChip(pair.a)}<div class="arrow">يسأل</div>${personChip(pair.b)}
    </div>
    <p class="notice"><strong>${escapeHtml(pair.a.name)}</strong> يسأل <strong>${escapeHtml(pair.b.name)}</strong> سؤال ذكي عن الكلمة، من غير ما يقول الكلمة نفسها.</p>
    ${btn('سؤال كمان، لسه مش متأكدين', 'spyMoreQuestions', 'secondary')}
    ${btn('حان وقت التصويت', 'spyStartVoting', 'green')}
  </div></section>`);
}
function startVoting() {
  spyRound.voteIndex = 0;
  spyRound.votes = {};
  renderVoteScreen();
}
function renderVoteScreen() {
  const voter = spyRound.players[spyRound.voteIndex];
  if (!voter) return startSpyGuesses();
  const options = spyRound.players.filter(p => p.id !== voter.id).map(p => `<label class="vote-card"><input type="radio" name="vote" value="${p.id}"><span class="avatar mini">${personAvatar(p)}</span><span>${escapeHtml(p.name)}</span></label>`).join('');
  screen(`<section class="card"><div class="reveal">
    <div class="avatar big">${personAvatar(voter)}</div>
    <h2>${escapeHtml(voter.name)} بيصوّت</h2>
    <p class="notice">ادي الجهاز لـ <strong>${escapeHtml(voter.name)}</strong>. اختار أكتر شخص شاكك إنه الجاسوس.</p>
    <div class="vote-list">${options}</div>
    ${btn('تسجيل التصويت', 'spySubmitVote', 'green')}
  </div></section>`);
}
function submitVote() {
  const chosen = document.querySelector('input[name="vote"]:checked')?.value;
  if (!chosen) return alert('اختار شخص الأول.');
  const voter = spyRound.players[spyRound.voteIndex];
  spyRound.votes[voter.id] = chosen;
  spyRound.voteIndex += 1;
  renderVoteScreen();
}
function startSpyGuesses() {
  spyRound.guessIndex = 0;
  spyRound.guesses = {};
  renderSpyGuessScreen();
}
function renderSpyGuessScreen() {
  const spyId = spyRound.spyIds[spyRound.guessIndex];
  if (!spyId) return finishSpyRound();
  const spy = getPerson(spyId);
  screen(`<section class="card"><div class="reveal">
    <div class="avatar big">${personAvatar(spy)}</div>
    <h2>${escapeHtml(spy.name)}</h2>
    <p class="notice">لو أنت جاسوس، حاول تخمن الكلمة. لو مش عارف، اكتب أي تخمين.</p>
    <input class="input center-input" id="spyGuess" placeholder="اكتب تخمين الكلمة" autocomplete="off" />
    ${btn('تسجيل التخمين', 'spySubmitGuess', 'green')}
  </div></section>`);
}
function normalizeWord(w) { return String(w || '').trim().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').toLowerCase(); }
function submitSpyGuess() {
  const spyId = spyRound.spyIds[spyRound.guessIndex];
  const guess = document.getElementById('spyGuess').value.trim();
  if (!guess) return alert('اكتب تخمين حتى لو مش متأكد.');
  spyRound.guesses[spyId] = guess;
  spyRound.guessIndex += 1;
  renderSpyGuessScreen();
}
function finishSpyRound() {
  const voteCounts = {};
  Object.values(spyRound.votes).forEach(id => voteCounts[id] = (voteCounts[id] || 0) + 1);
  let maxVotes = Math.max(0, ...Object.values(voteCounts));
  const topVotedIds = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
  const caughtSpy = topVotedIds.some(id => spyRound.spies.has(id));
  const spyGuessed = Object.entries(spyRound.guesses).some(([id, guess]) => normalizeWord(guess) === normalizeWord(spyRound.word));
  const spiesWin = spyGuessed || !caughtSpy;
  spyRound.result = { voteCounts, topVotedIds, caughtSpy, spyGuessed, spiesWin };
  applySpyStats();
  renderSpyResults();
}
function applySpyStats() {
  const r = spyRound.result;
  spyRound.players.forEach(p => {
    const s = statsFor(p.id);
    s.played += 1;
    const isSpy = spyRound.spies.has(p.id);
    if (isSpy) {
      s.spyRounds += 1;
      if (r.spiesWin) s.spyWins += 1;
      if (r.topVotedIds.includes(p.id)) s.caughtAsSpy += 1;
      if (normalizeWord(spyRound.guesses[p.id]) === normalizeWord(spyRound.word)) s.guessedWord += 1;
    } else {
      s.citizenRounds += 1;
      if (!r.spiesWin) s.citizenWins += 1;
      const votedId = spyRound.votes[p.id];
      if (spyRound.spies.has(votedId)) s.correctVotes += 1; else s.wrongVotes += 1;
    }
    s.votesReceived += Object.values(spyRound.votes).filter(id => id === p.id).length;
  });
  save();
}
function renderSpyResults() {
  const r = spyRound.result;
  const spies = spyRound.spyIds.map(id => getPerson(id));
  const topNames = r.topVotedIds.map(id => getPerson(id)?.name || 'شخص').join('، ');
  const guesses = spies.map(p => `<div class="leader-row"><div class="avatar mini">${personAvatar(p)}</div><div><strong>${escapeHtml(p.name)}</strong><small class="hint">تخمينه: ${escapeHtml(spyRound.guesses[p.id] || '—')}</small></div></div>`).join('');
  const voteRows = spyRound.players.map(p => {
    const count = r.voteCounts[p.id] || 0;
    return `<div class="leader-row"><div class="avatar mini">${personAvatar(p)}</div><div><strong>${escapeHtml(p.name)}</strong><small class="hint">أصوات عليه: ${count}</small></div></div>`;
  }).join('');
  screen(`<section class="card"><div class="reveal">
    <h2>${r.spiesWin ? 'الجواسيس كسبوا 🕵️' : 'العيلة كشفت الجاسوس 🎉'}</h2>
    <p class="notice">الكلمة كانت: <strong>${escapeHtml(spyRound.word)}</strong><br>أعلى تصويت: <strong>${escapeHtml(topNames || 'مفيش')}</strong><br>${r.spyGuessed ? 'الجاسوس خمن الكلمة صح.' : 'الجاسوس مخمنش الكلمة صح.'}</p>
    <h3>الجواسيس</h3><div class="people">${spies.map(p => personChip(p)).join('')}</div>
    <h3>التخمينات</h3>${guesses}
    <h3>الأصوات</h3>${voteRows}
    ${btn('جولة جديدة', 'spySetup', 'green')}
    ${btn('لوحة الصدارة', 'leaderboard', 'pink')}
    ${btn('القائمة الرئيسية', 'home', 'secondary')}
  </div></section>`);
}
function pickFreshWord(cat) {
  const words = spyWords[cat];
  const used = new Set(state.usedSpyWords.filter(x => x.cat === cat).map(x => x.word));
  let available = words.filter(w => !used.has(w));
  if (!available.length) { state.usedSpyWords = state.usedSpyWords.filter(x => x.cat !== cat); available = words; }
  const word = available[Math.floor(Math.random()*available.length)];
  state.usedSpyWords.push({ cat, word, at: Date.now() });
  state.usedSpyWords = state.usedSpyWords.slice(-300);
  save(); return word;
}
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); }); }

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
renderHome();
