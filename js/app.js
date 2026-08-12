var SITE_NAME = 'آرزینو | Arzino';
var LOGO = '';
var DEFAULT_TOMAN = 187500;

document.getElementById('siteName').textContent = SITE_NAME;
document.title = SITE_NAME + ' | قیمت لحظه‌ای ارز';
if(LOGO !== ''){
  document.getElementById('logoBox').innerHTML = '<img src="'+LOGO+'" alt="logo" style="width:46px;height:46px;border-radius:12px;vertical-align:middle">';
}

var TOMAN = Number(localStorage.getItem('tomanRate')) || Number(localStorage.getItem('cachedTomanRate')) || DEFAULT_TOMAN;
var mode = localStorage.getItem('tomanMode') || 'auto';

function badge(t){ document.getElementById('rateBadge').textContent = t; }

function parseToman(j, src){
  try{
    if(src.indexOf('bonbast') !== -1){
      if(j && j.usd && j.usd.sell){ return Number(String(j.usd.sell).replace(/,/g,'')); }
      if(j && j.usd && j.usd.buy){ return Number(String(j.usd.buy).replace(/,/g,'')); }
    }else{
      if(j && j.data){
        if(j.data.usd && j.data.usd.price){ return Number(j.data.usd.price); }
        if(j.data.price){ return Number(j.data.price); }
        if(Array.isArray(j.data) && j.data[0] && j.data[0].price){ return Number(j.data[0].price); }
      }
    }
  }catch(e){}
  return 0;
}

async function fetchAutoToman(){
  var sources = [
    'https://bonbast.com/json/',
    'https://api.tgju.org/v1/market/indicator/summary-parameter-data?name=usd'
  ];
  var proxies = [
    function(u){ return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
    function(u){ return 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(u); }
  ];
  
  var promises = [];
  for(var s=0;s<sources.length;s++){
    for(var p=0;p<proxies.length;p++){
      (function(source, proxy){
        promises.push(
          fetch(proxy(source))
            .then(function(r){ 
              if(!r.ok) throw new Error('Network error');
              return r.json(); 
            })
            .then(function(j){
              var v = parseToman(j, source);
              if(v > 1000) return v;
              throw new Error('Invalid price');
            })
        );
      })(sources[s], proxies[p]);
    }
  }
  
  try {
    return await Promise.any(promises);
  } catch(e) {
    return 0;
  }
}

async function initToman(){
  if(mode === 'auto'){
    badge('⏳ در حال دریافت خودکار...');
    loadAll();
    
    var a = await fetchAutoToman();
    if(a > 1000){
      TOMAN = a;
      localStorage.setItem('cachedTomanRate', a);
      badge('🟢 خودکار: ' + a.toLocaleString('fa-IR') + ' تومان');
      loadAll();
    }else{
      badge('🟡 دستی (منبع خودکار در دسترس نیست)');
    }
  }else{
    badge('🟡 دستی');
    loadAll();
  }
  document.getElementById('tomanInput').value = TOMAN;
}

function setToman(){
  var v = Number(document.getElementById('tomanInput').value);
  if(v > 0){
    TOMAN = v;
    mode = 'manual';
    localStorage.setItem('tomanRate', v);
    localStorage.setItem('tomanMode', 'manual');
    badge('🟡 دستی');
    loadAll();
  }
}

function setAuto(){
  mode = 'auto';
  localStorage.setItem('tomanMode', 'auto');
  localStorage.removeItem('tomanRate');
  initToman();
}

function toman(usd){
  return Math.round(usd * TOMAN).toLocaleString('fa-IR') + ' تومان';
}

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

var FIATS = [
['EUR','€','یورو'],
['GBP','£','پوند انگلیس'],
['TRY','₺','لیر ترکیه'],
['AED','درهم','درهم امارات'],
['CHF','فرانک','فرانک سوئیس'],
['CNY','¥','یوان چین'],
['RUB','₽','روبل روسیه'],
['INR','₹','روپیه هند'],
['JPY','ین','ین ژاپن'],
['CAD','$','دلار کانادا'],
['AUD','$','دلار استرالیا']
];

function card(icon,name,usd,change){
  var ch='';
  if(change!==null && change!==undefined){
    var cls = change>=0 ? 'up':'down';
    ch='<div class="change '+cls+'">'+(change>=0?'▲':'▼')+' '+Math.abs(change).toFixed(2)+'%</div>';
  }
  return '<div class="card"><div class="name">'+icon+' '+name+'</div><div class="price">$'+Number(usd).toLocaleString('en-US',{maximumFractionDigits:4})+'</div><div class="toman">'+toman(usd)+'</div>'+ch+'</div>';
}

function fiatCard(icon,name,ratePerUsd){
  var usd = 1/ratePerUsd;
  return '<div class="card"><div class="name">'+icon+' '+name+'</div><div class="price">$'+usd.toFixed(4)+'</div><div class="toman">'+toman(usd)+'</div></div>';
}

async function loadAll(){
  var cbox=document.getElementById('crypto');
  var fbox=document.getElementById('fiat');
  
  var cachedCrypto = localStorage.getItem('cachedCrypto');
  var cachedFiat = localStorage.getItem('cachedFiat');
  
  if(cachedCrypto) cbox.innerHTML = cachedCrypto;
  else cbox.innerHTML='<div class="msg">در حال بارگذاری...</div>';
  
  if(cachedFiat) fbox.innerHTML = cachedFiat;
  else fbox.innerHTML='<div class="msg">در حال بارگذاری...</div>';

  try{
    var ids = CRYPTOS.map(function(c){return c[0];}).join(',');
    
    var [r1, r2] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids='+ids+'&vs_currencies=usd&include_24hr_change=true'),
      fetch('https://open.er-api.com/v6/latest/USD')
    ]);
    
    var d1 = await r1.json();
    var d2 = await r2.json();
    
    var h='';
    for(var i=0;i<CRYPTOS.length;i++){
      var c=CRYPTOS[i];
      var info=d1[c[0]];
      if(info){ h+=card(c[1],c[2],info.usd,info.usd_24h_change); }
    }
    
    var fh=fiatCard('💵','دلار آمریکا',1);
    for(var j=0;j<FIATS.length;j++){
      var f=FIATS[j];
      if(d2.rates[f[0]]){ fh+=fiatCard(f[1],f[2],d2.rates[f[0]]); }
    }
    
    cbox.innerHTML=h;
    fbox.innerHTML=fh;
    localStorage.setItem('cachedCrypto', h);
    localStorage.setItem('cachedFiat', fh);
    
    document.getElementById('time').textContent='آخرین بروزرسانی: '+new Date().toLocaleTimeString('fa-IR');
  }catch(e){
    if(!cachedCrypto) cbox.innerHTML='<div class="msg">❌ خطا در دریافت قیمت. دکمه بروزرسانی را بزنید.</div>';
  }
}

initToman();
setInterval(loadAll, 60000);
