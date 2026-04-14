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

// Данные о сайтах (расширенная версия с подпиской и апгрейдами)
const SITE_OPTIONS = {
    subscription: {
        name: 'Лендинг по подписке',
        minPrice: 5000,
        maxPrice: 5000,
        avgPrice: 5000,
        timeToDevelop: '3-5 дней',
        description: 'Аренда с правом выкупа. Минимальные вложения для старта.',
        isSubscription: true
    },
    landing: {
        name: 'Лендинг (одностраничный сайт)',
        minPrice: 40000,
        maxPrice: 90000,
        avgPrice: 65000,
        timeToDevelop: '2-3 недели',
        description: 'Идеально для услуг и быстрого старта.'
    },
    multiPage: {
        name: 'Многостраничный сайт / Каталог',
        minPrice: 90000,
        maxPrice: 180000,
        avgPrice: 135000,
        timeToDevelop: '4-6 недель',
        description: 'Для компаний с портфолио и большим количеством услуг.'
    },
    simpleEcommerce: {
        name: 'Упрощённый интернет-магазин',
        minPrice: 120000,
        maxPrice: 200000,
        avgPrice: 160000,
        timeToDevelop: '3-4 недели',
        description: 'Шаблонное решение для старта продаж. Базовый функционал, быстрый запуск.'
    },
    ecommerce: {
        name: 'Интернет-магазин',
        minPrice: 150000,
        maxPrice: 350000,
        avgPrice: 250000,
        timeToDevelop: '2-3 месяца',
        description: 'Полноценный магазин с корзиной, личным кабинетом и интеграциями.'
    },
    ecommercePlus: {
        name: 'Интернет-магазин + Мобильное приложение',
        minPrice: 500000,
        maxPrice: 1200000,
        avgPrice: 850000,
        timeToDevelop: '3-5 месяцев',
        description: 'Для оборотов от 1 млн ₽/мес. Полноценная экосистема с приложением.'
    },
    portal: {
        name: 'Портал / Маркетплейс',
        minPrice: 350000,
        maxPrice: 800000,
        avgPrice: 575000,
        timeToDevelop: '4-6 месяцев',
        description: 'Сложные решения с большим функционалом и интеграциями.'
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
    const maxReasonable = Math.floor(revenue * 0.2);
    
    // Но не больше 6 месячных чистых прибылей
    const maxByProfit = Math.floor(monthlyNetProfit * 6);
    const cappedMaxReasonable = Math.min(maxReasonable, maxByProfit);
    
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
    
    // Находим оптимальный тип сайта
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

// Умный подбор типа сайта на основе оборота и потребности в магазине
function recommendSiteType(revenue, needEcommerce) {
    const monthlyRevenue = revenue;
    
    // Если нужен магазин
    if (needEcommerce) {
        if (monthlyRevenue < 150000) {
            return 'simpleEcommerce'; // Упрощённый магазин
        } else if (monthlyRevenue < 500000) {
            return 'ecommerce'; // Обычный магазин
        } else {
            return 'ecommercePlus'; // Магазин + приложение
        }
    }
    
    // Если магазин не нужен (услуги)
    if (monthlyRevenue < 80000) {
        return 'subscription'; // Подписка
    } else if (monthlyRevenue < 250000) {
        return 'landing'; // Лендинг
    } else if (monthlyRevenue < 600000) {
        return 'multiPage'; // Многостраничник
    } else {
        return 'portal'; // Портал
    }
}

// Основной расчёт
function calculate() {
    const revenueInput = document.getElementById('revenue');
    const averageOrderInput = document.getElementById('averageOrder');
    const needEcommerceCheckbox = document.getElementById('needEcommerce');
    
    const revenue = parseInt(revenueInput.value.replace(/[^\d]/g, ''));
    let averageOrder = parseInt(averageOrderInput.value.replace(/[^\d]/g, ''));
    const needEcommerce = needEcommerceCheckbox ? needEcommerceCheckbox.checked : false;
    
    const niche = document.getElementById('niche').value;
    
    if (!averageOrder || isNaN(averageOrder)) {
        averageOrder = NICHE_CONFIG[niche].defaultCheck;
        averageOrderInput.value = averageOrder;
    }
    
    if (!revenue || revenue < 1000) {
        alert('Укажите желаемую выручку (минимум 1 000 руб.)');
        return;
    }
    
    if (!averageOrder || averageOrder < 500) {
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
    const cpo = ordersNeeded > 0 ? Math.ceil(adBudget / ordersNeeded) : 0;
    
    // Расчёт разумного бюджета
    const budgetAssessment = assessReasonableSiteBudget(revenue, averageOrder, adBudget);
    
    // УМНАЯ РЕКОМЕНДАЦИЯ
    const recommendedSiteKey = recommendSiteType(revenue, needEcommerce);
    
    const siteConfig = SITE_OPTIONS[recommendedSiteKey];
    const siteBudget = {
        min: siteConfig.minPrice,
        max: siteConfig.maxPrice,
        avg: siteConfig.avgPrice,
        name: siteConfig.name,
        timeToDevelop: siteConfig.timeToDevelop,
        description: siteConfig.description || '',
        isSubscription: siteConfig.isSubscription || false,
        recommendedKey: recommendedSiteKey
    };
    
    const roi = calculateROI(siteBudget.avg, adBudget, revenue, averageOrder);
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
        needEcommerce,
        recommendedSiteKey
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
        
        <div class="result-section assessment-block">
            <h3>🏦 ${data.siteBudget.isSubscription ? 'Стартовое решение' : 'Разумный бюджет на разработку'}</h3>
            <div class="assessment-main">
                <div class="assessment-value">
                    <span class="big-number">${formatMoney(data.siteBudget.isSubscription ? data.siteBudget.avg : assessment.optimalReasonable)} ₽</span>
                    <span class="assessment-label">— ${data.siteBudget.isSubscription ? 'в месяц' : 'оптимальные инвестиции'}</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                    <div style="background: #f8fafc; padding: 10px; border-radius: 12px;">
                        <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Окупаемость</div>
                        <div style="font-size: 20px; font-weight: 800; color: #1e1b2e;">${data.roi.paybackMonths === Infinity ? '—' : data.roi.paybackMonths + ' мес.'}</div>
                    </div>
                    <div style="background: #f8fafc; padding: 10px; border-radius: 12px;">
                        <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Чистая прибыль</div>
                        <div style="font-size: 20px; font-weight: 800; color: #059669;">${formatMoney(Math.max(0, Math.floor(data.roi.monthlyNetProfit)))} ₽</div>
                    </div>
                </div>
                
                ${!data.siteBudget.isSubscription ? `
                <div class="assessment-range">
                    💰 Разумный коридор: <strong>${formatMoney(assessment.minReasonable)} – ${formatMoney(assessment.maxReasonable)} ₽</strong>
                    <span class="range-hint">(10-20% от месячного оборота)</span>
                </div>
                ` : ''}
                
                <div class="assessment-note">
                    ${data.siteBudget.isSubscription ? 
                        `💡 Стартовое решение для оборота ${formatMoney(data.revenue)} ₽/мес. Аренда сайта с правом выкупа.` :
                        `💡 При обороте <strong>${formatMoney(data.revenue)} ₽/мес</strong> и чистой прибыли <strong>${formatMoney(Math.max(0, Math.floor(assessment.monthlyNetProfit)))} ₽/мес</strong>`
                    }
                </div>
            </div>
            
            <div style="margin-top: 20px; background: #ffffff; border-radius: 18px; padding: 16px; border: 1px solid #f0e8df;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 18px;">🎯</span>
                    <span style="font-weight: 700; color: #1e1b2e; text-transform: uppercase; font-size: 13px;">Рекомендованное решение</span>
                </div>
                
                <div style="background: linear-gradient(135deg, #6d3aff08 0%, #ff9e2c08 100%); padding: 12px; border-radius: 14px; margin-bottom: 12px;">
                    <div style="font-size: 18px; font-weight: 800; color: #1e1b2e; margin-bottom: 4px;">${data.siteBudget.name}</div>
                    <div style="font-size: 13px; color: #64748b;">${data.siteBudget.description}</div>
                </div>
                
                <div class="result-item">
                    <strong>💰 Стоимость:</strong>
                    <span>${data.siteBudget.isSubscription ? formatMoney(data.siteBudget.avg) + ' ₽/мес' : formatMoney(data.siteBudget.min) + ' – ' + formatMoney(data.siteBudget.max) + ' ₽'}</span>
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
                    <span><strong>${formatMoney(Math.max(0, Math.floor(data.roi.monthlyNetProfit)))} ₽/мес</strong></span>
                </div>
            </div>
            
            <div class="assessment-variants" style="margin-top: 20px;">
                <div class="variant-title">Альтернативные варианты:</div>
                ${Object.entries(assessment.assessments)
                    .filter(([key]) => key !== data.recommendedSiteKey && key !== 'subscription')
                    .slice(0, 3)
                    .map(([key, site]) => `
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
    const needEcommerceCheckbox = document.getElementById('needEcommerce');
    if (needEcommerceCheckbox) {
        needEcommerceCheckbox.checked = false;
    }
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
