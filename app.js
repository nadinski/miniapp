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

// Форматирование валюты с защитой от NaN
function formatMoney(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return '0';
    return Math.round(amount).toLocaleString('ru-RU');
}

// Форматирование числа с защитой от NaN
function formatNumber(num) {
    if (isNaN(num) || num === null || num === undefined) return '0';
    return Math.round(num).toLocaleString('ru-RU');
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
    
    if (!revenue || isNaN(revenue) || revenue < 1000) {
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
    const marginRate = 0.35;
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

// Оценка разумного бюджета на сайт исходя из оборота
function assessReasonableSiteBudget(revenue, averageOrder, adBudget) {
    const marginRate = 0.35;
    const monthlyGrossProfit = revenue * marginRate;
    const monthlyNetProfit = monthlyGrossProfit - adBudget;
    
    // Разумный бюджет на сайт: 10-20% от месячного оборота
    const minReasonable = Math.floor(revenue * 0.1);
    const optimalReasonable = Math.floor(revenue * 0.15);
    let maxReasonable = Math.floor(revenue * 0.2);
    
    // Но не больше 6 месячных чистых прибылей (чтобы окупался за полгода)
    // ИСПРАВЛЕНИЕ: Защита от отрицательной прибыли
    let maxByProfit;
    if (monthlyNetProfit > 0) {
        maxByProfit = Math.floor(monthlyNetProfit * 6);
    } else {
        maxByProfit = maxReasonable;
    }
    
    // ИСПРАВЛЕНИЕ: cappedMaxReasonable не может быть меньше minReasonable
    let cappedMaxReasonable = Math.min(maxReasonable, maxByProfit);
    cappedMaxReasonable = Math.max(cappedMaxReasonable, minReasonable);
    
    // Оценка каждого типа сайта относительно разумного бюджета
    const siteAssessments = {};
    for (let key in SITE_OPTIONS) {
        const site = SITE_OPTIONS[key];
        const paybackMonths = monthlyNetProfit > 0 
            ? Math.round((site.avgPrice / monthlyNetProfit) * 10) / 10 
            : Infinity;
        
        let verdict = '';
        let cssClass = '';
        
        if (site.avgPrice < minReasonable) {
            verdict = `🟢 Можно дороже — ваш бюджет позволяет до ${formatMoney(cappedMaxReasonable)} ₽`;
            cssClass = 'verdict-cheap';
        } else if (site.avgPrice >= minReasonable && site.avgPrice <= cappedMaxReasonable) {
            verdict = `✅ Оптимально для вашего оборота`;
            cssClass = 'verdict-optimal';
        } else if (site.avgPrice <= cappedMaxReasonable * 1.3) {
            verdict = `⚠️ Дороговато, окупится за ${paybackMonths} мес.`;
            cssClass = 'verdict-expensive';
        } else {
            verdict = `❌ Неразумно дорого для оборота ${formatMoney(revenue)} ₽/мес`;
            cssClass = 'verdict-too-expensive';
        }
        
        siteAssessments[key] = {
            ...site,
            paybackMonths,
            verdict,
            cssClass
        };
    }
    
    // Находим оптимальный тип сайта (тот, что попадает в коридор)
    let recommendationKey = 'landing';
    for (let key in siteAssessments) {
        const a = siteAssessments[key];
        if (a.avgPrice >= minReasonable && a.avgPrice <= cappedMaxReasonable) {
            recommendationKey = key;
            break;
        }
    }
    
    return {
        monthlyNetProfit,
        minReasonable,
        optimalReasonable,
        maxReasonable: cappedMaxReasonable,
        assessments: siteAssessments,
        topRecommendation: siteAssessments[recommendationKey]
    };
}

// Основной расчёт
function calculate() {
    const revenueInput = document.getElementById('revenue');
    const averageOrderInput = document.getElementById('averageOrder');
    
    let revenue = parseInt(revenueInput.value.replace(/[^\d]/g, ''));
    let averageOrder = parseInt(averageOrderInput.value.replace(/[^\d]/g, ''));
    
    const niche = document.getElementById('niche').value;
    const siteType = document.getElementById('siteType').value;
    
    // ИСПРАВЛЕНИЕ: Проверка на NaN
    if (!averageOrder || isNaN(averageOrder)) {
        averageOrder = NICHE_CONFIG[niche].defaultCheck;
        averageOrderInput.value = averageOrder;
    }
    
    if (!revenue || isNaN(revenue) || revenue < 1000) {
        alert('Укажите желаемую выручку (минимум 1 000 руб.)');
        return;
    }
    
    if (!averageOrder || isNaN(averageOrder) || averageOrder < 500) {
        alert('Средний чек должен быть не менее 500 руб.');
        return;
    }
    
    const config = NICHE_CONFIG[niche];
    const cpc = config.cpc;
    const conversionRate = config.conversion / 100;
    
    const ordersNeeded = Math.ceil(revenue / averageOrder);
    const visitorsNeeded = Math.ceil(ordersNeeded / conversionRate);
    const adBudget = Math.ceil(visitorsNeeded * cpc);
    
    const averageCtr = config.ctr / 100;
    const impressionsNeeded = Math.ceil(visitorsNeeded / averageCtr);
    
    // ИСПРАВЛЕНИЕ: Защита от деления на ноль
    const cpo = ordersNeeded > 0 ? Math.ceil(adBudget / ordersNeeded) : 0;
    
    const siteConfig = SITE_OPTIONS[siteType];
    const siteBudget = {
        min: siteConfig.minPrice,
        max: siteConfig.maxPrice,
        avg: siteConfig.avgPrice,
        name: siteConfig.name,
        timeToDevelop: siteConfig.timeToDevelop
    };
    
    const roi = calculateROI(siteBudget.avg, adBudget, revenue, averageOrder);
    const budgetAssessment = assessReasonableSiteBudget(revenue, averageOrder, adBudget);
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
        averageOrder,
        budgetAssessment,
        selectedSiteType: siteType
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

    const assessment = data.budgetAssessment;
    const topRec = assessment.topRecommendation;
    
    // ИСПРАВЛЕНИЕ: Корректное отображение прибыли (включая отрицательную)
    const netProfit = Math.floor(data.roi.monthlyNetProfit);
    const netProfitDisplay = netProfit >= 0 
        ? formatMoney(netProfit)
        : `убыток ${formatMoney(Math.abs(netProfit))}`;
    
    const monthlyNetProfitDisplay = Math.floor(assessment.monthlyNetProfit);
    const monthlyNetProfitText = monthlyNetProfitDisplay >= 0 
        ? formatMoney(monthlyNetProfitDisplay)
        : `убыток ${formatMoney(Math.abs(monthlyNetProfitDisplay))}`;

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
        
        <!-- ОБЪЕДИНЁННЫЙ БЛОК: Разумный бюджет + Детали выбранного сайта -->
        <div class="result-section assessment-block">
            <h3>🏦 Разумный бюджет на разработку</h3>
            <div class="assessment-main">
                <div class="assessment-value">
                    <span class="big-number">${formatMoney(assessment.optimalReasonable)} ₽</span>
                    <span class="assessment-label">— оптимальные инвестиции</span>
                </div>
                <div class="assessment-range">
                    💰 Разумный коридор: <strong>${formatMoney(assessment.minReasonable)} – ${formatMoney(assessment.maxReasonable)} ₽</strong>
                    <span class="range-hint">(10-20% от месячного оборота)</span>
                </div>
                <div class="assessment-note">
                    💡 При обороте <strong>${formatMoney(data.revenue)} ₽/мес</strong> и чистой прибыли <strong>${monthlyNetProfitText} ₽/мес</strong>
                </div>
            </div>
            
            <!-- НОВЫЙ ПОДБЛОК: Анализ выбранного варианта -->
            <div style="margin-top: 20px; background: #ffffff; border-radius: 18px; padding: 16px; border: 1px solid #f0e8df;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 18px;">🔍</span>
                    <span style="font-weight: 700; color: #1e1b2e; text-transform: uppercase; font-size: 13px;">Анализ выбранного варианта: ${data.siteBudget.name}</span>
                </div>
                
                <div class="result-item">
                    <strong>💰 Стоимость:</strong>
                    <span>${formatMoney(data.siteBudget.min)} – ${formatMoney(data.siteBudget.max)} руб.</span>
                </div>
                <div class="result-item">
                    <strong>⏳ Сроки запуска:</strong>
                    <span>${data.siteBudget.timeToDevelop}</span>
                </div>
                <div class="result-item">
                    <strong>📈 Окупаемость:</strong>
                    <span class="${roiClass}">${roiText}</span>
                </div>
                <div class="result-item" style="border-bottom: none;">
                    <strong>💵 Чистая прибыль после рекламы:</strong>
                    <span><strong>${netProfitDisplay} ₽/мес</strong></span>
                </div>
                
                <!-- Вердикт по выбранному варианту -->
                ${data.siteBudget.avg > assessment.maxReasonable ? `
                <div class="assessment-warning" style="margin-top: 16px;">
                    ⚠️ Выбранный вариант дороже разумного предела (${formatMoney(assessment.maxReasonable)} ₽). 
                    Рекомендую рассмотреть "${topRec.name}".
                </div>
                ` : ''}
                
                ${data.siteBudget.avg < assessment.minReasonable ? `
                <div class="assessment-tip" style="margin-top: 16px;">
                    💪 Ваш бюджет позволяет взять сайт мощнее! Обратите внимание на "${topRec.name}".
                </div>
                ` : ''}
                
                ${data.siteBudget.avg >= assessment.minReasonable && data.siteBudget.avg <= assessment.maxReasonable ? `
                <div class="assessment-tip" style="margin-top: 16px; background: #ecfdf5; color: #065f46; border-color: #a7f3d0;">
                    ✅ Отличный выбор! Этот сайт идеально соответствует вашим текущим оборотам.
                </div>
                ` : ''}
            </div>
            
            <div class="assessment-variants" style="margin-top: 20px;">
                <div class="variant-title">Сравнение всех типов сайтов:</div>
                ${Object.entries(assessment.assessments).map(([key, site]) => `
                    <div class="variant-row ${site.cssClass}">
                        <span class="variant-name">${site.name}</span>
                        <span class="variant-price">${formatMoney(site.minPrice)} – ${formatMoney(site.maxPrice)} ₽</span>
                        <span class="variant-verdict">${site.verdict}</span>
                    </div>
                `).join('')}
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
    updateDefaultCheck();
    
    const nicheSelect = document.getElementById('niche');
    if (nicheSelect) {
        nicheSelect.addEventListener('change', updateDefaultCheck);
    }
    
    const numericInputs = ['revenue', 'averageOrder'];
    numericInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
            });
        }
    });
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});
