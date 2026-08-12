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
