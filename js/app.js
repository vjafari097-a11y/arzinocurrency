// ============ تنظیمات و ابزارها ============
var DEFAULT_TOMAN = 187500;
var TOMAN = Number(localStorage.getItem('cachedTomanRate')) || DEFAULT_TOMAN;

function badge(t){ document.getElementById('rateBadge').textContent = t; }
function faNum(n){ return Number(n).toLocaleString('fa-IR'); }
function faM(n){ return Number(n).toLocaleString('fa-IR', {maximumFractionDigits: 1}); }
function usdFmt(n){ return '$' + Number(n).toLocaleString('en-US', {maximumFractionDigits: n < 10 ? 4 : 2}); }
function num(x){
  if(typeof x === 'number') return isFinite(x) ? x : 0;
  if(typeof x === 'string'){ var n = Number(x.replace(/,/g,'')); return isFinite(n) ? n : 0; }
  return 0;
}
function getJSON(file){
  return fetch('data/' + file + '.json?t=' + Date.now()).then(function(r){
    if(!r.ok) throw new Error('net');
    return r.json();
  });
}

// ============ فهرست آیتم‌های بازار تهران (Navasan) ============
var GOLD = [
  ['sekkeh','🪙','سکه امامی (تمام)'],
  ['bahar','🪙','سکه بهار آزادی'],
  ['nim','🥇','نیم سکه'],
  ['rob','🥈','ربع سکه'],
  ['gerami','🏅','سکه گرمی'],
  ['18ayar','✨','طلای ۱۸ عیار (گرم)'],
  ['absodeh','⚗️','طلای آب‌شده (مثقال)']
];
var MAIN_FIAT = [
  ['usd_sell','💵','دلار (فروش)'],
  ['usd_buy','💵','دلار (خرید)'],
  ['usdt','💲','تتر'],
  ['eur','💶','یورو'],
  ['gbp','💷','پوند انگلیس'],
  ['try','💱','لیر ترکیه'],
  ['aed_sell','🛢️','درهم امارات'],
  ['sar','🕋','ریال سعودی'],
  ['iqd','🌴','دینار عراق'],
  ['afn','🪁','افغانی افغانستان'],
  ['pkr','🌙','روپیه پاکستان']
];
var WORLD_FIAT = [
  ['dirham_dubai','🏙️','درهم دبی'],
  ['qar','🏜️','ریال قطر'],
  ['omr','🗻','ریال عمان'],
  ['kwd','⛵','دینار کویت'],
  ['bhd','🐚','دینار بحرین'],
  ['jod','🏺','دینار اردن'],
  ['lbp','🌲','پوند لبنان'],
  ['syp','🌹','پوند سوریه'],
  ['cad_cash','🍁','دلار کانادا'],
  ['aud','🦘','دلار استرالیا'],
  ['chf','⌚','فرانک سوئیس'],
  ['jpy','🌸','ین ژاپن'],
  ['cny','🏮','یوان چین'],
  ['inr','🕌','روپیه هند'],
  ['rub','🪆','روبل روسیه'],
  ['kzt','🎪','تنگه قزاقستان'],
  ['azn','🔥','منات آذربایجان'],
  ['gel','🍇','لاری گرجستان'],
  ['amd','🍑','درام ارمنستان'],
  ['uzs','🧵','سوم ازبکستان'],
  ['tjs','👑','سامانی تاجیکستان'],
  ['tmt','🐎','منات ترکمنستان'],
  ['uah','🌻','هریونیا اوکراین'],
  ['sek','🧊','کرون سوئد'],
  ['nok','⛷️','کرون نروژ'],
  ['dkk','🧜','کرون دانمارک'],
  ['pln','🦅','زواتی لهستان'],
  ['czk','🏰','کرون چک'],
  ['huf','🌶️','فورینت مجارستان'],
  ['bgn','🌹','لئو بلغارستان'],
  ['rsd','🎺','دینار صربستان'],
  ['zar','🦁','راند آفریقای جنوبی'],
  ['kes','🦒','شیلینگ کنیا'],
  ['brl','🦜','رئال برزیل'],
  ['mxn','🌮','پزوی مکزیک'],
  ['krw','🎎','وان کره جنوبی'],
  ['thb','🐘','بات تایلند'],
  ['vnd','🍜','دونگ ویتنام'],
  ['idr','🌋','روپیه اندونزی'],
  ['php','🥭','پزوی فیلیپین'],
  ['myr','🌴','رینگیت مالزی'],
  ['sgd','🦭','دلار سنگاپور'],
  ['nzd','🥝','دلار نیوزلند']
];
var CRYPTOS = [
  ['bitcoin','₿','بیت‌کوین'],
  ['ethereum','Ξ','اتریوم'],
  ['tether','💲','تتر'],
  ['binancecoin','🔶','بایننس کوین'],
  ['solana','◎','سولانا'],
  ['ripple','✕','ریپل'],
  ['dogecoin','🐕','دوج‌کوین'],
  ['tron','🔴','ترون'],
  ['cardano','🔵','کاردانو'],
  ['avalanche-2','🔺','آوالانچ'],
  ['chainlink','🔗','چین‌لینک'],
  ['polkadot','⚫','پالکادات'],
  ['matic-network','🟣','پالیگان'],
  ['litecoin','Ł','لایت‌کوین'],
  ['bitcoin-cash','🟢','بیت‌کوین کش'],
  ['near','⚡','نیر پروتکل'],
  ['uniswap','🦄','یونی‌سواپ'],
  ['stellar','✨','استلار']
];
var METALS = [
  ['XAU','🥇','طلا (انس)'],
  ['XAG','🥈','نقره (انس)'],
  ['XPT','⚪','پلاتین (انس)'],
  ['XPD','🌑','پالادیوم (انس)']
];

// ============ ضریب تبدیل هر کلید به تومان واقعی ============
var MULTIPLIERS = {
  'sekkeh': 100,
  'bahar': 100,
  'nim': 100,
  'rob': 100,
  'gerami': 1000,
  'absodeh': 1000,
  '18ayar': 1
};

// ============ خواندن داده Navasan ============
function navItem(j, key){
  var it = j && j[key];
  if(!it) return null;
  var v = num(it.value);
  if(v <= 0) return null;
  v = v * (MULTIPLIERS[key] || 1);
  return {value: v, change: num(it.change)};
}
function pctOf(info){
  var prev = info.value - info.change;
  if(prev <= 0) return 0;
  return (info.change / prev) * 100;
}

// ============ دریافت کریپتو و فلزات ============
function fetchCrypto(){ return getJSON('crypto'); }
function fetchMetals(){
  var ps = METALS.map(function(m){
    return getJSON(m[0].toLowerCase())
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
function priceText(v){
  if(v >= 1000000) return faM(v / 1000000) + ' میلیون تومان';
  return faNum(v) + ' تومان';
}
function iranCard(icon, name, info){
  return '<div class="card"><div class="name">' + icon + ' ' + name + '</div>' +
    '<div><div class="price-ir">' + priceText(info.value) + '</div>' + changeHtml(pctOf(info)) + '</div></div>';
}
function cryptoCard(icon, name, usd, change){
  return '<div class="card"><div class="name">' + icon + ' ' + name + '</div>' +
    '<div><div class="price">' + usdFmt(usd) + '</div>' +
    '<div class="toman">' + faNum(Math.round(usd * TOMAN)) + ' تومان</div>' + changeHtml(change) + '</div></div>';
}
function metalCard(icon, name, usd){
  return '<div class="card"><div class="name">' + icon + ' ' + name + '</div>' +
    '<div><div class="price">' + usdFmt(usd) + '</div>' +
    '<div class="toman">' + faNum(Math.round(usd * TOMAN)) + ' تومان</div></div></div>';
}
function tick(name, info){
  if(!info) return '';
  var t = (info.value >= 1000000) ? (faM(info.value / 1000000) + ' میلیون') : faNum(info.value);
  return '<div class="tick"><span class="t-name">' + name + '</span><span class="t-price">' + t + '</span></div>';
}
function renderList(list, data){
  var h = '';
  list.forEach(function(it){
    var info = navItem(data, it[0]);
    if(info) h += iranCard(it[1], it[2], info);
  });
  return h;
}
function setSection(el, html, key){
  if(html){ el.innerHTML = html; localStorage.setItem('cache_' + key, html); }
  else if(!localStorage.getItem('cache_' + key)) el.innerHTML = '<div class="msg">دریافت قیمت این بخش ممکن نشد</div>';
}

// ============ تابع اصلی ============
async function loadAll(){
  var g = document.getElementById('gold');
  var f = document.getElementById('fiat');
  var w = document.getElementById('world');
  var c = document.getElementById('crypto');
  var m = document.getElementById('metals');

  [['gold',g],['fiat',f],['world',w],['crypto',c],['metals',m]].forEach(function(p){
    var cache = localStorage.getItem('cache_' + p[0]);
    if(cache) p[1].innerHTML = cache;
  });
  var tcache = localStorage.getItem('cache_ticker');
  if(tcache) document.getElementById('ticker').innerHTML = tcache;

  badge('⏳ در حال دریافت نرخ‌ها...');

  var res = await Promise.allSettled([getJSON('navasan'), fetchCrypto(), fetchMetals()]);
  var nav = res[0].status === 'fulfilled' ? res[0].value : {};
  var crypto = res[1].status === 'fulfilled' ? res[1].value : null;
  var metals = res[2].status === 'fulfilled' ? res[2].value : {};

  // ---- دلار هوشمند ----
  var d = navItem(nav,'usd_sell') || navItem(nav,'usd_buy') || navItem(nav,'usd_usdt');
  if(d && d.value > 1000){
    TOMAN = d.value;
    localStorage.setItem('cachedTomanRate', TOMAN);
    badge('🟢 دلار: ' + faNum(TOMAN) + ' تومان');
  } else if(TOMAN > 1000){
    badge('🟡 دلار: ' + faNum(TOMAN) + ' تومان');
  } else {
    badge('🟡 دلار: نرخ پشتیبان');
  }

// ---- بخش‌ها ----
  setSection(g, renderList(GOLD, nav), 'gold');
  setSection(f, renderList(MAIN_FIAT, nav), 'fiat');
  setSection(w, renderList(WORLD_FIAT, nav), 'world');

  var chh = '';
  if(crypto){ CRYPTOS.forEach(function(cc){ var info = crypto[cc[0]]; if(info) chh += cryptoCard(cc[1], cc[2], info.usd, info.usd_24h_change); }); }
  setSection(c, chh, 'crypto');

  var mh = '';
  METALS.forEach(function(mt){ if(metals[mt[0]]) mh += metalCard(mt[1], mt[2], metals[mt[0]]); });
  setSection(m, mh, 'metals');

  // ---- نوار بالا ----
  var th = tick('💵 دلار', navItem(nav,'usd_sell')) + tick('🪙 سکه', navItem(nav,'sekkeh')) + tick('✨ طلا', navItem(nav,'18ayar'));
  if(th){ document.getElementById('ticker').innerHTML = th; localStorage.setItem('cache_ticker', th); }

  document.getElementById('time').textContent = 'آخرین به‌روزرسانی: ' + new Date().toLocaleTimeString('fa-IR');
}

loadAll();
setInterval(loadAll, 60000);
