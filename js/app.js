// ============ تنظیمات و ابزارها ============
var DEFAULT_TOMAN = 187500;
var TOMAN = Number(localStorage.getItem('cachedTomanRate')) || DEFAULT_TOMAN;

function badge(t){ document.getElementById('rateBadge').textContent = t; }
function faNum(n){ return Number(n).toLocaleString('fa-IR'); }
function usdFmt(n){ return '$' + Number(n).toLocaleString('en-US', {maximumFractionDigits: n < 10 ? 4 : 2}); }
function num(x){
  if(typeof x === 'number') return isFinite(x) ? x : 0;
  if(typeof x === 'string'){ var n = Number(x.replace(/,/g,'این سیستم «نرمال‌سازی هوشمند» که الان توی کد هست، خودش به‌صورت خودکار تعداد صفرها رو تنظیم می‌کنه — یعنی سکه امامی هم مثل نیم و ربع سکه، همیشه با مقدار درست نمایش داده می‌شه (حدود ۱۸۰ میلیون تومان) و نیازی به اضافه کردن دستی صفر نیست.

ولی اگه الان روی سایتت سکه امامی یه صفر کم نشون داده می‌شه، احتمالاً مرورگرت نسخه قدیمی فایل app.js رو کش کرده.

### 🔧 اول این کار رو بکن:
1. سایت رو باز کن
2. کلیدهای **Ctrl + Shift + R** رو با هم بزن (رفرش کامل بدون کش)
3. ببین سکه امامی الان چند نشون می‌ده

اگه بعد از رفرش کامل هنوز یه صفر کم بود، بهم بگو دقیقاً چه عددی نشون می‌ده (مثلاً «۱۸,۰۵۰,۰۰۰») تا بفهمم مشکل از کجاست و درستش کنم. 🙌
