// ============ تنظیمات و ابزارها ============
var DEFAULT_TOMAN = 187500;
var TOMAN = Number(localStorage.getItem('cachedTomanRate')) || DEFAULT_TOMAN;

function badge(t){ document.getElementById('rateBadge').textContent = t; }
function faNum(n){ return Number(n).toLocaleString('fa-IR'); }
function usdFmt(n){ return '$' + Number(n).toLocaleString('en-US', {maximumFractionDigits: n < 10 ? 4 : 2}); }
function num(x){
  if(typeof x === 'number') return isFinite(x) ? x : 0;
  if(typeof x === 'string'){ var n = Number(x.replace(/,/g,'')); return isFinite(n) ? n : 0; }
  return 0;
}

// ============ فهرست داده‌ها ============
var IRAN_GOLD = [
  ['sekkeh','🪙','سکه امامی (تمام)'],
  ['nims','🥇','نیم سکه'],
  ['robs','🥈','ربع سکه'],
  ['mesghal','⚖️','مثقال طلا'],
  ['gold18','✨','طلای ۱۸ عیار (گرم)']
];
var IRAN_FIAT = [
  ['usd','💵','دلار آمریکا'],
  ['eur','💶','یورو'],
  ['gbp','💷','پوند انگلیس'],
  ['try','💱','لیر ترکیه'],
  ['aed','🛢️','درهم امارات']
];
var CRYPTOS = [
  ['bitcoin','₿','بیت‌کوین'],
  ['ethereum','Ξ','اتریوم'],
  ['tether','💲','تتر'],
  ['binancecoin','🔶','بایننس کوین'],
  ['solana','◎','سولانا'],
  ['ripple','✕','ریپل'],
  ['dogecoin','🐕','دوج‌کوین'],
  ['tron','🔴','ترون']
];
var METALS = [
  ['XAU','🥇','طلا (انس)'],
  ['XAG','🥈','نقره (انس)'],
  ['XPT','⚪','پلاتین (انس)'],
  ['XPD','🌑','پالادیوم (انس)']
];

var KNOWN = {};
IRAN_GOLD.concat(IRAN_FIAT).forEach(function(i){ KNOWN[i[0]] = true; });

var TITLE = {
  'دلار آمریکا':'usd','دلار':'usd','یورو':'eur','پوند انگلیس':'gbp',
  'لیر ترکیه':'try','درهم امارات':'aed','سکه امامی':'sekkeh',
  'سکه تمام بهار امامی':'sekkeh','نیم سکه':'nims','ربع سکه':'robs',
  'مثقال طلا':'mesghal','طلای ۱۸ عیار':'gold18','طلای 18 عیار':'gold18'
};

var PROXIES = [
  function(u){ return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
  function(u){ return 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(u); }
];

function proxyFetch(url){
  var ps = PROXIES.map(function(p){
    return fetch(p(url)).then(function(r){
      if(!r.ok) throw new Error('net');
      return r.json();
    });
  });
  return Promise.any(ps);
}

// ============ دریافت داده‌ها ============
function parseIran(j){
  var out = {};
  try{
    var d = j && j.data;
    var arr = [];
    if(Array.isArray(d)) arr = d;
    else if(d && typeof d === 'object'){
      for(var k in d){ if(d[k] && typeof d[k] === 'object') arr.push(d[k]); }
    }
    for(var i=0;i<arr.length;i++){
      var it = arr[i] || {};
      var raw = (it.id || it.symbol || '').toString().toLowerCase();
      var key = KNOWN[raw] ? raw : (TITLE[(it.title || it.name || '').toString().trim()] || raw);
      var price = num(it.price);
      var ch = num(it.percent_change != null ? it.percent_change : it.change_percent);
      if(key && price > 0) out[key] = {price: price, change: ch};
    }
  }catch(e){}
  return out;
}

function fetchIran(){
  var names = IRAN_GOLD.concat(IRAN_FIAT).map(function(i){ return i[0]; }).join(',');
  return proxyFetch('https://api.tgju.org/v1/market/indicator/summary-parameter-data?name=' + names).then(parseIran);
}

function fetchBonbast(){
  return proxyFetch('https://bonbast.com/json/').then(function(j){
    if(j && j.usd && j.usd.sell) return num(j.usd.sell);
    if(j && j.usd && j.usd.buy) return num(j.usd.buy);
    return 0;
  });
}

function fetchCrypto(){
  var ids = CRYPTOS.map(function(c){ return c[0]; }).join(',');
  return fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd&include_24hr_change=true')
    .then(function(r){ if(!r.ok) throw new Error('net'); return r.json(); });
}

function fetchMetals(){
  var ps = METALS.map(function(m){
    return fetch('https://api.gold-api.com/price/' + m[0])
      .then(function(r){ if(!r.ok) throw new Error('net'); return r.json(); })
.then(function(j){ return {sym: m[0], price: num(j.price)}; })
      .catch(function(){ return null; });
  });
  return Promise.all(ps).then(function(rs){
    var out = {};
    rs.forEach(function(r){ if(r && r.price > 0) out[r.sym] = r.price; });
    return out;
  });
}

// ============ ساخت کارت‌ها ============
function changeHtml(ch){
  if(typeof ch !== 'number' || isNaN(ch) || ch === 0) return '';
  var cls = ch >= 0 ? 'up' : 'down';
  return '<div class="change ' + cls + '">' + (ch >= 0 ? '▲' : '▼') + ' ' + Math.abs(ch).toFixed(2) + '%</div>';
}
function iranCard(icon, name, info){
  return '<div class="card"><div class="name">' + icon + ' ' + name + '</div>' +
    '<div class="price-ir">' + faNum(info.price) + ' تومان</div>' + changeHtml(info.change) + '</div>';
}
function cryptoCard(icon, name, usd, change){
  return '<div class="card"><div class="name">' + icon + ' ' + name + '</div>' +
    '<div class="price">' + usdFmt(usd) + '</div>' +
    '<div class="toman">' + faNum(Math.round(usd * TOMAN)) + ' تومان</div>' + changeHtml(change) + '</div>';
}
function metalCard(icon, name, usd){
  return '<div class="card"><div class="name">' + icon + ' ' + name + '</div>' +
    '<div class="price">' + usdFmt(usd) + '</div>' +
    '<div class="toman">' + faNum(Math.round(usd * TOMAN)) + ' تومان</div></div>';
}
function tick(name, info){
  if(!info) return '';
  return '<div class="tick"><span class="t-name">' + name + '</span><span class="t-price">' + faNum(info.price) + ' تومان</span></div>';
}

// ============ تابع اصلی ============
async function loadAll(){
  var g = document.getElementById('gold');
  var f = document.getElementById('fiat');
  var c = document.getElementById('crypto');
  var m = document.getElementById('metals');

  [['gold',g],['fiat',f],['crypto',c],['metals',m]].forEach(function(p){
    var cache = localStorage.getItem('cache_' + p[0]);
    if(cache) p[1].innerHTML = cache;
  });
  var tcache = localStorage.getItem('cache_ticker');
  if(tcache) document.getElementById('ticker').innerHTML = tcache;

  badge('⏳ در حال دریافت نرخ‌ها...');

  var res = await Promise.allSettled([fetchIran(), fetchCrypto(), fetchMetals()]);
  var iran = res[0].status === 'fulfilled' ? res[0].value : {};
  var crypto = res[1].status === 'fulfilled' ? res[1].value : null;
  var metals = res[2].status === 'fulfilled' ? res[2].value : {};

  // ---- دلار هوشمند ----
  var srcName = '';
  if(iran.usd && iran.usd.price > 1000){ TOMAN = iran.usd.price; srcName = 'TGJU'; }
  else {
    try { var b = await fetchBonbast(); if(b > 1000){ TOMAN = b; srcName = 'بنبست'; } } catch(e){}
  }
  if(srcName){
    localStorage.setItem('cachedTomanRate', TOMAN);
    badge('🟢 دلار: ' + faNum(TOMAN) + ' تومان — خودکار از ' + srcName);
  } else if(TOMAN > 1000){
    badge('🟡 دلار: ' + faNum(TOMAN) + ' تومان — آخرین نرخ دریافتی');
  } else {
    badge('🟡 دلار: نرخ پشتیبان');
  }

  // ---- طلا و سکه ----
  var gh = '';
  IRAN_GOLD.forEach(function(it){ if(iran[it[0]]) gh += iranCard(it[1], it[2], iran[it[0]]); });
  if(gh){ g.innerHTML = gh; localStorage.setItem('cache_gold', gh); }
  else if(!localStorage.getItem('cache_gold')) g.innerHTML = '<div class="msg">دریافت قیمت طلا و سکه ممکن نشد</div>';

  // ---- ارزها ----
  var fh = '';
  IRAN_FIAT.forEach(function(it){ if(iran[it[0]]) fh += iranCard(it[1], it[2], iran[it[0]]); });
  if(fh){ f.innerHTML = fh; localStorage.setItem('cache_fiat', fh); }
  else if(!localStorage.getItem('cache_fiat')) f.innerHTML = '<div class="msg">دریافت قیمت ارزها ممکن نشد</div>';

  // ---- کریپتو ----
  var chh = '';
  if(crypto){ CRYPTOS.forEach(function(cc){ var info = crypto[cc[0]]; if(info) chh += cryptoCard(cc[1], cc[2], info.usd, info.usd_24h_change); }); }
  if(chh){ c.innerHTML = chh; localStorage.setItem('cache_crypto', chh); }
  else if(!localStorage.getItem('cache_crypto')) c.innerHTML = '<div class="msg">دریافت قیمت کریپتو ممکن نشد</div>';

// ---- فلزات ----
  var mh = '';
  METALS.forEach(function(mt){ if(metals[mt[0]]) mh += metalCard(mt[1], mt[2], metals[mt[0]]); });
  if(mh){ m.innerHTML = mh; localStorage.setItem('cache_metals', mh); }
  else if(!localStorage.getItem('cache_metals')) m.innerHTML = '<div class="msg">دریافت قیمت فلزات ممکن نشد</div>';

  // ---- نوار بالا ----
  var th = tick('💵 دلار', iran.usd) + tick('🪙 سکه امامی', iran.sekkeh) + tick('✨ طلای ۱۸ عیار', iran.gold18);
  if(th){ document.getElementById('ticker').innerHTML = th; localStorage.setItem('cache_ticker', th); }

  document.getElementById('time').textContent = 'آخرین به‌روزرسانی: ' + new Date().toLocaleTimeString('fa-IR');
}

loadAll();
setInterval(loadAll, 60000);
