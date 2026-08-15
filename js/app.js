// ============ آرزینو - نسخه اصلاح‌شده و پایدار ============
var DEFAULT_TOMAN = 187500;
var TOMAN = Number(localStorage.getItem('cachedTomanRate')) || DEFAULT_TOMAN;

function badge(t) {
  var el = document.getElementById('rateBadge');
  if (el) el.textContent = t;
}

function faNum(n) {
  return Number(n).toLocaleString('fa-IR');
}

function usdFmt(n) {
  n = Number(n);
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 4 : 2 });
}

function num(x) {
  if (typeof x === 'number') return isFinite(x) ? x : 0;
  if (typeof x === 'string') {
    var n = Number(String(x).replace(/,/g, ''));
    return isFinite(n) ? n : 0;
  }
  if (x && typeof x === 'object' && x.value !== undefined) {
    return num(x.value);
  }
  return 0;
}

function changeClass(ch) {
  ch = Number(ch) || 0;
  if (ch > 0) return 'up';
  if (ch < 0) return 'down';
  return '';
}

function changeText(ch) {
  ch = Number(ch) || 0;
  if (ch === 0) return '';
  var sign = ch > 0 ? '▲' : '▼';
  return sign + ' ' + faNum(Math.abs(ch));
}

// نرمال‌سازی هوشمند قیمت سکه (بعضی APIها بدون سه صفر آخر می‌فرستن)
function normalizeCoin(v) {
  v = num(v);
  if (v > 0 && v < 1000000) return v * 1000; // مثلاً 189500 → 189,500,000
  return v;
}

function card(name, priceHtml, changeVal) {
  return '<div class="card">' +
    '<div class="name">' + name + '</div>' +
    '<div>' +
      '<div class="price-ir">' + priceHtml + '</div>' +
      (changeVal ? '<div class="change ' + changeClass(changeVal) + '">' + changeText(changeVal) + '</div>' : '') +
    '</div>' +
  '</div>';
}

function cardUsd(name, usdPrice, tomanPrice, changePct) {
  return '<div class="card">' +
    '<div class="name">' + name + '</div>' +
    '<div>' +
      '<div class="price">' + usdFmt(usdPrice) + '</div>' +
      (tomanPrice ? '<div class="toman">' + faNum(Math.round(tomanPrice)) + ' تومان</div>' : '') +
      (changePct !== undefined && changePct !== null ?
        '<div class="change ' + changeClass(changePct) + '">' +
          (changePct > 0 ? '▲' : changePct < 0 ? '▼' : '') + ' ' +
          Math.abs(Number(changePct)).toFixed(2) + '%</div>' : '') +
    '</div>' +
  '</div>';
}

async function loadJSON(path) {
  try {
    var res = await fetch(path + '?t=' + Date.now());
    if (!res.ok) return null;
    var text = await res.text();
    // اگر HTML برگشته (خطای API) رد کن
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) return null;
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to load', path, e);
    return null;
  }
}

async function main() {
  badge('⏳ در حال دریافت نرخ‌ها...');

  var navasan = await loadJSON('data/navasan.json');
  var crypto  = await loadJSON('data/crypto.json');
  var xau     = await loadJSON('data/xau.json');
  var xag     = await loadJSON('data/xag.json');
  var xpt     = await loadJSON('data/xpt.json');
  var xpd     = await loadJSON('data/xpd.json');

  if (!navasan) {
    badge('❌ خطا در دریافت داده‌ها — چند دقیقه دیگر دوباره امتحان کنید');
    return;
  }

  // نرخ دلار آزاد
  var usdSell = num(navasan.usd_sell) || num(navasan.usd_usdt) || DEFAULT_TOMAN;
  TOMAN = usdSell;
  localStorage.setItem('cachedTomanRate', String(TOMAN));

  // ========== تیکر بالا ==========
  var sekkeh = normalizeCoin(navasan.sekkeh);
  var gold18 = num(navasan['18ayar']);

  var ticker = document.getElementById('ticker');
  if (ticker) {
    ticker.innerHTML =
      '<div class="tick"><span class="t-name">💵 دلار</span><span class="t-price">' + faNum(usdSell) + '</span></div>' +
      '<div class="tick"><span class="t-name">🪙 سکه</span><span class="t-price">' + faNum(sekkeh) + '</span></div>' +
      '<div class="tick"><span class="t-name">✨ طلا</span><span class="t-price">' + faNum(gold18) + '</span></div>';
  }


// ========== طلا و سکه — بازار تهران ==========
  var goldHtml = '';
  var goldItems = [
    { key: 'sekkeh',   name: 'سکه امامی',           normalize: true },
    { key: 'bahar',    name: 'سکه بهار آزادی',       normalize: true },
    { key: 'nim',      name: 'نیم سکه',              normalize: true },
    { key: 'rob',      name: 'ربع سکه',              normalize: true },
    { key: 'gerami',   name: 'سکه گرمی',             normalize: true },
    { key: '18ayar',   name: 'طلای ۱۸ عیار (گرم)',   normalize: false },
    { key: 'abshodeh', name: 'طلای آب‌شده (مثقال)',  normalize: false }
  ];

  goldItems.forEach(function (item) {
    var raw = navasan[item.key];
    if (!raw) return;
    var val = item.normalize ? normalizeCoin(raw) : num(raw);
    var ch  = (raw.change !== undefined) ? raw.change : 0;
    goldHtml += card(item.name, faNum(Math.round(val)) + ' تومان', ch);
  });

  document.getElementById('gold').innerHTML = goldHtml || '<div class="msg">داده‌ای موجود نیست</div>';

  // ========== ارزهای اصلی — بازار تهران ==========
  var fiatHtml = '';
  var fiatItems = [
    { key: 'usd_sell', name: 'دلار آمریکا (فروش)' },
    { key: 'usd_buy',  name: 'دلار آمریکا (خرید)' },
    { key: 'eur',      name: 'یورو' },
    { key: 'gbp',      name: 'پوند انگلیس' },
    { key: 'aed',      name: 'درهم امارات' },
    { key: 'try',      name: 'لیر ترکیه' },
    { key: 'cad',      name: 'دلار کانادا' },
    { key: 'aud',      name: 'دلار استرالیا' },
    { key: 'cny',      name: 'یوان چین' },
    { key: 'jpy',      name: 'ین ژاپن' }
  ];

  fiatItems.forEach(function (item) {
    var raw = navasan[item.key];
    if (!raw) return;
    var val = num(raw);
    var ch  = (raw.change !== undefined) ? raw.change : 0;
    fiatHtml += card(item.name, faNum(Math.round(val)) + ' تومان', ch);
  });

  document.getElementById('fiat').innerHTML = fiatHtml || '<div class="msg">داده‌ای موجود نیست</div>';

  // ========== سایر ارزهای جهان ==========
  var worldHtml = '';
  var worldItems = [
    { key: 'chf', name: 'فرانک سوئیس' },
    { key: 'sek', name: 'کرون سوئد' },
    { key: 'nok', name: 'کرون نروژ' },
    { key: 'dkk', name: 'کرون دانمارک' },
    { key: 'rub', name: 'روبل روسیه' },
    { key: 'inr', name: 'روپیه هند' },
    { key: 'pkr', name: 'روپیه پاکستان' },
    { key: 'afn', name: 'افغانی' },
    { key: 'iqd', name: 'دینار عراق' },
    { key: 'sar', name: 'ریال عربستان' },
    { key: 'qar', name: 'ریال قطر' },
    { key: 'kwd', name: 'دینار کویت' }
  ];

  worldItems.forEach(function (item) {
    var raw = navasan[item.key];
    if (!raw) return;
    var val = num(raw);
    if (val <= 0) return;
    var ch = (raw.change !== undefined) ? raw.change : 0;
    worldHtml += card(item.name, faNum(Math.round(val)) + ' تومان', ch);
  });

  document.getElementById('world').innerHTML = worldHtml || '<div class="msg">داده‌ای موجود نیست</div>';

  // ========== ارزهای دیجیتال ==========
  var cryptoHtml = '';
  if (crypto) {
    var cryptoMap = [
      { id: 'bitcoin',      name: 'بیت‌کوین (BTC)' },
      { id: 'ethereum',     name: 'اتریوم (ETH)' },
      { id: 'tether',       name: 'تتر (USDT)' },
      { id: 'binancecoin',  name: 'بایننس‌کوین (BNB)' },
      { id: 'solana',       name: 'سولانا (SOL)' },
      { id: 'ripple',       name: 'ریپل (XRP)' },
      { id: 'dogecoin',     name: 'دوج‌کوین (DOGE)' },
      { id: 'tron',         name: 'ترون (TRX)' },
      { id: 'cardano',      name: 'کاردانو (ADA)' },
      { id: 'chainlink',    name: 'چین‌لینک (LINK)' },
      { id: 'polkadot',     name: 'پولکادات (DOT)' },
      { id: 'litecoin',     name: 'لایت‌کوین (LTC)' },
      { id: 'avalanche-2',  name: 'آوالانچ (AVAX)' },
      { id: 'near',         name: 'نیر (NEAR)' },
      { id: 'uniswap',      name: 'یونی‌سواپ (UNI)' },
      { id: 'stellar',      name: 'استلار (XLM)' }
    ];

    cryptoMap.forEach(function (c) {
      var data = crypto[c.id];
      if (!data || !data.usd) return;
      var tomanPrice = data.usd * TOMAN;
      cryptoHtml += cardUsd(c.name, data.usd, tomanPrice, data.usd_24h_change);
    });
  }
 document.getElementById('crypto').innerHTML = cryptoHtml || '<div class="msg">داده‌ای موجود نیست</div>';

  // ========== فلزات گرانبها ==========
  var metalsHtml = '';
  var metals = [
    { data: xau, name: 'طلای جهانی (XAU)', unit: 'اونس' },
    { data: xag, name: 'نقره (XAG)',       unit: 'اونس' },
    { data: xpt, name: 'پلاتین (XPT)',     unit: 'اونس' },
    { data: xpd, name: 'پالادیوم (XPD)',   unit: 'اونس' }
  ];

  metals.forEach(function (m) {
    if (!m.data || !m.data.price) return;
    var usd   = Number(m.data.price);
    var toman = usd * TOMAN;
    metalsHtml += cardUsd(m.name + ' / ' + m.unit, usd, toman, null);
  });

  // نرخ داخلی فلزات از navasan
  if (navasan.xau && num(navasan.xau) > 0) {
    metalsHtml += card('طلای جهانی (نرخ داخلی)', faNum(Math.round(num(navasan.xau))) + ' تومان', navasan.xau.change);
  }
  if (navasan.xag && num(navasan.xag) > 0) {
    metalsHtml += card('نقره (نرخ داخلی)', faNum(Math.round(num(navasan.xag))) + ' تومان', navasan.xag.change);
  }

  document.getElementById('metals').innerHTML = metalsHtml || '<div class="msg">داده‌ای موجود نیست</div>';

  // ========== زمان ==========
  var now = new Date();
  var timeEl = document.getElementById('time');
  if (timeEl) {
    timeEl.textContent = 'آخرین به‌روزرسانی صفحه: ' + now.toLocaleString('fa-IR');
  }

  badge('✅ نرخ‌ها به‌روز شد • دلار: ' + faNum(usdSell) + ' تومان');
}

main().catch(function (err) {
  console.error(err);
  badge('❌ خطا در بارگذاری');
}); 
