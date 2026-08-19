// ============ آرزینو - نسخه کامل + Nobitex Crypto ============

var DEFAULT_TOMAN = 187500;
var TOMAN = Number(localStorage.getItem('cachedTomanRate')) || DEFAULT_TOMAN;
var CACHE_KEY = 'arzino_last_data';
var RATES = {};

function badge(t) {
  var el = document.getElementById('rateBadge');
  if (el) el.textContent = t;
}

function faNum(n) {
  return Number(n).toLocaleString('fa-IR');
}

function usdFmt(n) {
  n = Number(n);

  return '$' + n.toLocaleString('en-US', {
    maximumFractionDigits: n < 10 ? 4 : 2
  });
}

function num(x) {

  if (typeof x === 'number') {
    return isFinite(x) ? x : 0;
  }

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

function normalizeCoin(v) {

  v = num(v);

  if (v > 0 && v < 1000000) {
    return v * 1000;
  }

  return v;
}

function card(name, priceHtml, changeVal) {

  return '<div class="card" data-name="' + name + '">' +
    '<div class="name">' + name + '</div>' +
    '<div>' +
      '<div class="price-ir">' + priceHtml + '</div>' +
      (changeVal ?
        '<div class="change ' + changeClass(changeVal) + '">' +
          changeText(changeVal) +
        '</div>' : '') +
    '</div>' +
  '</div>';
}

function cardUsd(name, usdPrice, tomanPrice, changePct) {

  return '<div class="card" data-name="' + name + '">' +
    '<div class="name">' + name + '</div>' +
    '<div>' +
      '<div class="price">' + usdFmt(usdPrice) + '</div>' +
      (tomanPrice ?
        '<div class="toman">' +
          faNum(Math.round(tomanPrice)) +
          ' تومان</div>' : '') +
      (changePct !== undefined && changePct !== null ?
        '<div class="change ' + changeClass(changePct) + '">' +
          (changePct > 0 ? '▲' : changePct < 0 ? '▼' : '') +
          ' ' +
          Math.abs(Number(changePct)).toFixed(2) +
          '%' +
        '</div>' : '') +
    '</div>' +
  '</div>';
}
function updateConverter() {
  var amountEl = document.getElementById('convAmount');
  var fromEl = document.getElementById('convFrom');
  var resultEl = document.getElementById('convResult');

  if (!amountEl || !fromEl || !resultEl) return;

  var amount = Number(amountEl.value) || 0;
  var from = fromEl.value;
  var rate = RATES[from];

  if (!from || !rate || rate <= 0) {
    resultEl.textContent = 'نرخ موجود نیست';
    return;
  }

  if (from === 'toman') {
    var usd = amount / (RATES.usd || TOMAN);

    resultEl.textContent =
      faNum(amount) +
      ' تومان ≈ ' +
      usdFmt(usd) +
      ' دلار';
  } else {
    var toman = amount * rate;

    resultEl.textContent =
      faNum(amount) +
      ' ≈ ' +
      faNum(Math.round(toman)) +
      ' تومان';
  }
}


function setupConverter() {
  var amountEl = document.getElementById('convAmount');
  var fromEl = document.getElementById('convFrom');

  if (!fromEl) return;

  var labels = {
    usd: 'دلار آمریکا',
    eur: 'یورو',
    gbp: 'پوند انگلیس',
    aed: 'درهم امارات',
    try: 'لیر ترکیه',
    cad: 'دلار کانادا',
    aud: 'دلار استرالیا',
    cny: 'یوان چین',
    jpy: 'ین ژاپن',

    sekkeh: 'سکه امامی',
    bahar: 'سکه بهار آزادی',
    nim: 'نیم سکه',
    rob: 'ربع سکه',
    gerami: 'سکه گرمی',

    '18ayar': 'طلای ۱۸ عیار (گرم)',
    abshodeh: 'طلای آب‌شده (مثقال)',

    chf: 'فرانک سوئیس',
    sek: 'کرون سوئد',
    nok: 'کرون نروژ',
    dkk: 'کرون دانمارک',
    rub: 'روبل روسیه',
    inr: 'روپیه هند',
    pkr: 'روپیه پاکستان',
    afn: 'افغانی',
    iqd: 'دینار عراق',
    sar: 'ریال عربستان',
    qar: 'ریال قطر',
    kwd: 'دینار کویت',

    nzd: 'دلار نیوزیلند',
    sgd: 'دلار سنگاپور',
    hkd: 'دلار هنگ‌کنگ',
    myr: 'رینگیت مالزی',
    thb: 'بات تایلند',
    krw: 'وون کره جنوبی',

    mxn: 'پزو مکزیک',
    brl: 'رئال برزیل',
    zar: 'راند آفریقای جنوبی',
    egp: 'پوند مصر',
    syp: 'لیر سوریه',

    azn: 'منات آذربایجان',
    gel: 'لاری گرجستان',
    amd: 'درام ارمنستان',
    ils: 'شِکِل اسرائیل',

    pln: 'زلوتی لهستان',
    czk: 'کرون چک',
    huf: 'فورینت مجارستان',
    ron: 'لئو رومانی',

    jod: 'دینار اردن',
    omr: 'ریال عمان',
    bhd: 'دینار بحرین',
    tnd: 'دینار تونس',
    mad: 'درهم مراکش',

    dzd: 'دینار الجزایر',
    lbp: 'لیر لبنان',
    yer: 'ریال یمن',

    twd: 'دلار تایوان',
    php: 'پزو فیلیپین',
    idr: 'روپیه اندونزی',
    vnd: 'دانگ ویتنام',

    uah: 'هریونیا اوکراین',
    kzt: 'تنگه قزاقستان',
    uzs: 'سوم ازبکستان',
    tmt: 'منات ترکمنستان',
    tjs: 'سامانی تاجیکستان',
    kgs: 'سوم قرقیزستان',

    toman: 'تومان'
  };

  var priority = [
    'usd',
    'eur',
    'gbp',
    'aed',
    'try',
    'cad',
    'aud',
    'cny',
    'jpy',

    'chf',
    'sek',
    'nok',
    'dkk',
    'rub',
    'inr',
    'pkr',
    'afn',
    'iqd',

    'sar',
    'qar',
    'kwd',
    'nzd',
    'sgd',
    'hkd',
    'myr',
    'thb',
    'krw',

    'mxn',
    'brl',
    'zar',
    'egp',
    'syp',
    'azn',
    'gel',
    'amd',
    'ils',

    'pln',
    'czk',
    'huf',
    'ron',
    'jod',
    'omr',
    'bhd',
    'tnd',
    'mad',

    'dzd',
    'lbp',
    'yer',
    'twd',
    'php',
    'idr',
    'vnd',
    'uah',
    'kzt',

    'uzs',
    'tmt',
    'tjs',
    'kgs',

    'toman',

    'sekkeh',
    'bahar',
    'nim',
    'rob',
    'gerami',
    '18ayar',
    'abshodeh'
  ];

  var options = [];
  var used = {};

  priority.forEach(function (key) {

    if (RATES[key] && RATES[key] > 0 && !used[key]) {

      options.push(
        '<option value="' +
        key +
        '">' +
        (labels[key] || key) +
        '</option>'
      );

      used[key] = true;
    }
  });

  Object.keys(RATES).forEach(function (key) {

    if (!used[key] && RATES[key] > 0) {

      options.push(
        '<option value="' +
        key +
        '">' +
        (labels[key] || key) +
        '</option>'
      );

      used[key] = true;
    }
  });

  fromEl.innerHTML =
    options.join('') ||
    '<option value="">نرخی موجود نیست</option>';

  if (amountEl) {
    amountEl.oninput = updateConverter;
  }
fromEl.onchange = updateConverter;

  updateConverter();
}


function setupSearch() {
  var input = document.getElementById('searchInput');

  if (!input) return;

  input.oninput = function () {

    var q =
      (input.value || '')
      .trim()
      .toLowerCase();

    var cards =
      document.querySelectorAll('.card');

    for (var i = 0; i < cards.length; i++) {

      var c = cards[i];

      var name =
        c.getAttribute('data-name') || '';

      if (!name) {

        var nameEl =
          c.querySelector('.name');

        name =
          nameEl ?
          nameEl.textContent :
          '';
      }

      name = name.toLowerCase();

      c.style.display =
        (!q || name.indexOf(q) !== -1)
        ? ''
        : 'none';
    }
  };
}
async function loadStats(navasan) {
  var usdtEl = document.getElementById('statUsdt');
  var domEl = document.getElementById('statDom');
  var fearEl = document.getElementById('statFear');
  var mcapEl = document.getElementById('statMcap');

  if (usdtEl) {
    var usdt =
      num(navasan.usd_usdt) ||
      num(navasan.usd_sell) ||
      TOMAN;

    usdtEl.textContent =
      faNum(Math.round(usdt));
  }

  // اطلاعات کلی بازار کریپتو
  try {
    var gRes =
      await fetch(
        'https://api.coingecko.com/api/v3/global'
      );

    if (gRes.ok) {
      var g = await gRes.json();
      var data = g.data || {};

      if (
        domEl &&
        data.market_cap_percentage &&
        data.market_cap_percentage.btc
      ) {
        domEl.textContent =
          data.market_cap_percentage.btc.toFixed(1) +
          '%';
      }

      if (
        mcapEl &&
        data.total_market_cap &&
        data.total_market_cap.usd
      ) {
        var mcap =
          data.total_market_cap.usd;

        if (mcap >= 1e12) {
          mcapEl.textContent =
            (mcap / 1e12).toFixed(2) +
            'T$';

        } else if (mcap >= 1e9) {
          mcapEl.textContent =
            (mcap / 1e9).toFixed(1) +
            'B$';

        } else {
          mcapEl.textContent =
            faNum(Math.round(mcap));
        }
      }
    }
  } catch (e) {}


  // شاخص ترس و طمع
  try {
    var fRes =
      await fetch(
        'https://api.alternative.me/fng/?limit=1'
      );

    if (fRes.ok) {
      var f = await fRes.json();

      if (
        fearEl &&
        f.data &&
        f.data[0]
      ) {
        fearEl.textContent =
          f.data[0].value +
          ' / ' +
          f.data[0].value_classification;
      }
    }
  } catch (e) {}
}


/*
========================================================
ساخت قیمت‌ها
TGJU / Navasan برای ارز و طلا
Nobitex برای کریپتو
========================================================
*/

function renderAll(
  navasan,
  crypto,
  nobitex,
  xau,
  xag,
  xpt,
  xpd,
  isCache
) {

  if (!navasan) return false;

  // -----------------------------
  // دلار
  // -----------------------------

  var usdSell =
    num(navasan.usd_sell) ||
    num(navasan.usd_usdt) ||
    DEFAULT_TOMAN;

  TOMAN = usdSell;

  localStorage.setItem(
    'cachedTomanRate',
    String(TOMAN)
  );


  // -----------------------------
  // نرخ‌های مبدل
  // -----------------------------

  RATES = {

    usd:
      num(navasan.usd_sell) ||
      usdSell,

    eur: num(navasan.eur),
    gbp: num(navasan.gbp),
    aed: num(navasan.aed),
    try: num(navasan.try),
    cad: num(navasan.cad),
    aud: num(navasan.aud),
    cny: num(navasan.cny),
    jpy: num(navasan.jpy),

    sekkeh:
      normalizeCoin(navasan.sekkeh),

    bahar:
      normalizeCoin(navasan.bahar),

    nim:
      normalizeCoin(navasan.nim),

    rob:
      normalizeCoin(navasan.rob),

    gerami:
      normalizeCoin(navasan.gerami),

    '18ayar':
      num(navasan['18ayar']),

    abshodeh:
      num(navasan.abshodeh),

    chf: num(navasan.chf),
    sek: num(navasan.sek),
    nok: num(navasan.nok),
    dkk: num(navasan.dkk),
    rub: num(navasan.rub),
    inr: num(navasan.inr),
    pkr: num(navasan.pkr),
    afn: num(navasan.afn),
    iqd: num(navasan.iqd),
    sar: num(navasan.sar),
    qar: num(navasan.qar),
    kwd: num(navasan.kwd),
    nzd: num(navasan.nzd),
    sgd: num(navasan.sgd),
    hkd: num(navasan.hkd),
    myr: num(navasan.myr),
    thb: num(navasan.thb),
    krw: num(navasan.krw),
    mxn: num(navasan.mxn),
    brl: num(navasan.brl),
    zar: num(navasan.zar),
    egp: num(navasan.egp),
    syp: num(navasan.syp),
    azn: num(navasan.azn),
    gel: num(navasan.gel),
    amd: num(navasan.amd),
    ils: num(navasan.ils),
    pln: num(navasan.pln),
czk: num(navasan.czk),
    huf: num(navasan.huf),
    ron: num(navasan.ron),
    jod: num(navasan.jod),
    omr: num(navasan.omr),
    bhd: num(navasan.bhd),
    tnd: num(navasan.tnd),
    mad: num(navasan.mad),
    dzd: num(navasan.dzd),
    lbp: num(navasan.lbp),
    yer: num(navasan.yer),
    twd: num(navasan.twd),
    php: num(navasan.php),
    idr: num(navasan.idr),
    vnd: num(navasan.vnd),
    uah: num(navasan.uah),
    kzt: num(navasan.kzt),
    uzs: num(navasan.uzs),
    tmt: num(navasan.tmt),
    tjs: num(navasan.tjs),
    kgs: num(navasan.kgs),

    toman: 1
  };


  // -----------------------------
  // نوار بالای سایت
  // -----------------------------

  var sekkeh =
    normalizeCoin(navasan.sekkeh);

  var gold18 =
    num(navasan['18ayar']);

  var ticker =
    document.getElementById('ticker');

  if (ticker) {

    ticker.innerHTML =

      '<div class="tick">' +
        '<span class="t-name">💵 دلار</span>' +
        '<span class="t-price">' +
          faNum(usdSell) +
        '</span>' +
      '</div>' +

      '<div class="tick">' +
        '<span class="t-name">🪙 سکه</span>' +
        '<span class="t-price">' +
          faNum(sekkeh) +
        '</span>' +
      '</div>' +

      '<div class="tick">' +
        '<span class="t-name">✨ طلا</span>' +
        '<span class="t-price">' +
          faNum(gold18) +
        '</span>' +
      '</div>';
  }


  // آمار بازار
  loadStats(navasan);
// =========================================================
  // طلا و سکه
  // =========================================================

  var goldHtml = '';

  var goldItems = [
    { key: 'sekkeh', name: 'سکه امامی', normalize: true },
    { key: 'bahar', name: 'سکه بهار آزادی', normalize: true },
    { key: 'nim', name: 'نیم سکه', normalize: true },
    { key: 'rob', name: 'ربع سکه', normalize: true },
    { key: 'gerami', name: 'سکه گرمی', normalize: true },
    { key: '18ayar', name: 'طلای ۱۸ عیار (گرم)', normalize: false },
    { key: 'abshodeh', name: 'طلای آب‌شده (مثقال)', normalize: false }
  ];

  goldItems.forEach(function (item) {

    var raw = navasan[item.key];

    if (!raw) return;

    var val =
      item.normalize
        ? normalizeCoin(raw)
        : num(raw);

    var ch =
      (raw.change !== undefined)
        ? raw.change
        : 0;

    goldHtml +=
      card(
        item.name,
        faNum(Math.round(val)) + ' تومان',
        ch
      );
  });

  var goldEl = document.getElementById('gold');

  if (goldEl) {
    goldEl.innerHTML =
      goldHtml ||
      '<div class="msg">داده‌ای موجود نیست</div>';
  }


  // =========================================================
  // ارزهای اصلی
  // =========================================================

  var fiatHtml = '';

  var fiatItems = [
    {
      key: 'usd_sell',
      name: 'دلار آمریکا (فروش)'
    },
    {
      key: 'usd_buy',
      name: 'دلار آمریکا (خرید)'
    },
    {
      key: 'eur',
      name: 'یورو'
    },
    {
      key: 'gbp',
      name: 'پوند انگلیس'
    },
    {
      key: 'aed',
      name: 'درهم امارات'
    },
    {
      key: 'try',
      name: 'لیر ترکیه'
    },
    {
      key: 'cad',
      name: 'دلار کانادا'
    },
    {
      key: 'aud',
      name: 'دلار استرالیا'
    },
    {
      key: 'cny',
      name: 'یوان چین'
    },
    {
      key: 'jpy',
      name: 'ین ژاپن'
    }
  ];

  fiatItems.forEach(function (item) {

    var raw = navasan[item.key];

    if (!raw) return;

    var val = num(raw);

    var ch =
      (raw.change !== undefined)
        ? raw.change
        : 0;

    fiatHtml +=
      card(
        item.name,
        faNum(Math.round(val)) + ' تومان',
        ch
      );
  });

  var fiatEl = document.getElementById('fiat');

  if (fiatEl) {
    fiatEl.innerHTML =
      fiatHtml ||
      '<div class="msg">داده‌ای موجود نیست</div>';
  }


  // =========================================================
  // سایر ارزهای جهان
  // =========================================================

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
    { key: 'kwd', name: 'دینار کویت' },
    { key: 'nzd', name: 'دلار نیوزیلند' },
    { key: 'sgd', name: 'دلار سنگاپور' },
    { key: 'hkd', name: 'دلار هنگ‌کنگ' },
    { key: 'myr', name: 'رینگیت مالزی' },
    { key: 'thb', name: 'بات تایلند' },
    { key: 'krw', name: 'وون کره جنوبی' },
    { key: 'mxn', name: 'پزو مکزیک' },
    { key: 'brl', name: 'رئال برزیل' },
    { key: 'zar', name: 'راند آفریقای جنوبی' },
    { key: 'egp', name: 'پوند مصر' },
    { key: 'syp', name: 'لیر سوریه' },
    { key: 'azn', name: 'منات آذربایجان' },
    { key: 'gel', name: 'لاری گرجستان' },
    { key: 'amd', name: 'درام ارمنستان' },
    { key: 'ils', name: 'شِکِل اسرائیل' },
    { key: 'pln', name: 'زلوتی لهستان' },
    { key: 'czk', name: 'کرون چک' },
    { key: 'huf', name: 'فورینت مجارستان' },
{ key: 'ron', name: 'لئو رومانی' },
    { key: 'jod', name: 'دینار اردن' },
    { key: 'omr', name: 'ریال عمان' },
    { key: 'bhd', name: 'دینار بحرین' },
    { key: 'tnd', name: 'دینار تونس' },
    { key: 'mad', name: 'درهم مراکش' },
    { key: 'dzd', name: 'دینار الجزایر' },
    { key: 'lbp', name: 'لیر لبنان' },
    { key: 'yer', name: 'ریال یمن' },
    { key: 'twd', name: 'دلار تایوان' },
    { key: 'php', name: 'پزو فیلیپین' },
    { key: 'idr', name: 'روپیه اندونزی' },
    { key: 'vnd', name: 'دانگ ویتنام' },
    { key: 'uah', name: 'هریونیا اوکراین' },
    { key: 'kzt', name: 'تنگه قزاقستان' },
    { key: 'uzs', name: 'سوم ازبکستان' },
    { key: 'tmt', name: 'منات ترکمنستان' },
    { key: 'tjs', name: 'سامانی تاجیکستان' },
    { key: 'kgs', name: 'سوم قرقیزستان' }
  ];

  worldItems.forEach(function (item) {

    var raw = navasan[item.key];

    if (!raw) return;

    var val = num(raw);

    if (val <= 0) return;

    var ch =
      (raw.change !== undefined)
        ? raw.change
        : 0;

    worldHtml +=
      card(
        item.name,
        faNum(Math.round(val)) + ' تومان',
        ch
      );
  });

  var worldEl = document.getElementById('world');

  if (worldEl) {
    worldEl.innerHTML =
      worldHtml ||
      '<div class="msg">داده‌ای موجود نیست</div>';
  }
// =========================================================
  // CRYPTO
  // منبع اول: Nobitex
  // منبع دوم: CoinGecko
  // =========================================================

  var cryptoHtml = '';

  var cryptoMap = [
    { symbol: 'BTC', id: 'bitcoin', name: 'بیت‌کوین (BTC)' },
    { symbol: 'ETH', id: 'ethereum', name: 'اتریوم (ETH)' },
    { symbol: 'USDT', id: 'tether', name: 'تتر (USDT)' },
    { symbol: 'BNB', id: 'binancecoin', name: 'بایننس‌کوین (BNB)' },
    { symbol: 'SOL', id: 'solana', name: 'سولانا (SOL)' },
    { symbol: 'XRP', id: 'ripple', name: 'ریپل (XRP)' },
    { symbol: 'DOGE', id: 'dogecoin', name: 'دوج‌کوین (DOGE)' },
    { symbol: 'TRX', id: 'tron', name: 'ترون (TRX)' },
    { symbol: 'ADA', id: 'cardano', name: 'کاردانو (ADA)' },
    { symbol: 'LINK', id: 'chainlink', name: 'چین‌لینک (LINK)' },
    { symbol: 'DOT', id: 'polkadot', name: 'پولکادات (DOT)' },
    { symbol: 'LTC', id: 'litecoin', name: 'لایت‌کوین (LTC)' },
    { symbol: 'AVAX', id: 'avalanche', name: 'آوالانچ (AVAX)' },
    { symbol: 'NEAR', id: 'near', name: 'نیر (NEAR)' },
    { symbol: 'UNI', id: 'uniswap', name: 'یونی‌سواپ (UNI)' },
    { symbol: 'XLM', id: 'stellar', name: 'استلار (XLM)' }
  ];


  function getNobitexPrice(symbol) {

    if (!nobitex) return null;

    /*
     * ساختار معمول داده Nobitex:
     *
     * {
     *   "status": "ok",
     *   "stats": {
     *      "btc-irt": {
     *          "latest": "...",
     *          "dayChange": "..."
     *      }
     *   }
     * }
     */

    var pair =
      symbol.toLowerCase() + '-irt';

    var market =
      nobitex.stats &&
      nobitex.stats[pair];

    if (!market) return null;

    var price =
      num(market.latest);

    if (!price || price <= 0) return null;

    var change =
      num(market.dayChange);

    return {
      toman: price,
      change: change
    };
  }


  cryptoMap.forEach(function (c) {

    // -----------------------------------------
    // منبع اول: Nobitex
    // -----------------------------------------

    var nobitexData =
      getNobitexPrice(c.symbol);

    if (nobitexData) {

      var usdPrice =
        nobitexData.toman /
        (TOMAN || DEFAULT_TOMAN);

      cryptoHtml +=
        cardUsd(
          c.name,
          usdPrice,
          nobitexData.toman,
          nobitexData.change
        );

      return;
    }


    // -----------------------------------------
    // منبع دوم: CoinGecko
    // فقط اگر Nobitex قیمت نداشت
    // -----------------------------------------

    if (
      crypto &&
      crypto[c.id] &&
      crypto[c.id].usd
    ) {

      var data =
        crypto[c.id];

      cryptoHtml +=
        cardUsd(
          c.name,
          data.usd,
          data.usd * TOMAN,
          data.usd_24h_change
        );
    }
  });


  var cryptoEl =
    document.getElementById('crypto');

  if (cryptoEl) {

    cryptoEl.innerHTML =
      cryptoHtml ||
      '<div class="msg">داده‌ای موجود نیست</div>';
  }


  // =========================================================
  // فلزات جهانی
  // =========================================================

  var metalsHtml = '';

  var metals = [
    {
      data: xau,
      name: 'طلای جهانی (XAU)',
      unit: 'اونس'
    },
    {
      data: xag,
      name: 'نقره (XAG)',
      unit: 'اونس'
    },
    {
      data: xpt,
      name: 'پلاتین (XPT)',
      unit: 'اونس'
    },
    {
      data: xpd,
      name: 'پالادیوم (XPD)',
      unit: 'اونس'
    }
  ];


  metals.forEach(function (m) {

    if (
      !m.data ||
      !m.data.price
    ) return;

    var usd =
      Number(m.data.price);

    metalsHtml +=
      cardUsd(
        m.name + ' / ' + m.unit,
        usd,
        usd * TOMAN,
        null
      );
  });


  // نرخ داخلی طلا و نقره

  if (
    navasan.xau &&
    num(navasan.xau) > 0
  ) {

    metalsHtml +=
      card(
        'طلای جهانی (نرخ داخلی)',
        faNum(
          Math.round(
            num(navasan.xau)
          )
        ) + ' تومان',
        navasan.xau.change
      );
  }
if (
    navasan.xag &&
    num(navasan.xag) > 0
  ) {

    metalsHtml +=
      card(
        'نقره (نرخ داخلی)',
        faNum(
          Math.round(
            num(navasan.xag)
          )
        ) + ' تومان',
        navasan.xag.change
      );
  }


  var metalsEl =
    document.getElementById('metals');

  if (metalsEl) {

    metalsEl.innerHTML =
      metalsHtml ||
      '<div class="msg">داده‌ای موجود نیست</div>';
  }


  // =========================================================
  // زمان آخرین بروزرسانی
  // =========================================================

  var timeEl =
    document.getElementById('time');

  if (timeEl) {

    timeEl.textContent =
      (isCache
        ? 'نمایش از حافظه • '
        : '') +
      'آخرین به‌روزرسانی: ' +
      new Date().toLocaleString('fa-IR');
  }


  if (isCache) {

    badge(
      '📦 نمایش سریع • در حال به‌روزرسانی...'
    );

  } else {

    badge(
      '✅ نرخ‌ها به‌روز شد • دلار: ' +
      faNum(usdSell) +
      ' تومان'
    );
  }


  setupConverter();
  setupSearch();

  return true;
}
// =========================================================
// CACHE
// =========================================================

function showFromCache() {
  try {

    var raw =
      localStorage.getItem(CACHE_KEY);

    if (!raw) return false;

    var data =
      JSON.parse(raw);

    if (
      !data ||
      !data.navasan
    ) {
      return false;
    }

    return renderAll(
      data.navasan,
      data.crypto,
      data.nobitex,
      data.xau,
      data.xag,
      data.xpt,
      data.xpd,
      true
    );

  } catch (e) {

    return false;
  }
}


// =========================================================
// ذخیره اطلاعات در حافظه مرورگر
// =========================================================

function saveToCache(
  navasan,
  crypto,
  nobitex,
  xau,
  xag,
  xpt,
  xpd
) {

  try {

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({

        navasan: navasan,

        crypto: crypto,

        nobitex: nobitex,

        xau: xau,

        xag: xag,

        xpt: xpt,

        xpd: xpd,

        savedAt: Date.now()

      })
    );

  } catch (e) {}
}


// =========================================================
// خواندن JSON از GitHub Pages
// =========================================================

async function loadJSON(path) {

  try {

    var res =
      await fetch(
        path + '?t=' + Date.now()
      );

    if (!res.ok) {
      return null;
    }

    var text =
      await res.text();

    // جلوگیری از قبول کردن صفحه HTML
    if (
      text.trim().startsWith('<!DOCTYPE') ||
      text.trim().startsWith('<html')
    ) {
      return null;
    }

    return JSON.parse(text);

  } catch (e) {

    console.error(
      'JSON load error:',
      path,
      e
    );

    return null;
  }
}


// =========================================================
// اجرای اصلی سایت
// =========================================================

async function main() {

  var hasCache =
    showFromCache();

  if (!hasCache) {

    badge(
      '⏳ در حال دریافت نرخ‌ها...'
    );
  }


  // -----------------------------------------
  // ارز و طلا
  // -----------------------------------------

  var navasan =
    await loadJSON(
      'data/navasan.json'
    );


  // -----------------------------------------
  // CoinGecko
  // منبع پشتیبان کریپتو
  // -----------------------------------------

  var crypto =
    await loadJSON(
      'data/crypto.json'
    );


  // -----------------------------------------
  // Nobitex
  // منبع اصلی کریپتو
  // -----------------------------------------

  var nobitex =
    await loadJSON(
      'data/nobitex.json'
    );


  // -----------------------------------------
  // فلزات جهانی
  // -----------------------------------------

  var xau =
    await loadJSON(
      'data/xau.json'
    );

  var xag =
    await loadJSON(
      'data/xag.json'
    );

  var xpt =
    await loadJSON(
      'data/xpt.json'
    );

  var xpd =
    await loadJSON(
      'data/xpd.json'
    );


  // -----------------------------------------
  // اگر منبع اصلی ارز در دسترس نبود
  // -----------------------------------------

  if (!navasan) {

    if (!hasCache) {

      badge(
        '❌ خطا در دریافت داده‌ها — چند دقیقه دیگر دوباره امتحان کنید'
      );

    } else {

      badge(
        '⚠️ اتصال برقرار نشد • نمایش آخرین قیمت‌های ذخیره‌شده'
      );
    }

    return;
  }


  // -----------------------------------------
  // نمایش اطلاعات
  // -----------------------------------------

  renderAll(
    navasan,
    crypto,
    nobitex,
    xau,
    xag,
    xpt,
    xpd,
    false
  );


  // -----------------------------------------
  // ذخیره آخرین اطلاعات
  // -----------------------------------------

  saveToCache(
    navasan,
    crypto,
    nobitex,
    xau,
    xag,
    xpt,
    xpd
  );
}


// =========================================================
// شروع برنامه
// =========================================================

main().catch(function (err) {

  console.error(err);

  badge(
    '❌ خطا در بارگذاری'
  );

});
