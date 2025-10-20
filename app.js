let currentStep = 1;

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
}

function nextStep(step) {
    if (step === 2 && !validateStep1()) return;
    showStep(step);
}

function prevStep(step) {
    showStep(step);
}

function validateStep1() {
    const revenue = document.getElementById('revenue').value;
    if (!revenue || revenue < 1000) {
        alert('Введите реалистичную сумму выручки (от 1000 руб)');
        return false;
    }
    return true;
}

function calculate() {
    const revenue = parseInt(document.getElementById('revenue').value);
    const averageOrder = parseInt(document.getElementById('averageOrder').value);
    
    // Ваша формула
    const ordersNeeded = Math.ceil(revenue / averageOrder);
    const visitorsNeeded = Math.ceil(ordersNeeded / 0.015); // Конверсия 1.5%
    const adBudget = Math.ceil(visitorsNeeded * 50 * 1.5); // Цена клика 50 руб × коэффициент 1.5
    
    let siteBudget;
    if (adBudget < 30000) siteBudget = "40 000 - 70 000 руб.";
    else if (adBudget <= 70000) siteBudget = "70 000 - 120 000 руб."; 
    else siteBudget = "120 000 - 200 000 руб.";
    
    displayResults(ordersNeeded, visitorsNeeded, adBudget, siteBudget);
    showStep(3);
}

function displayResults(orders, visitors, adBudget, siteBudget) {
    const results = document.getElementById('results');
    results.innerHTML = `
        <div class="result-item">
            <strong>📦 Нужно заказов в месяц:</strong> ${orders}
        </div>
        <div class="result-item">
            <strong>👥 Нужно посетителей в месяц:</strong> ${visitors.toLocaleString()}
        </div>
        <div class="result-item">
            <strong>💸 Рекламный бюджет:</strong> ~${adBudget.toLocaleString()} руб./мес
        </div>
        <div class="highlight">
            <strong>💻 Рекомендуемый бюджет на сайт:</strong><br>${siteBudget}
        </div>
        <div class="result-item">
            <small>*Расчёт ориентировочный. Цена клика взята 50 руб.</small>
        </div>
    `;
}

function restart() {
    document.getElementById('revenue').value = '';
    document.getElementById('averageOrder').value = '';
    showStep(1);
}

// Инициализация Telegram Web App
Telegram.WebApp.ready();
Telegram.WebApp.expand();
