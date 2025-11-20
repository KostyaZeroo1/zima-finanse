// === Гирлянда, снег, музыка ===
function createGarland(){
    const g = document.getElementById('garland');
    g.innerHTML = '';
    const count = Math.floor(window.innerWidth / 60) + 8;
    for(let i = 0; i < count; i++){
        const light = document.createElement('div');
        light.className = 'light';
        light.style.left = (i / count * 100) + '%';
        light.style.animationDelay = Math.random() * 3 + 's';
        g.appendChild(light);
    }
}
createGarland();
window.addEventListener('resize', createGarland);
setInterval(()=>{const s=document.createElement('div');s.style.cssText=`position:absolute;width:${Math.random()*5+3}px;height:${s.style.width};background:white;border-radius:50%;opacity:${Math.random()*0.6+0.4};left:${Math.random()*100}vw;top:-10px;animation:fall ${Math.random()*10+10}s linear forwards`;document.querySelector('.snow').appendChild(s);setTimeout(()=>s.remove(),20000);},120);
document.head.appendChild(Object.assign(document.createElement('style'),{innerHTML:'@keyframes fall{to{transform:translateY(110vh) rotate(720deg);}}'}));

const music = document.getElementById('xmasMusic');
let musicPlayed = false;
function toggleMusic(){
    if(!musicPlayed){ music.play(); musicPlayed=true; }
    if(music.paused){
        music.play();
        document.querySelector('.music-btn').innerHTML='🔕';
    }else{
        music.pause();
        document.querySelector('.music-btn').innerHTML='🎄';
    }
}
// === КРАСИВЫЙ СНЕГ ===
function createSnow() {
    const snowflake = document.createElement("div");
    snowflake.style.position = "fixed";
    snowflake.style.top = "-10px";
    snowflake.style.left = Math.random() * 100 + "vw";
    snowflake.style.width = Math.random() * 6 + 4 + "px";
    snowflake.style.height = snowflake.style.width;
    snowflake.style.background = "white";
    snowflake.style.borderRadius = "50%";
    snowflake.style.opacity = Math.random() * 0.8 + 0.4;
    snowflake.style.pointerEvents = "none";
    snowflake.style.zIndex = "10";
    snowflake.style.boxShadow = "0 0 8px rgba(255,255,255,0.8)";
    snowflake.style.animation = `fall ${Math.random() * 10 + 10}s linear forwards`;

    document.querySelector(".snow").appendChild(snowflake);

    setTimeout(() => snowflake.remove(), 20000);
}

// Анимация падения
const style = document.createElement("style");
style.textContent = `
@keyframes fall {
    to {
        transform: translateY(100vh) rotate(720deg);
    }
}`;
document.head.appendChild(style);

// Запускаем снежинки каждые 100–200 мс
setInterval(createSnow, 120);
// === Курсы и валюта ===
let displayCurrency = localStorage.getItem("displayCurrency") || "RUB";
let rates = { RUB:1, USD:95, EUR:105 };

async function loadRates() {
    try {
        const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
        const data = await res.json();
        rates.USD = data.Valute.USD.Value;
        rates.EUR = data.Valute.EUR.Value;
        rates.RUB = 1;
        const date = new Date(data.Date).toLocaleDateString("ru");
        document.getElementById("rate-info").textContent = `Курс ЦБ (${date}): 1$ = ${rates.USD.toFixed(2)}₽ • 1€ = ${rates.EUR.toFixed(2)}₽`;
    } catch(e) {
        document.getElementById("rate-info").textContent = `Fallback: 1$ = ${rates.USD.toFixed(2)}₽ • 1€ = ${rates.EUR.toFixed(2)}₽`;
    }
    renderAll();
}
loadRates();
setInterval(loadRates, 12*60*60*1000);

function setDisplayCurrency(cur) {
    displayCurrency = cur;
    localStorage.setItem("displayCurrency", cur);
    document.querySelectorAll(".currency-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.cur === cur);
    });
    renderAll();
}
document.querySelectorAll(".currency-btn").forEach(btn => {
    btn.addEventListener("click", () => setDisplayCurrency(btn.dataset.cur));
});

// === Данные (всё хранится в RUB) ===
let rawIncomes = JSON.parse(localStorage.getItem("rawIncomes")||"[]");
let rawExpenses = JSON.parse(localStorage.getItem("rawExpenses")||"[]");
let rawGoal = JSON.parse(localStorage.getItem("rawGoal")||"null");

function saveData(){ localStorage.setItem("rawIncomes",JSON.stringify(rawIncomes)); localStorage.setItem("rawExpenses",JSON.stringify(rawExpenses)); localStorage.setItem("rawGoal",JSON.stringify(rawGoal)); }

function convertFromRUB(amount){ return Math.round((amount / rates[displayCurrency]) * 100) / 100; }
function convertToRUB(amount){ return Math.round((amount * rates[displayCurrency]) * 100) / 100; }
function getSymbol(cur){ return cur==="RUB"?"₽":cur==="USD"?"$":"€"; }

function format(number){
    if(isNaN(number)) return "0.00";
    const abs = Math.abs(number);
    const [int, dec] = abs.toFixed(2).split('.');
    return (number<0?"-":"") + int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "." + dec;
}

function calculate(){
    const incomeRUB = rawIncomes.reduce((s,i)=>s+i.amount,0);
    const expenseRUB = rawExpenses.reduce((s,e)=>s+e.amount,0);
    const balanceRUB = incomeRUB - expenseRUB;
    const savedRUB = rawGoal ? balanceRUB : 0;
    const progress = rawGoal && rawGoal.amount>0 ? Math.max(0, Math.min(100, (balanceRUB / rawGoal.amount)*100)) : 0;

    return {
        balance: convertFromRUB(balanceRUB),
        saved: convertFromRUB(savedRUB),
        progress,
        incomeTotal: convertFromRUB(incomeRUB),
        expenseTotal: convertFromRUB(expenseRUB),
        balanceRUB,
        goalAmount: rawGoal ? convertFromRUB(rawGoal.amount) : 0
    };
}

function renderAll(){
    const c = calculate();
    const sym = getSymbol(displayCurrency);

    document.getElementById("balance").textContent = format(c.balance);
    document.getElementById("currencySymbol").textContent = sym;
    document.getElementById("currencySymbol2").textContent = sym;
    document.getElementById("saved").textContent = format(c.saved);
    document.getElementById("mainProgress").style.width = c.progress + "%";
    document.getElementById("mainProgress").textContent = c.progress.toFixed(1) + "%";

    if(rawGoal){
        document.getElementById("mainGoal").innerHTML = `${rawGoal.name} — нужно ${format(c.goalAmount)} ${sym}`;
        document.getElementById("currentGoal").innerHTML = `<strong>${rawGoal.name}</strong><br>Нужно: ${format(c.goalAmount)} ${sym}<br>Накоплено: ${format(c.balance)} ${sym} (${c.progress.toFixed(1)}%)`;
    }else{
        document.getElementById("mainGoal").textContent = "Цель не установлена";
        document.getElementById("currentGoal").innerHTML = "Установите цель на вкладке «Цель»";
    }

    // Таблицы
    document.getElementById("incomeTable").innerHTML = "<tr><th>Описание</th><th>Сумма</th><th></th></tr>";
    rawIncomes.forEach((i,idx)=>{ const tr=document.createElement("tr"); tr.innerHTML=`<td>${i.desc}</td><td>${format(convertFromRUB(i.amount))} ${sym}</td><td><button class="delete-btn" onclick="deleteIncome(${idx})">×</button></td>`; document.getElementById("incomeTable").appendChild(tr); });

    document.getElementById("expenseTable").innerHTML = "<tr><th>Описание</th><th>Сумма</th><th></th></tr>";
    rawExpenses.forEach((e,idx)=>{ const tr=document.createElement("tr"); tr.innerHTML=`<td>${e.desc}</td><td>${format(convertFromRUB(e.amount))} ${sym}</td><td><button class="delete-btn" onclick="deleteExpense(${idx})">×</button></td>`; document.getElementById("expenseTable").appendChild(tr); });

    document.getElementById("statsInfo").innerHTML = `
        <p>Доходы всего: ${format(c.incomeTotal)} ${sym}</p>
        <p>Расходы всего: ${format(c.expenseTotal)} ${sym}</p>
        <p>Баланс в RUB: ${format(c.balanceRUB)} ₽</p>
    `;
}

function addIncome(){
    const desc = document.getElementById("incomeDesc").value.trim();
    const amount = parseFloat(document.getElementById("incomeAmount").value);
    if(desc && amount>0){
        rawIncomes.push({desc, amount: convertToRUB(amount)});
        saveData(); renderAll();
        document.getElementById("incomeDesc").value="";
        document.getElementById("incomeAmount").value="";
        document.querySelector("#income .card").classList.add("added-animation");
        setTimeout(()=>document.querySelector("#income .card").classList.remove("added-animation"),500);
    }else alert("Заполните всё!");
}

function addExpense(){
    const desc = document.getElementById("expenseDesc").value.trim();
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    if(desc && amount>0){
        rawExpenses.push({desc, amount: convertToRUB(amount)});
        saveData(); renderAll();
        document.getElementById("expenseDesc").value="";
        document.getElementById("expenseAmount").value="";
        document.querySelector("#expense .card").classList.add("added-animation");
        setTimeout(()=>document.querySelector("#expense .card").classList.remove("added-animation"),500);
    }else alert("Заполните всё!");
}

function deleteIncome(idx){ rawIncomes.splice(idx,1); saveData(); renderAll(); }
function deleteExpense(idx){ rawExpenses.splice(idx,1); saveData(); renderAll(); }

function setGoal(){
    const name = document.getElementById("goalName").value.trim();
    const amount = parseFloat(document.getElementById("goalAmount").value);
    if(name && amount>0){
        rawGoal = {name, amount: convertToRUB(amount)};
        saveData(); renderAll();
        document.getElementById("goalName").value="";
        document.getElementById("goalAmount").value="";
    }else alert("Заполните всё!");
}

function showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.style.display="none");
    document.getElementById(id).style.display="block";
}

// Старт
renderAll();