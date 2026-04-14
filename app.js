let currentStep = 1;

// Конфигурация параметров по нишам (реальные данные из Яндекс.Директа)
const NICHE_CONFIG = {
    ecommerce: {
        name: 'Интернет-магазин (товары)',
        cpc: 25,
        conversion: 2.5,
        ctr: 8.0,
        defaultCheck: 3500
    },
    services: {
        name: 'Услуги B2C (ремонт, клининг, красота)',
        cpc: 85,
        conversion: 7.0,
        ctr: 12.0,
        defaultCheck: 8000
    },
    b2b: {
        name: 'B2B / Оптовые продажи',
        cpc: 120,
        conversion: 4.5,
        ctr: 6.0,
        defaultCheck: 45000
    },
    development: {
        name: 'Разработка / IT / Агентства',
        cpc: 180,
        conversion: 3.0,
        ctr: 5.0,
        defaultCheck: 150000
    },
    medicine: {
        name: 'Медицина / Стоматология',
        cpc: 250,
        conversion: 8.5,
        ctr: 10.0,
        defaultCheck: 12000
    },
    realestate: {
        name: 'Недвижимость / Строительство',
        cpc: 160,
        conversion: 2.0,
        ctr: 7.0,
        defaultCheck: 150000
    }
};

// Данные о сайтах
const SITE_OPTIONS = {
    landing: {
        name: 'Лендинг (одностраничный сайт)',
        minPrice: 40000,
        maxPrice: 90000,
        avgPrice: 65000,
        timeToDevelop: '2-3 недели'
    },
    multiPage: {
        name: 'Многостраничный сайт / Каталог',
        minPrice: 90000,
        maxPrice: 180000,
        avgPrice: 135000,
        timeToDevelop: '4-6 недель'
    },
    ecommerce: {
        name: 'Интернет-магазин',
        minPrice: 150000,
        maxPrice: 350000,
        avgPrice: 250000,
        timeToDevelop: '2-3 месяца'
    },
    portal: {
        name: 'Портал / Маркетплейс',
        minPrice: 350000,
        maxPrice: 800000,
        avgPrice: 575000,
        timeToDevelop: '4-6 месяцев'
    }
};

// Форматирование валюты
function formatMoney(amount) {
    return amount.toLocaleString('ru-RU');
}

// Форматирование числа
function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

// Показать шаг
function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const stepElement = document.getElementById(`step${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
        currentStep = step;
    }
}

// Следующий шаг
function nextStep(step) {
    if (step === 2 && !validateStep1()) return;
    if (step === 2) updateDefaultCheck();
    showStep(step);
}

// Предыдущий шаг
function prevStep(step) {
    showStep(step);
}

// Валидация первого шага
function validateStep1() {
    const revenueInput = document.getElementById('revenue');
    const revenue = parseInt(revenueInput.value.replace(/[^\d]/g, ''));
    
    if (!revenue || revenue < 1000) {
        alert('Укажите желаемую выручку (минимум 1 000 руб.)');
        return false;
    }
    return true;
}

// Обновление дефолтного чека при смене ниши
function updateDefaultCheck() {
    const niche = document.getElementById('niche').value;
    const config = NICHE_CONFIG[niche];
    const hintElement = document.getElementById('checkHint');
    
    if (config) {
        const checkInput = document.getElementById('averageOrder');
        if (!checkInput.value) {
            checkInput.placeholder = `Например: ${formatMoney(config.defaultCheck)} руб.`;
        }
        if (hintElement) {
            hintElement.textContent = `Рекомендуемый средний чек для этой ниши: ~${formatMoney(config.defaultCheck)} руб.`;
        }
    }
}

// Расчёт окупаемости сайта
function calculateROI(sitePrice, monthlyAdBudget, revenue, averageOrder) {
    const marginRate = 0.35; // 35% средняя маржинальность
    const monthlyGrossProfit = revenue * marginRate;
    const monthlyNetProfit = monthlyGrossProfit - monthlyAdBudget;
    
    const paybackMonths = monthlyNetProfit > 0 
        ? Math.round((sitePrice / monthlyNetProfit) * 10) / 10 
        : Infinity;
    
    return {
        monthlyNetProfit,
        paybackMonths,
        marginRate: marginRate * 100
    };
}

// Основной расчёт
function calculate() {
    // Получение данных из формы
    const revenueInput = document.getElementById('revenue');
    const averageOrderInput = document.getElementById('averageOrder');
    
    const revenue = parseInt(revenueInput.value.replace(/[^\d]/g, ''));
    let averageOrder = parseInt(averageOrderInput.value.replace(/[^\d]/g, ''));
    
    const niche = document.getElementById('niche').value;
    const siteType = document.getElementById('siteType').value;
    
    // Применение дефолтного чека, если не указан
    if (!averageOrder || isNaN(averageOrder)) {
        averageOrder = NICHE_CONFIG[niche].defaultCheck;
        averageOrderInput.value = averageOrder;
    }
    
    // Валидация
    if (!revenue || revenue < 1000) {
        alert('Укажите желаемую выручку (минимум 1 000 руб.)');
        return;
    }
    
    if (!averageOrder || averageOrder < 500) {
        alert('Средний чек должен быть не менее 500 руб.');
        return;
    }
    
    // Получение конфигурации ниши
    const config = NICHE_CONFIG[niche];
    const cpc = config.cpc;
    const conversionRate = config.conversion / 100;
    
    // Базовые расчёты
    const ordersNeeded = Math.ceil(revenue / averageOrder);
    const visitorsNeeded = Math.ceil(ordersNeeded / conversionRate);
    const adBudget = Math.ceil(visitorsNeeded * cpc);
    
    // Дополнительные метрики
    const averageCtr = config.ctr / 100;
    const impressionsNeeded = Math.ceil(visitorsNeeded / averageCtr);
    const cpo = ordersNeeded > 0 ? Math.ceil(adBudget / ordersNeeded) : 0;
    
    // Расчёт бюджета на сайт
    const siteConfig = SITE_OPTIONS[siteType];
    const siteBudget = {
        min: siteConfig.minPrice,
        max: siteConfig.maxPrice,
        avg: siteConfig.avgPrice,
        name: siteConfig.name,
        timeToDevelop: siteConfig.timeToDevelop
    };
    
    // Расчёт окупаемости
    const roi = calculateROI(siteBudget.avg, adBudget, revenue, averageOrder);
    
    // Генерация рекомендаций
    const recommendations = generateRecommendations(config.conversion, cpc, ordersNeeded, visitorsNeeded);
    
    displayResults({
        ordersNeeded,
        visitorsNeeded,
        adBudget,
        siteBudget,
        niche: config.name,
        cpc,
        conversion: config.conversion,
        impressionsNeeded,
        cpo,
        roi,
        recommendations,
        revenue,
        averageOrder
    });
    
    showStep(3);
}

// Генерация умных рекомендаций
function generateRecommendations(conversion, cpc, orders, visitors) {
    const recs = [];
    
    if (conversion < 2.0) {
        recs.push('⚠️ Конверсия ниже 2% — рекомендую оптимизировать посадочную страницу и форму заявки.');
    } else if (conversion > 5.0) {
        recs.push('✅ Отличная конверсия! Масштабируйте рекламный бюджет для роста.');
    }
    
    if (cpc > 100) {
        recs.push('💡 Высокая цена клика — используйте ретаргетинг и настройку на горячую аудиторию для снижения CPC.');
    }
    
    if (orders < 10) {
        recs.push('📊 Малый объём заказов — рекомендую начать с тестового бюджета 30-50 тыс. руб.');
    }
    
    if (visitors > 5000) {
        recs.push('🚀 Большой объём трафика — подключите CRM и сквозную аналитику для отслеживания ROI.');
    }
    
    return recs.length > 0 ? recs : ['✅ Ваши показатели в норме. Следуйте расчётам и отслеживайте статистику.'];
}

// Отображение результатов
function displayResults(data) {
    const results = document.getElementById('results');
    
    const roiText = data.roi.paybackMonths === Infinity 
        ? 'не окупится при текущих показателях'
        : `окупится через ${data.roi.paybackMonths} мес.`;
    
    const roiClass = data.roi.paybackMonths === Infinity 
        ? 'warning' 
        : (data.roi.paybackMonths <= 6 ? 'good' : 'normal');
    
    const recommendationsHtml = data.recommendations
        .map(rec => `<div class="recommendation-item">${rec}</div>`)
        .join('');
    
    results.innerHTML = `
        <div class="result-section">
            <h3>🎯 Целевые показатели для ниши "${data.niche}"</h3>
            <div class="result-item">
                <strong>📦 Заказов в месяц:</strong>
                <span>${formatNumber(data.ordersNeeded)}</span>
            </div>
            <div class="result-item">
                <strong>👥 Посетителей в месяц:</strong>
                <span>${formatNumber(data.visitorsNeeded)}</span>
            </div>
            <div class="result-item">
                <strong>👁️ Показов рекламы:</strong>
                <span>${formatNumber(data.impressionsNeeded)}</span>
            </div>
        </div>
        
        <div class="result-section">
            <h3>💰 Рекламный бюджет (Яндекс.Директ)</h3>
            <div class="result-item highlight-blue">
                <strong>Месячный бюджет:</strong>
                <span>${formatMoney(data.adBudget)} руб.</span>
            </div>
            <div class="result-item">
                <strong>Средняя цена клика (CPC):</strong>
                <span>${data.cpc} руб.</span>
            </div>
            <div class="result-item">
                <strong>Цена заказа (CPO):</strong>
                <span>${formatMoney(data.cpo)} руб.</span>
            </div>
            <div class="result-item">
                <strong>Прогнозная конверсия:</strong>
                <span>${data.conversion}%</span>
            </div>
        </div>
        
        <div class="result-section">
            <h3>💻 Инвестиции в сайт: ${data.siteBudget.name}</h3>
            <div class="result-item">
                <strong>Бюджет разработки:</strong>
                <span>${formatMoney(data.siteBudget.min)} - ${formatMoney(data.siteBudget.max)} руб.</span>
            </div>
            <div class="result-item">
                <strong>Сроки разработки:</strong>
                <span>${data.siteBudget.timeToDevelop}</span>
            </div>
            <div class="result-item ${roiClass}">
                <strong>📈 Окупаемость сайта:</strong>
                <span>${roiText}</span>
            </div>
            <div class="result-item">
                <strong>💵 Чистая прибыль/мес:</strong>
                <span>${formatMoney(Math.max(0, Math.floor(data.roi.monthlyNetProfit)))} руб.</span>
            </div>
        </div>
        
        <div class="result-section">
            <h3>🎯 Рекомендации по оптимизации</h3>
            ${recommendationsHtml}
        </div>
        
        <div class="result-footer">
            <small>* Расчёт основан на реальных показателях ниш в Яндекс.Директе (2026). Фактические значения могут отличаться на ±20%.</small>
        </div>
    `;
}

// Рестарт
function restart() {
    document.getElementById('revenue').value = '';
    document.getElementById('averageOrder').value = '';
    document.getElementById('niche').value = 'ecommerce';
    document.getElementById('siteType').value = 'landing';
    showStep(1);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Установка начальных значений
    updateDefaultCheck();
    
    // Обработчик изменения ниши
    const nicheSelect = document.getElementById('niche');
    if (nicheSelect) {
        nicheSelect.addEventListener('change', updateDefaultCheck);
    }
    
    // Валидация ввода чисел
    const numericInputs = ['revenue', 'averageOrder'];
    numericInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
            });
        }
    });
    
    // Telegram Web App
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});
