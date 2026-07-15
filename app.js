/* Lamma v5 — rebuilt audio, Cairo-time admin code, offline PWA */
const app = document.getElementById('app');
const STORAGE_KEY = 'lamma-family-v5';

const spyWords = {
  'أكلات': ['تفاحة','كشري','محشي','بيتزا','بطاطس','ملوخية','فراخ مشوية','رز بلبن','سمك','شاورما','كبدة','طعمية','فول','مكرونة','كفتة','بسبوسة','كنافة','مانجا','بطيخ','جبنة','حمام محشي','ممبار','فتة','رقاق','فطير مشلتت','بطاطا','حمص الشام','ترمس','لب','آيس كريم','كريب','برجر','سوشي','لازانيا','بانيه','حواوشي','مسقعة','طاجن عكاوي'],
  'أماكن': ['البيت','المدرسة','النادي','المصيف','المطبخ','الجنينة','السطح','المول','المترو','السينما','المطار','القاهرة','الإسكندرية','الصيدلية','المستشفى','البلكونة','الأسانسير','الجراج','الكافيه','الجامعة','المكتب','الشغل','الملاهي','حديقة الحيوان','كورنيش النيل','محطة القطر','السوبر ماركت','الفرن','الحلاق','الشارع'],
  'حيوانات': ['قطة','كلب','أسد','فيل','زرافة','بطريق','دولفين','حصان','نمر','قرد','سلحفاة','عصفورة','تمساح','ديك','أرنب','بطة','وزة','حمار وحشي','دب','ثعلب','ذئب','كنغر','باندا','كوالا','نسر','بومة','سمكة قرش','أخطبوط','جمل','خروف'],
  'حاجات مصرية': ['ميكروباص','كوبري','فانوس','عربية فول','فرح شعبي','طبلية','قهوة بلدي','توك توك','شنطة رمضان','اللمة','العيدية','الفسيخ','كحك','كوباية شاي','العتبة','خان الخليلي','الزحمة','كارت شحن','ريموت التكييف','كيس لب','طبق مخلل','الطابور','كرسي بلاستيك'],
  'أفلام ومسلسلات': ['الكبير أوي','الناظر','عسل أسود','إكس لارج','صعيدي في الجامعة الأمريكية','عبود على الحدود','اللمبي','فول الصين العظيم','الوصية','بـ100 وش','لن أعيش في جلباب أبي','رأفت الهجان','الحفيد','سمير وشهير وبهير','تيتو','موضوع عائلي','بالطو'],
  'رياضة': ['كورة قدم','تنس','سباحة','جيم','ماتش قمة','حارس مرمى','بلنتي','تسلل','كابتن الفريق','مدرب','حكم','كأس العالم','أولمبياد','ملاكمة','سلة','طائرة','إسكواش','مضرب','استاد','تشجيع']
};
const mostLikelyPrompts = ['مين أكتر واحد بينام في أي وقت؟','مين أكتر واحد ممكن ينسى موبايله؟','مين أكتر واحد بيضحك من غير سبب؟','مين أكتر واحد ممكن يكسب بالغش؟','مين أكتر واحد بيقول أنا جاي وهو لسه في البيت؟','مين أكتر واحد بيخلص الأكل الأول؟','مين أكتر واحد ممكن يبقى مشهور؟','مين أكتر واحد بيعرف يحفظ سر؟','مين أكتر واحد ممكن يسافر فجأة؟','مين أكتر واحد بيتوتر بسرعة؟','مين أكتر واحد صوته عالي؟','مين أكتر واحد بيحب يصور؟','مين أكتر واحد بياخد وقت في اختيار الأكل؟','مين أكتر واحد ممكن يعمل مقلب؟','مين أكتر واحد حنين؟','مين أكتر واحد بيعرف يصلّح حاجات؟','مين أكتر واحد ممكن ينام في المواصلات؟','مين أكتر واحد بيحب المغامرة؟','مين أكتر واحد منظم؟','مين أكتر واحد ممكن ينسى عيد ميلاد؟'];
const challenges = ['قلّد حد من العيلة لمدة 20 ثانية','قول جملة صعبة 3 مرات بسرعة','اعمل إعلان مضحك لكوباية مية','امشي كأنك روبوت لمدة 15 ثانية','مثّل إنك كسبت مليون جنيه','غنّي أي أغنية بصوت كرتوني','احكي نكتة من غير ما تضحك','اتكلم كأنك مذيع نشرة أخبار','اعمل وش غريب وخليك ثابت 10 ثواني','قلّد صوت 3 حيوانات','قول 5 أكلات بحرف الميم في 10 ثواني','اتكلم ببطء شديد لمدة جولة','مثّل إن الأرض سخنة','اختار شخص وامدحه بطريقة درامية','اعمل رقصة فوز لمدة 10 ثواني','حاول تضحك شخص من غير كلام'];
const charadesWords = ['بيغسل المواعين','بيجري ورا أتوبيس','بيفتح هدية','بيعمل فشار','بيصطاد سمك','بيصور سيلفي','بيصلح لمبة','بيذاكر قبل الامتحان','بيشجع في ماتش','بياكل ليمونة','بيحاول ينام وفي ناموسة','بيعمل كيك','بيسوق عربية','بيسبح','بيطير طيارة','بيفتح شمسية في الهوا','بيكلم حد والتليفون فاصل','بيحاول يلبس جزمة ضيقة','بيصحى متأخر','بيغني في فرح'];
const quizQuestions = [
 {q:'القاهرة هي عاصمة مصر.',a:true},{q:'الأخطبوط عنده 3 قلوب.',a:true},{q:'الشمس بتلف حوالين الأرض.',a:false},{q:'المية بتغلي عند 100 درجة مئوية عند سطح البحر.',a:true},{q:'الخفاش طائر.',a:false},{q:'أكبر كوكب في المجموعة الشمسية هو المشتري.',a:true},{q:'البطريق بيعيش في القطب الشمالي.',a:false},{q:'اللغة العربية بتتكتب من اليمين للشمال.',a:true},{q:'عدد أيام السنة العادية 366 يوم.',a:false},{q:'النيل من أطول أنهار العالم.',a:true},{q:'العنكبوت عنده 6 أرجل.',a:false},{q:'القمر مصدر ضوء من نفسه.',a:false},{q:'الفيل أكبر حيوان بري.',a:true},{q:'النعامة تقدر تطير.',a:false},{q:'القلب موجود في الناحية الشمال بالكامل.',a:false}
];
const avatars = ['😀','😎','🤠','🥳','🦁','🐼','🐸','🐵','🦊','🐯','🐰','🐨','🦄','🐧','🐥','🐙'];
let state = load(), audioOn = state.settings.audioOn, musicOn = state.settings.musicOn;
let audioCtx=null, masterGain=null, musicTimer=null, musicStep=0, audioUnlocked=false, spyRound=null, addPersonReturn='family';
let likelyRound=null, challengeRound=null, charadeRound=null, quizRound=null, countdownTimer=null;

function defaultStats(){return{played:0,spyRounds:0,citizenRounds:0,spyWins:0,citizenWins:0,caughtAsSpy:0,correctVotes:0,wrongVotes:0,guessedWord:0,votesReceived:0,likelyWins:0,challengeWins:0,charadeWins:0,quizCorrect:0,points:0};}
function load(){const d={people:[],memories:[],stats:{},settings:{audioOn:true,musicOn:false,musicTrack:'party'},usedSpyWords:[]};try{const x={...d,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')};x.people||=[];x.stats||={};x.settings={...d.settings,...(x.settings||{})};x.people.forEach(p=>x.stats[p.id]={...defaultStats(),...(x.stats[p.id]||{})});x.memories||=[];x.usedSpyWords||=[];return x;}catch{return d;}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function shuffle(a){return [...a].sort(()=>Math.random()-.5);} function sample(a){return a[Math.floor(Math.random()*a.length)];}
function person(id){return state.people.find(p=>p.id===id)||spyRound?.players.find(p=>p.id===id);} function stats(id){state.stats[id]={...defaultStats(),...(state.stats[id]||{})};return state.stats[id];}
function avatar(p){return p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:(p.avatar||'😀');}
function chip(p,x=''){return `<div class="person ${x}"><div class="avatar">${avatar(p)}</div><strong>${esc(p.name)}</strong></div>`;}
function screen(h){clearInterval(countdownTimer);app.innerHTML=`<main class="screen">${h}</main>`;bind();}
function btn(t,a,c=''){return `<button class="btn ${c}" data-action="${a}">${t}</button>`;} function back(a='home'){return `<button class="btn small secondary" data-action="${a}">رجوع</button>`;}
function bind(){document.querySelectorAll('[data-action]').forEach(e=>e.onclick=()=>{sound();actions[e.dataset.action]?.(e);});}
function egyptTimeParts(date=new Date()){
  const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const parts=Object.fromEntries(fmt.formatToParts(date).map(x=>[x.type,x.value]));
  return {h:+parts.hour,m:+parts.minute};
}
function egyptCodeAt(offsetMinutes=0){
  const shifted=new Date(Date.now()+(offsetMinutes-12)*60000);
  const {h,m}=egyptTimeParts(shifted);
  return String(h).padStart(2,'0')+String(m).padStart(2,'0');
}
function normalizeDigits(v=''){return String(v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'');}
function isValidAdminCode(v){const code=normalizeDigits(v);return [0,-1,1].some(delta=>code===egyptCodeAt(delta));}
async function ensureAudio(){
  if(!audioCtx){
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    masterGain=audioCtx.createGain();
    masterGain.gain.value=.65;
    masterGain.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended') await audioCtx.resume();
  audioUnlocked=audioCtx.state==='running';
  return audioUnlocked;
}
async function sound(kind='click'){
  if(!audioOn)return;
  if(!await ensureAudio())return;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='triangle';o.frequency.value={click:620,success:880,sad:230}[kind]||620;
  g.gain.setValueAtTime(.06,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.13);
  o.connect(g);g.connect(masterGain);o.start();o.stop(audioCtx.currentTime+.14);
}
const tracks={
  party:{tempo:230,wave:'triangle',notes:[523,659,784,1047,784,659,587,698,880,1175,880,698]},
  bouncy:{tempo:270,wave:'square',notes:[659,784,988,784,659,523,587,740,880,740,587,494]},
  chill:{tempo:420,wave:'sine',notes:[262,294,330,392,330,294,247,294]}
};
function playMusicNote(){
  if(!musicOn||!audioUnlocked)return;
  const tr=tracks[state.settings.musicTrack]||tracks.party;
  const n=tr.notes[musicStep++%tr.notes.length];
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=tr.wave;o.frequency.value=n;
  g.gain.setValueAtTime(state.settings.musicTrack==='chill'?.035:.045,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+Math.min(.34,tr.tempo/1000*.9));
  o.connect(g);g.connect(masterGain);o.start();o.stop(audioCtx.currentTime+.38);
}
async function startMusic(){
  if(!musicOn||musicTimer)return false;
  if(!await ensureAudio())return false;
  const tr=tracks[state.settings.musicTrack]||tracks.party;
  playMusicNote();
  musicTimer=setInterval(playMusicNote,tr.tempo);
  return true;
}
function stopMusic(){clearInterval(musicTimer);musicTimer=null;}
async function unlockAndPlay(){audioUnlocked=await ensureAudio();if(musicOn)await startMusic();renderHome();}
async function testMusic(){await ensureAudio();const old=musicOn;musicOn=true;stopMusic();await startMusic();setTimeout(()=>{stopMusic();musicOn=old;if(old)startMusic();},2400);}

const actions={home:renderHome,unlockAudio:unlockAndPlay,testMusic,games:renderGames,family:renderFamily,leaderboard:renderLeaderboard,settings:renderSettings,memories:renderMemories,spySetup:renderSpySetup,likelySetup:renderLikelySetup,challengeSetup:renderChallengeSetup,charadeSetup:renderCharadeSetup,quizSetup:renderQuizSetup,addPerson:()=>renderPersonForm('family'),addPersonFromSpy:()=>renderPersonForm('spySetup'),savePerson,deletePerson:e=>deletePerson(e.dataset.id),toggleAudio:()=>{audioOn=!audioOn;state.settings.audioOn=audioOn;save();renderSettings();},toggleMusic:async()=>{musicOn=!musicOn;state.settings.musicOn=musicOn;save();if(musicOn){await startMusic();}else stopMusic();renderSettings();},setTrack:e=>{state.settings.musicTrack=e.dataset.track;save();stopMusic();if(musicOn)startMusic();renderSettings();},addMemory:addMemory,
startSpy,spyRevealNow:renderSpySecret,spyNextPlayer:()=>{spyRound.revealIndex++;renderSpyHandover();},spyMoreQuestions:renderQuestionPrompt,spyStartVoting:startVoting,spySubmitVote:submitVote,spySubmitGuess:submitSpyGuess,
startLikely,startLikelyVote,submitLikelyVote,likelyNext:renderLikelyPrompt,
startChallenge,challengeDone:()=>finishChallenge(true),challengeSkip:()=>finishChallenge(false),challengeNext:renderChallenge,
startCharade,charadeReveal:renderCharadeWord,charadeGuessed:()=>finishCharade(true),charadeMissed:()=>finishCharade(false),charadeNext:renderCharadeHandover,
startQuiz,quizTrue:()=>answerQuiz(true),quizFalse:()=>answerQuiz(false),quizNext:renderQuizQuestion};

function renderHome(){if(musicOn&&audioUnlocked)startMusic();const audioGate=musicOn&&!audioUnlocked?`<section class="audio-gate">🎵 الموسيقى جاهزة — لازم ضغطة واحدة بسبب حماية المتصفح ${btn('فعّل الصوت','unlockAudio','green small')}</section>`:'';screen(`${audioGate}<section class="hero card"><div class="sparkles">✨ 🎈 ✨</div><h1>لَمّة</h1><p>كل لَمّة فيها ضحكة جديدة</p><div class="floating">🎲</div></section><section class="card menu">${btn('🎮 يلا نلعب','games')}${btn('👨‍👩‍👧 أفراد العيلة','family','green')}${btn('🏆 لوحة الصدارة','leaderboard','pink')}${btn('📸 الذكريات','memories','secondary')}${btn('⚙️ الإعدادات','settings','secondary')}</section>`);}
function renderGames(){screen(`<section class="card"><div class="topbar"><h2 class="title">اختار اللعبة</h2>${back()}</div><div class="grid games-grid">
${gameCard('🕵️','لعبة الجاسوس','كلمات سرية وتصويت وذكاء','spySetup','yellow')}
${gameCard('😂','مين فينا؟','صوّتوا وشوفوا مين كسب اللقب','likelySetup','pinkish')}
${gameCard('🔥','تحديات اللمة','تحديات عشوائية وضحك ونقاط','challengeSetup','greenish')}
${gameCard('🎭','مثّلها','مثّل الكلمة قبل الوقت ما يخلص','charadeSetup','blueish')}
${gameCard('✅','صح ولا غلط','أسئلة سريعة ونقاط لكل لاعب','quizSetup','purpleish')}
</div></section>`);}
function gameCard(i,t,p,a,c){return `<div class="game-card ${c}" data-action="${a}"><div class="game-icon">${i}</div><div><h3>${t}</h3><p class="hint">${p}</p></div><span class="go">‹</span></div>`;}
function renderFamily(){const h=state.people.length?state.people.map(p=>{const s=stats(p.id);return `<div class="person"><div class="avatar">${avatar(p)}</div><strong>${esc(p.name)}</strong><small class="hint">نقاط: ${s.points} · لعب: ${s.played}</small><button class="btn small pink" data-action="deletePerson" data-id="${p.id}">حذف</button></div>`}).join(''):'<p class="notice">لسه مفيش أفراد. ضيف أول واحد 🎉</p>';screen(`<section class="card"><div class="topbar"><h2 class="title">أفراد العيلة</h2>${back()}</div>${btn('➕ إضافة شخص','addPerson','green')}<div class="people">${h}</div></section>`);}
function renderPersonForm(ret='family'){addPersonReturn=ret;screen(`<section class="card"><div class="topbar"><h2 class="title">إضافة شخص</h2>${back(ret)}</div><div class="field"><label>الاسم</label><input class="input" id="personName" placeholder="مثلاً: يوسف"></div><div class="field"><label>الصورة اختياري</label><input class="input" id="personPhoto" type="file" accept="image/*"></div><p class="hint">من غير صورة؟ هنختار أفاتار كرتوني تلقائي.</p>${btn('حفظ الشخصية','savePerson','green')}</section>`);}
async function savePerson(){const n=document.getElementById('personName').value.trim(),f=document.getElementById('personPhoto').files[0];if(!n)return alert('اكتب الاسم الأول');let photo='';if(f)photo=await fileData(f);const p={id:uid(),name:n,photo,avatar:sample(avatars)};state.people.push(p);state.stats[p.id]=defaultStats();save();actions[addPersonReturn]?.()||renderFamily();}
function deletePerson(id){if(!isValidAdminCode(prompt('اكتب رمز التعديل الحالي.')))return alert('الرمز مش صح 😄');state.people=state.people.filter(p=>p.id!==id);delete state.stats[id];save();renderFamily();}
function renderSettings(){screen(`<section class="card"><div class="topbar"><h2 class="title">الإعدادات</h2>${back()}</div>${btn(audioOn?'🔊 المؤثرات شغالة':'🔇 المؤثرات مقفولة','toggleAudio')}<br><br>${btn(musicOn?'🎵 الموسيقى شغالة':'🎵 الموسيقى مقفولة','toggleMusic','secondary')}<h3>اختار لحن الخلفية</h3><div class="track-grid"><button class="track ${state.settings.musicTrack==='party'?'active':''}" data-action="setTrack" data-track="party">🎉 حفلة</button><button class="track ${state.settings.musicTrack==='bouncy'?'active':''}" data-action="setTrack" data-track="bouncy">🪇 نطّاط</button><button class="track ${state.settings.musicTrack==='chill'?'active':''}" data-action="setTrack" data-track="chill">🌙 هادي</button></div>${btn('▶️ جرّب الموسيقى دلوقتي','testMusic','green')}<p class="notice">الموسيقى مولّدة داخل اللعبة. المتصفح بيطلب ضغطة من المستخدم قبل تشغيل أي صوت؛ فعّلها مرة واحدة وهتشتغل أثناء اللعب.</p></section>`);}
function renderMemories(){const cards=state.memories.slice().reverse().map(m=>`<div class="memory-card">📸 <strong>${esc(m.text)}</strong><small>${new Date(m.at).toLocaleDateString('ar-EG')}</small></div>`).join('')||'<p class="notice">لسه مفيش ذكريات محفوظة.</p>';screen(`<section class="card"><div class="topbar"><h2 class="title">الذكريات</h2>${back()}</div><div class="field"><input class="input" id="memoryText" placeholder="اكتب موقف مضحك حصل..."></div>${btn('✨ احفظ اللحظة','addMemory','pink')}<div class="memory-list">${cards}</div></section>`);}
function addMemory(){const x=document.getElementById('memoryText').value.trim();if(!x)return alert('اكتب الذكرى الأول');state.memories.push({text:x,at:Date.now()});save();sound('success');renderMemories();}
function renderLeaderboard(){const rows=state.people.map(p=>({p,s:stats(p.id)})).sort((a,b)=>b.s.points-a.s.points);screen(`<section class="card"><div class="topbar"><h2 class="title">لوحة الصدارة</h2>${back()}</div>${rows.length?rows.map((r,i)=>`<div class="leader-row"><div class="rank">${i<3?['🥇','🥈','🥉'][i]:i+1}</div><div class="avatar mini">${avatar(r.p)}</div><div><strong>${esc(r.p.name)}</strong><small class="hint">${r.s.points} نقطة · جاسوس ${r.s.spyWins} · تمثيل ${r.s.charadeWins} · تحديات ${r.s.challengeWins}</small></div></div>`).join(''):'<p class="notice">العبوا أول جولة علشان تبدأ المنافسة.</p>'}</section>`);}

function playerSelector(action,title,desc){if(state.people.length<2)return screen(`<section class="card"><div class="topbar"><h2>${title}</h2>${back('games')}</div><p class="notice">ضيف شخصين على الأقل.</p>${btn('إضافة شخص','addPerson','green')}</section>`);const h=state.people.map(p=>`<label class="check-card"><input type="checkbox" class="game-player" value="${p.id}" checked><span class="avatar mini">${avatar(p)}</span><span>${esc(p.name)}</span></label>`).join('');screen(`<section class="card"><div class="topbar"><h2 class="title">${title}</h2>${back('games')}</div><p class="notice">${desc}</p><div class="people-select">${h}</div>${btn('ابدأ',''+action,'green')}</section>`);}
function selectedPlayers(min=2){const ids=[...document.querySelectorAll('.game-player:checked')].map(x=>x.value),ps=ids.map(person).filter(Boolean);if(ps.length<min){alert(`اختار ${min} لاعبين على الأقل.`);return null;}return ps;}

/* Spy */
function renderSpySetup(){if(state.people.length<3)return playerSelector('startSpy','لعبة الجاسوس','لازم ٣ أفراد على الأقل.');const cats=Object.keys(spyWords).map(c=>`<option>${c}</option>`).join(''),h=state.people.map(p=>`<label class="check-card"><input type="checkbox" class="spy-player" value="${p.id}" checked><span class="avatar mini">${avatar(p)}</span><span>${esc(p.name)}</span></label>`).join('');screen(`<section class="card"><div class="topbar"><h2 class="title">تجهيز الجاسوس</h2>${back('games')}</div><div class="people-select">${h}</div><div class="field"><label>الفئة</label><select class="select" id="spyCat">${cats}</select></div><div class="field"><label>عدد الجواسيس</label><input class="input" id="spyCount" type="number" min="1" value="1"></div><div class="field"><label>وضع الجاسوس</label><select class="select" id="spyMode"><option value="hidden">أنت الجاسوس</option><option value="out">أنت برا</option><option value="different">كلمة مختلفة</option></select></div>${btn('ابدأ الجولة','startSpy','green')}</section>`);}
function startSpy(){const ps=[...document.querySelectorAll('.spy-player:checked')].map(x=>person(x.value)).filter(Boolean);if(ps.length<3)return alert('اختار ٣ على الأقل');let n=+document.getElementById('spyCount').value||1;if(ps.length-n<2)return alert('لازم يفضل لاعبين عاديين على الأقل');const cat=document.getElementById('spyCat').value,w=pickFreshWord(cat),other=spyWords[cat].find(x=>x!==w)||w,sh=shuffle(ps),sp=new Set(sh.slice(0,n).map(x=>x.id));spyRound={players:sh,spies:sp,revealIndex:0,word:w,otherWord:other,mode:document.getElementById('spyMode').value,askedPairs:[],votes:{},voteIndex:0,spyIds:[...sp],guessIndex:0,guesses:{}};renderSpyHandover();}
function renderSpyHandover(){if(spyRound.revealIndex>=spyRound.players.length)return renderQuestionPrompt();const p=spyRound.players[spyRound.revealIndex];spyRound.currentReveal=p.id;screen(`<section class="card reveal"><div class="avatar big">${avatar(p)}</div><h2>ادي الجهاز لـ ${esc(p.name)}</h2><p class="notice">محدش يبص غيره 👀</p>${btn(`أنا ${esc(p.name)}، ورّيني`,'spyRevealNow','green')}</section>`);}
function renderSpySecret(){const p=person(spyRound.currentReveal),is=spyRound.spies.has(p.id),shown=is?(spyRound.mode==='hidden'?'أنت الجاسوس 🕵️':spyRound.mode==='out'?'أنت برا 🚪':spyRound.otherWord):spyRound.word;screen(`<section class="card reveal"><div class="avatar big">${avatar(p)}</div><h2>${esc(p.name)}</h2><div class="secret">${esc(shown)}</div><p class="notice">احفظها وناول الجهاز للي بعدك.</p>${btn('اخفيها','spyNextPlayer','green')}</section>`);}
function renderQuestionPrompt(){let a=sample(spyRound.players),b=sample(spyRound.players.filter(x=>x.id!==a.id));screen(`<section class="card reveal"><h2>وقت الأسئلة 👀</h2><div class="versus">${chip(a)}<div class="arrow">يسأل</div>${chip(b)}</div><p class="notice">سؤال ذكي عن الكلمة من غير ما تقولها.</p>${btn('سؤال كمان','spyMoreQuestions','secondary')}${btn('حان وقت التصويت','spyStartVoting','green')}</section>`);}
function startVoting(){spyRound.voteIndex=0;spyRound.votes={};renderVoteScreen();}
function renderVoteScreen(){const v=spyRound.players[spyRound.voteIndex];if(!v)return startSpyGuesses();const o=spyRound.players.filter(p=>p.id!==v.id).map(p=>`<label class="vote-card"><input type="radio" name="vote" value="${p.id}"><span class="avatar mini">${avatar(p)}</span>${esc(p.name)}</label>`).join('');screen(`<section class="card reveal"><div class="avatar big">${avatar(v)}</div><h2>${esc(v.name)} بيصوّت</h2><div class="vote-list">${o}</div>${btn('تسجيل التصويت','spySubmitVote','green')}</section>`);}
function submitVote(){const c=document.querySelector('input[name="vote"]:checked')?.value;if(!c)return alert('اختار شخص');spyRound.votes[spyRound.players[spyRound.voteIndex].id]=c;spyRound.voteIndex++;renderVoteScreen();}
function startSpyGuesses(){spyRound.guessIndex=0;renderSpyGuess();}
function renderSpyGuess(){const id=spyRound.spyIds[spyRound.guessIndex];if(!id)return finishSpy();const p=person(id);screen(`<section class="card reveal"><div class="avatar big">${avatar(p)}</div><h2>${esc(p.name)} يخمن الكلمة</h2><input class="input center-input" id="spyGuess" placeholder="اكتب التخمين">${btn('سجل التخمين','spySubmitGuess','green')}</section>`);}
function submitSpyGuess(){const g=document.getElementById('spyGuess').value.trim();if(!g)return alert('اكتب تخمين');spyRound.guesses[spyRound.spyIds[spyRound.guessIndex]]=g;spyRound.guessIndex++;renderSpyGuess();}
function norm(w){return String(w||'').trim().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase();}
function finishSpy(){const counts={};Object.values(spyRound.votes).forEach(id=>counts[id]=(counts[id]||0)+1);const max=Math.max(0,...Object.values(counts)),top=Object.keys(counts).filter(id=>counts[id]===max),caught=top.some(id=>spyRound.spies.has(id)),guessed=Object.values(spyRound.guesses).some(g=>norm(g)===norm(spyRound.word)),win=guessed||!caught;spyRound.players.forEach(p=>{const s=stats(p.id);s.played++;const is=spyRound.spies.has(p.id);if(is){s.spyRounds++;if(win){s.spyWins++;s.points+=4;}if(top.includes(p.id))s.caughtAsSpy++;if(norm(spyRound.guesses[p.id])===norm(spyRound.word)){s.guessedWord++;s.points+=2;}}else{s.citizenRounds++;if(!win){s.citizenWins++;s.points+=3;}if(spyRound.spies.has(spyRound.votes[p.id])){s.correctVotes++;s.points++;}else s.wrongVotes++;}s.votesReceived+=Object.values(spyRound.votes).filter(x=>x===p.id).length;});save();sound('success');screen(`<section class="card reveal"><div class="result-burst">${win?'🕵️':'🎉'}</div><h2>${win?'الجواسيس كسبوا':'العيلة كشفتهم'}</h2><div class="secret">${esc(spyRound.word)}</div><p class="notice">الجواسيس: ${spyRound.spyIds.map(id=>esc(person(id).name)).join('، ')}</p>${btn('جولة جديدة','spySetup','green')}${btn('لوحة الصدارة','leaderboard','pink')}${btn('الرئيسية','home','secondary')}</section>`);}
function pickFreshWord(cat){const w=spyWords[cat],used=new Set(state.usedSpyWords.filter(x=>x.cat===cat).map(x=>x.word));let a=w.filter(x=>!used.has(x));if(!a.length){state.usedSpyWords=state.usedSpyWords.filter(x=>x.cat!==cat);a=w;}const x=sample(a);state.usedSpyWords.push({cat,word:x});state.usedSpyWords=state.usedSpyWords.slice(-300);save();return x;}

/* Most likely */
function renderLikelySetup(){playerSelector('startLikely','مين فينا؟','اختاروا الموجودين. كل واحد هيصوّت بسرية.');}
function startLikely(){const ps=selectedPlayers(3);if(!ps)return;likelyRound={players:ps,prompt:'',voter:0,votes:{}};renderLikelyPrompt();}
function renderLikelyPrompt(){likelyRound.prompt=sample(mostLikelyPrompts);likelyRound.voter=0;likelyRound.votes={};screen(`<section class="card reveal"><div class="result-burst">😂</div><h2>${esc(likelyRound.prompt)}</h2><p class="notice">اقروا السؤال، وبعدها كل واحد يصوّت لوحده.</p>${btn('ابدأ التصويت','startLikelyVote','green')}</section>`);}
function startLikelyVote(){renderLikelyVote();}
function renderLikelyVote(){const v=likelyRound.players[likelyRound.voter];if(!v)return finishLikely();const opts=likelyRound.players.map(p=>`<label class="vote-card"><input type="radio" name="likely" value="${p.id}"><span class="avatar mini">${avatar(p)}</span>${esc(p.name)}</label>`).join('');screen(`<section class="card reveal"><div class="avatar big">${avatar(v)}</div><h2>دور ${esc(v.name)}</h2><p class="hint">اختار من غير ما حد يشوف</p><div class="vote-list">${opts}</div>${btn('سجل صوتي','submitLikelyVote','green')}</section>`);}
function submitLikelyVote(){const id=document.querySelector('input[name="likely"]:checked')?.value;if(!id)return alert('اختار شخص');likelyRound.votes[likelyRound.players[likelyRound.voter].id]=id;likelyRound.voter++;renderLikelyVote();}
function finishLikely(){const c={};Object.values(likelyRound.votes).forEach(id=>c[id]=(c[id]||0)+1);const m=Math.max(...Object.values(c)),wins=Object.keys(c).filter(id=>c[id]===m);wins.forEach(id=>{const s=stats(id);s.likelyWins++;s.points+=2;});likelyRound.players.forEach(p=>stats(p.id).played++);save();sound('success');screen(`<section class="card reveal"><h2>${esc(likelyRound.prompt)}</h2><div class="winners">${wins.map(id=>chip(person(id))).join('')}</div><p class="notice">${wins.map(id=>esc(person(id).name)).join(' و ')} خد اللقب بـ ${m} صوت!</p>${btn('سؤال جديد','likelyNext','green')}${btn('لوحة الصدارة','leaderboard','pink')}${btn('الألعاب','games','secondary')}</section>`);}

/* Challenges */
function renderChallengeSetup(){playerSelector('startChallenge','تحديات اللمة','كل جولة لاعب عشوائي وتحدي عشوائي.');}
function startChallenge(){const ps=selectedPlayers(2);if(!ps)return;challengeRound={players:ps,last:null};renderChallenge();}
function renderChallenge(){let p=sample(challengeRound.players);if(challengeRound.last&&challengeRound.players.length>1)while(p.id===challengeRound.last)p=sample(challengeRound.players);challengeRound.last=p.id;challengeRound.player=p;challengeRound.text=sample(challenges);screen(`<section class="card reveal"><div class="avatar big">${avatar(p)}</div><h2>التحدي على ${esc(p.name)} 🔥</h2><div class="challenge-box">${esc(challengeRound.text)}</div>${btn('نفّذ التحدي ✅','challengeDone','green')}${btn('عدّى التحدي 🙈','challengeSkip','secondary')}</section>`);}
function finishChallenge(ok){const s=stats(challengeRound.player.id);s.played++;if(ok){s.challengeWins++;s.points+=2;sound('success');}else sound('sad');screen(`<section class="card reveal"><div class="result-burst">${ok?'🏅':'😅'}</div><h2>${ok?'برافو يا بطل!':'المرة الجاية!'}</h2><p class="notice">${esc(challengeRound.player.name)} ${ok?'كسب نقطتين':'مخدش نقاط الجولة دي'}.</p>${btn('تحدي جديد','challengeNext','green')}${btn('الألعاب','games','secondary')}</section>`);}

/* Charades */
function renderCharadeSetup(){playerSelector('startCharade','مثّلها 🎭','كل لاعب يشوف المهمة لوحده ويمثلها في 45 ثانية.');}
function startCharade(){const ps=selectedPlayers(2);if(!ps)return;charadeRound={players:shuffle(ps),index:0};renderCharadeHandover();}
function renderCharadeHandover(){if(charadeRound.index>=charadeRound.players.length)charadeRound.index=0;const p=charadeRound.players[charadeRound.index];charadeRound.player=p;charadeRound.word=sample(charadesWords);screen(`<section class="card reveal"><div class="avatar big">${avatar(p)}</div><h2>ادي الجهاز لـ ${esc(p.name)}</h2><p class="notice">هو بس اللي يشوف المطلوب.</p>${btn('ورّيني همثّل إيه','charadeReveal','green')}</section>`);}
function renderCharadeWord(){screen(`<section class="card reveal"><h2>مثّل من غير كلام</h2><div class="secret">${esc(charadeRound.word)}</div><div id="timer" class="timer">45</div>${btn('اتعرفت ✅','charadeGuessed','green')}${btn('الوقت خلص ❌','charadeMissed','secondary')}</section>`);let t=45;countdownTimer=setInterval(()=>{t--;const e=document.getElementById('timer');if(e)e.textContent=t;if(t<=0){clearInterval(countdownTimer);finishCharade(false);}},1000);}
function finishCharade(ok){clearInterval(countdownTimer);const s=stats(charadeRound.player.id);s.played++;if(ok){s.charadeWins++;s.points+=3;sound('success');}else sound('sad');charadeRound.index++;screen(`<section class="card reveal"><div class="result-burst">${ok?'🎭✨':'⏰'}</div><h2>${ok?'اتعرفت! +3 نقاط':'الوقت خلص'}</h2><p class="notice">المطلوب كان: ${esc(charadeRound.word)}</p>${btn('اللاعب اللي بعده','charadeNext','green')}${btn('الألعاب','games','secondary')}</section>`);}

/* Quiz */
function renderQuizSetup(){playerSelector('startQuiz','صح ولا غلط','كل لاعب ياخد سؤال، والإجابة الصح بنقطة.');}
function startQuiz(){const ps=selectedPlayers(2);if(!ps)return;quizRound={players:shuffle(ps),index:0,used:[]};renderQuizQuestion();}
function renderQuizQuestion(){const p=quizRound.players[quizRound.index%quizRound.players.length];let q=sample(quizQuestions);while(quizRound.used.includes(q.q)&&quizRound.used.length<quizQuestions.length)q=sample(quizQuestions);quizRound.used.push(q.q);quizRound.player=p;quizRound.q=q;screen(`<section class="card reveal"><div class="avatar big">${avatar(p)}</div><h2>سؤال ${esc(p.name)}</h2><div class="quiz-box">${esc(q.q)}</div><div class="two-cols">${btn('✅ صح','quizTrue','green')}${btn('❌ غلط','quizFalse','pink')}</div></section>`);}
function answerQuiz(ans){const ok=ans===quizRound.q.a,s=stats(quizRound.player.id);s.played++;if(ok){s.quizCorrect++;s.points++;sound('success');}else sound('sad');quizRound.index++;screen(`<section class="card reveal"><div class="result-burst">${ok?'🎉':'🙈'}</div><h2>${ok?'إجابة صح!':'إجابة غلط'}</h2><p class="notice">الإجابة: <strong>${quizRound.q.a?'صح':'غلط'}</strong>${ok?'<br>+1 نقطة':''}</p>${btn('السؤال اللي بعده','quizNext','green')}${btn('الألعاب','games','secondary')}</section>`);}

function fileData(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});renderHome();
