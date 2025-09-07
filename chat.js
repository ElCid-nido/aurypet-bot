// Chat logic
const Fuse = window.Fuse;

const $ = (s, el=document) => el.querySelector(s);
const chat = $('#chat');
const inputForm = $('#inputForm');
const qInput = $('#q');
const leadForm = $('#leadForm');

let KB = [], BIZ = null, lastSubmitAt = 0;
const RATE_LIMIT_MS = 60000;

(async function bootstrap(){
  const [faq, biz] = await Promise.all([
    fetch('./faq.json', {cache:'no-store'}).then(r=>r.json()),
    fetch('./business.json', {cache:'no-store'}).then(r=>r.json())
  ]);
  KB = faq; BIZ = biz;
  renderBot('Ciao! Posso aiutarti con orari, indirizzo, contatti, reti per gatti, manutenzione acquari e dieta BARF. Prova: “rete per gatti balcone”.');
})();

function renderMsg(text, who='bot'){
  const wrap = document.createElement('div');
  wrap.className = `msg ${who==='user'?'user':'bot'}`;
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  wrap.appendChild(b);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function renderBot(text){ renderMsg(text, 'bot'); }

function renderAnswer(item){
  renderBot(item.a);
  const row = document.createElement('div');
  row.className = 'action-row';

  if(item.id==='indirizzo'){
    row.appendChild(actionBtn('Apri in Maps', ()=> window.open(BIZ.map_url,'_blank')));
    row.appendChild(actionBtn('Copia indirizzo', ()=> copyToClipboard(BIZ.address)));
  }
  if(item.id==='contatti'){
    row.appendChild(actionBtn('Chiama', ()=> window.open(`tel:${BIZ.phone.replace(/\s+/g,'')}`)));
    row.appendChild(actionBtn('Scrivi email', ()=> window.open(`mailto:${BIZ.email}`)));
  }
  if(item.id==='orari'){
    row.appendChild(actionBtn('Copia orari', ()=> copyToClipboard(item.a)));
  }
  if(row.children.length){
    chat.lastElementChild.appendChild(row);
  }
}

function actionBtn(label, onClick){
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'action';
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function copyToClipboard(text){
  navigator.clipboard?.writeText(text);
}

function search(q){
  const fuse = new Fuse(KB, {
    keys: ['q', 'a', 'category'],
    includeScore: true,
    threshold: 0.44,
    distance: 60,
    minMatchCharLength: 2
  });
  const norm = q.toLowerCase().trim();
  const direct = KB.find(x => x.id === norm);
  if (direct) return [direct];

  const res = fuse.search(norm).sort((a,b)=>a.score-b.score).slice(0,3).map(r=>r.item);
  if (res.length===0 && norm.includes(' ')) {
    const top = fuse.search(norm.split(' ').slice(0,3).join(' ')).slice(0,2).map(r=>r.item);
    return top;
  }
  return res;
}

function handleQuery(q){
  if(!q || !q.trim()) return;
  renderMsg(q.trim(), 'user');

  const hits = search(q);
  if(hits.length){
    const seen = new Set();
    hits.forEach(item => {
      if(!seen.has(item.id)) { renderAnswer(item); seen.add(item.id); }
    });
  } else {
    renderBot('Non ho trovato una risposta precisa. Vuoi inviare un messaggio? Compila il modulo qui sotto.');
  }
}

inputForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const val = qInput.value.slice(0,200);
  handleQuery(val);
  qInput.value = '';
});

document.querySelectorAll('[data-intent]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-intent');
    const item = KB.find(x=>x.id===id);
    if(item) renderAnswer(item);
  });
});

leadForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const now = Date.now();
  if (now - lastSubmitAt < RATE_LIMIT_MS) {
    return alert('Per favore attendi un minuto prima di un nuovo invio.');
  }
  const data = Object.fromEntries(new FormData(leadForm).entries());
  if (data.website) { return; }
  if (!data.consent) { return alert('Serve il consenso per inviare.'); }

  const payload = {
    business_name: BIZ.business_name,
    user_name: String(data.name||'').slice(0,80),
    user_email: String(data.email||'').slice(0,120),
    user_message: String(data.message||'').slice(0,1000),
    page_url: document.referrer || location.href
  };

  try{
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        service_id: "service_qvrbcr8",
        template_id: "template_s2cnccm",
        user_id: "6gIhjxivvS7THJVuB",
        template_params: payload
      })
    });
    if(!r.ok) throw new Error('EmailJS error');
    lastSubmitAt = now;
    alert('Grazie! Ti contatteremo al più presto.');
    leadForm.reset();
  }catch(err){
    alert('Invio non riuscito. Riprovare più tardi o usare i contatti diretti.');
  }
});
