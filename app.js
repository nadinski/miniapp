let currentStep = 1;

// ==================== КОНФИГУРАЦИЯ НИШ (реальные данные Яндекс.Директ) ====================
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

// ==================== ТИПЫ РЕШЕНИЙ (цены +20% к верхней границе) ====================
const SITE_OPTIONS = {
    subscription: {
        name: 'Лендинг по подписке',
        minPrice: 5000,
        maxPrice: 5000,
        avgPrice: 5000,
        timeToDevelop: '3-5 дней',
        description: 'Аренда сайта с правом выкупа. Минимальные вложения для старта, идеально для теста ниши.',
        isSubscription: true,
        tier: 'subscription'
    },
    simpleEcommerce: {
        name: 'Упрощённый интернет-магазин',
        minPrice: 40000,
        maxPrice: 100000,
        avgPrice: 70000,
        timeToDevelop: '1-2 недели',
        description: 'Шаблонное решение для старта онлайн-продаж. Корзина, каталог, приём платежей — всё необходимое для первых заказов.',
        isSubscription: false,
        tier: 'simple'
    },
    landing: {
        name: 'Лендинг (одностраничный сайт)',
        minPrice: 40000,
        maxPrice: 110000,
        avgPrice: 75000,
        timeToDevelop: '2-3 недели',
        description: 'Продающая страница для услуг. Высокая конверсия, быстрый запуск, идеально для привлечения заявок.',
        isSubscription: false,
        tier: 'landing'
    },
    multiPage: {
        name: 'Многостраничный сайт / Каталог',
        minPrice: 120000,
        maxPrice: 220000,
        avgPrice: 170000,
        timeToDevelop: '4-6 недель',
        description: 'Сайт с портфолио, услугами и блогом. Формирует доверие и экспертность, работает на SEO.',
        isSubscription: false,
        tier: 'multi'
    },
    ecommerce: {
        name: 'Интернет-магазин',
        minPrice: 180000,
        maxPrice: 420000,
        avgPrice: 300000,
        timeToDevelop: '2-3 месяца',
        description: 'Полноценный магазин: корзина, личный кабинет, интеграции с CRM и службами доставки, система скидок.',
        isSubscription: false,
        tier: 'ecommerce'
    },
    portal: {
        name: 'Портал / Маркетплейс',
        minPrice: 350000,
        maxPrice: 960000,
        avgPrice: 650000,
        timeToDevelop: '4-6 месяцев',
        description: 'Сложная экосистема: личные кабинеты продавцов и покупателей, рейтинги, сложная логика и интеграции.',
        isSubscription: false,
        tier: 'portal'
    },
    ecommercePlus: {
        name: 'Интернет-магазин + Мобильное приложение',
        minPrice: 600000,
        maxPrice: 1500000,
        avgPrice: 1050000,
        timeToDevelop: '4-6 месяцев',
        description: 'Максимальный охват: веб-версия + нативное приложение iOS/Android. Для оборотов от 1 млн ₽/мес.',
        isSubscription: false,
        tier: 'plus'
    }
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function formatMoney(amount) {
    return amount.toLocaleString('ru-RU');
}

function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const stepElement = document.getElementById(`step${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
        currentStep = step;
    }
}

function nextStep(step) {
    if (step === 2 && !validateStep1()) return;
    if (step === 2) updateDefaultCheck();
    showStep(step);
}

function prevStep(step) {
    showStep(step);
}

function validateStep1() {
    const revenueInput = document.getElementById('revenue');
    const revenue = parseInt(revenueInput.value.replace(/[^\d]/g, ''));
    if (!revenue || revenue < 1000) {
        alert('Укажите желаемую выручку (минимум 1 000 руб.)');
        return false;
    }
    return true;
}

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
            hintElement.textContent = `Рекомендуемый средний чек: ~${formatMoney(config.defaultCheck)} руб.`;
        }
    }
}

// ==================== РАСЧЁТ ОКУПАЕМОСТИ ====================
function calculateROI(sitePrice, monthlyAdBudget, revenue) {
    const marginRate = 0.35;
    const monthlyGrossProfit = revenue * marginRate;
    const monthlyNetProfit = monthlyGrossProfit - monthlyAdBudget;
    
    const paybackMonths = monthlyNetProfit > 0 
        ? Math.round((sitePrice / monthlyNetProfit) * 10) / 10 
        : Infinity;
    
    return {
        monthlyGrossProfit,
        monthlyNetProfit,
        paybackMonths,
        marginRate: marginRate * 100
    };
}

// ==================== УМНАЯ РЕКОМЕНДАЦИЯ РЕШЕНИЯ ====================
function recommendSiteType(reasonableBudget, needEcommerce) {
    // Если бюджет меньше 20 000 — всегда подписка
    if (reasonableBudget <= 20000) {
        return 'subscription';
    }
    
    // Бюджет 20 000 – 120 000 ₽
    if (reasonableBudget > 20000 && reasonableBudget <= 120000) {
        return needEcommerce ? 'simpleEcommerce' : 'landing';
    }
    
    // Бюджет 120 000 – 500 000 ₽
    if (reasonableBudget > 120000 && reasonableBudget <= 500000) {
        return needEcommerce ? 'ecommerce' : 'multiPage';
    }
    
    // Бюджет > 500 000 ₽
    return needEcommerce ? 'ecommercePlus' : 'portal';
}

// ==================== ПОЛУЧЕНИЕ АЛЬТЕРНАТИВ ====================
function getAlternatives(recommendedKey, needEcommerce, reasonableBudget) {
    const alternatives = [];
    
    // Вариант дешевле
    if (recommendedKey === 'landing' && reasonableBudget > 20000) {
        alternatives.push(SITE_OPTIONS.subscription);
    } else if (recommendedKey === 'multiPage') {
        alternatives.push(SITE_OPTIONS.landing);
    } else if (recommendedKey === 'ecommerce') {
        alternatives.push(SITE_OPTIONS.simpleEcommerce);
    } else if (recommendedKey === 'portal') {
        alternatives.push(SITE_OPTIONS.multiPage);
    } else if (recommendedKey === 'ecommercePlus') {
        alternatives.push(SITE_OPTIONS.ecommerce);
    }
    
    // Вариант дороже (если есть куда расти)
    if (recommendedKey === 'subscription') {
        alternatives.push(needEcommerce ? SITE_OPTIONS.simpleEcommerce : SITE_OPTIONS.landing);
    } else if (recommendedKey === 'simpleEcommerce') {
        alternatives.push(SITE_OPTIONS.ecommerce);
    } else if (recommendedKey === 'landing') {
        alternatives.push(SITE_OPTIONS.multiPage);
    } else if (recommendedKey === 'multiPage') {
        alternatives.push(SITE_OPTIONS.portal);
    } else if (recommendedKey === 'ecommerce') {
        alternatives.push(SITE_OPTIONS.ecommercePlus);
    }
    
    return alternatives.slice(0, 2); // Максимум 2 альтернативы
}

// ==================== ГЕНЕРАЦИЯ РЕКОМЕНДАЦИЙ ПО ОПТИМИЗАЦИИ ====================
function generateOptimizationTips(conversion, cpc, orders, visitors, monthlyNetProfit, adBudget, revenue) {
    const tips = [];
    
    // Конверсия
    if (conversion < 2.0) {
        tips.push('⚠️ Конверсия ниже 2% — оптимизируйте посадочную страницу, форму заявки и оффер.');
    } else if (conversion > 5.0) {
        tips.push('✅ Отличная конверсия! Увеличивайте рекламный бюджет для масштабирования.');
    }
    
    // CPC
    if (cpc > 100) {
        tips.push('💡 Высокая цена клика — используйте ретаргетинг, минус-слова и настройку на горячую аудиторию.');
    }
    
    // Количество заказов
    if (orders < 10) {
        tips.push('📊 Малый объём заказов — начните с тестового бюджета 30-50 тыс. руб. для сбора статистики.');
    }
    
    // Трафик
    if (visitors > 5000) {
        tips.push('🚀 Большой трафик — подключите CRM и сквозную аналитику для точного отслеживания ROI.');
    }
    
    // Прибыльность рекламы
    if (monthlyNetProfit <= 0) {
        tips.push('🔴 Реклама не окупается — пересмотрите связку "ниша-чек-конверсия" или оптимизируйте кампании.');
    }
    
    // Реклама съедает больше 50% валовой прибыли
    const grossProfit = revenue * 0.35;
    if (adBudget > grossProfit * 0.5) {
        tips.push('⚠️ Рекламный бюджет превышает 50% валовой прибыли — высокий риск. Оптимизируйте CPC и конверсию.');
    }
    
    return tips.length > 0 ? tips : ['✅ Все показатели в норме. Следуйте расчётам и масштабируйтесь.'];
}

// ==================== ОСНОВНОЙ РАСЧЁТ ====================
function calculate() {
    // Получение данных
    const revenueInput = document.getElementById('revenue');
    const averageOrderInput = document.getElementById('averageOrder');
    const needEcommerceCheckbox = document.getElementById('needEcommerce');
    
    const revenue = parseInt(revenueInput.value.replace(/[^\d]/g, ''));
    let averageOrder = parseInt(averageOrderInput.value.replace(/[^\d]/g, ''));
    const needEcommerce = needEcommerceCheckbox ? needEcommerceCheckbox.checked : false;
    const niche = document.getElementById('niche').value;
    
    // Подстановка дефолтного чека
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
    
    // Расчёты
    const config = NICHE_CONFIG[niche];
    const cpc = config.cpc;
    const conversionRate = config.conversion / 100;
    
    const ordersNeeded = Math.ceil(revenue / averageOrder);
    const visitorsNeeded = Math.ceil(ordersNeeded / conversionRate);
    const adBudget = Math.ceil(visitorsNeeded * cpc);
    
    const averageCtr = config.ctr / 100;
    const impressionsNeeded = Math.ceil(visitorsNeeded / averageCtr);
    const cpo = ordersNeeded > 0 ? Math.ceil(adBudget / ordersNeeded) : 0;
    
    // Разумный бюджет
    const minReasonable = Math.floor(revenue * 0.1);
    const optimalReasonable = Math.floor(revenue * 0.15);
    const maxReasonable = Math.floor(revenue * 0.2);
    
    // Умная рекомендация
    const recommendedKey = recommendSiteType(optimalReasonable, needEcommerce);
    const recommendedSite = SITE_OPTIONS[recommendedKey];
    
    // Расчёт ROI
    const roi = calculateROI(recommendedSite.avgPrice, adBudget, revenue);
    
    // Альтернативы
    const alternatives = getAlternatives(recommendedKey, needEcommerce, optimalReasonable);
    
    // Рекомендации по оптимизации
    const optimizationTips = generateOptimizationTips(
        config.conversion, cpc, ordersNeeded, visitorsNeeded, 
        roi.monthlyNetProfit, adBudget, revenue
    );
    
    // Отображение
    displayResults({
        ordersNeeded,
        visitorsNeeded,
        impressionsNeeded,
        adBudget,
        cpc,
        cpo,
        conversion: config.conversion,
        niche: config.name,
        revenue,
        averageOrder,
        needEcommerce,
        minReasonable,
        optimalReasonable,
        maxReasonable,
        recommendedSite,
        roi,
        alternatives,
        optimizationTips
    });
    
    showStep(3);
}

// ==================== ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ ====================
function displayResults(data) {
    const results = document.getElementById('results');
    
    const hasProfit = data.roi.monthlyNetProfit > 0;
    const netProfitDisplay = hasProfit 
        ? formatMoney(Math.floor(data.roi.monthlyNetProfit))
        : `-${formatMoney(Math.abs(Math.floor(data.roi.monthlyNetProfit)))}`;
    
    const roiText = data.roi.paybackMonths === Infinity 
        ? 'не окупится' 
        : `${data.roi.paybackMonths} мес.`;
    
    const optimizationHtml = data.optimizationTips
        .map(tip => `<div class="recommendation-item">${tip}</div>`)
        .join('');
    
    const alternativesHtml = data.alternatives.length > 0 ? `
        <div class="assessment-variants" style="margin-top: 20px;">
            <div class="variant-title">Альтернативные варианты:</div>
            ${data.alternatives.map(site => `
                <div class="variant-row">
                    <span class="variant-name">${site.name}</span>
                    <span class="variant-price">${formatMoney(site.minPrice)} – ${formatMoney(site.maxPrice)} ₽</span>
                    <span class="variant-verdict">${site.avgPrice < data.recommendedSite.avgPrice ? '🟢 Эконом-вариант' : 'Премиум-решение'}</span>
                </div>
            `).join('')}
        </div>
    ` : '';
    
    // Красный флаг при отрицательной прибыли
    const redFlagHtml = !hasProfit ? `
        <div class="result-section" style="background: #FEF2F2; border-left: 4px solid #E5484D;">
            <h3 style="color: #991B1B;">🚨 Требуется корректировка показателей</h3>
            <div style="padding: 12px 0;">
                <p style="font-size: 14px; color: #7F1D1D; margin-bottom: 12px; font-weight: 500;">
                    При текущих данных рекламный бюджет (${formatMoney(data.adBudget)} ₽) превышает валовую прибыль (${formatMoney(Math.floor(data.roi.monthlyGrossProfit))} ₽).
                </p>
                <p style="font-size: 13px; color: #991B1B; margin-bottom: 16px;">
                    Мы <strong>не рекомендуем</strong> вкладывать деньги в разработку сайта, пока бизнес-модель не скорректирована.
                </p>
                <div style="background: #FFFFFF; border-radius: 12px; padding: 14px;">
                    <div style="font-weight: 700; margin-bottom: 8px; color: #1E1B2E;">Что можно сделать:</div>
                    <ul style="padding-left: 20px; color: #4A5568; font-size: 13px; line-height: 1.8;">
                        <li>Увеличить средний чек (сейчас ${formatMoney(data.averageOrder)} ₽)</li>
                        <li>Повысить конверсию сайта (сейчас ${data.conversion}%)</li>
                        <li>Снизить цену клика — пересмотреть нишу или настройки рекламы</li>
                        <li>Скорректировать цель по выручке</li>
                    </ul>
                </div>
            </div>
        </div>
    ` : '';

    // ==================== ФОРМИРОВАНИЕ СООБЩЕНИЯ ДЛЯ TELEGRAM ====================
    function generateTelegramMessage(data) {
        const hasProfit = data.roi.monthlyNetProfit > 0;
        const netProfitDisplay = hasProfit 
            ? formatMoney(Math.floor(data.roi.monthlyNetProfit))
            : `-${formatMoney(Math.abs(Math.floor(data.roi.monthlyNetProfit)))}`;
        
        const roiText = data.roi.paybackMonths === Infinity 
            ? 'не окупится' 
            : `${data.roi.paybackMonths} мес.`;

        const message = `Добрый день, Надежда! Мне нужен сайт.

Исходные данные:
• Желаемая выручка: ${formatMoney(data.revenue)} ₽/мес
• Ниша: ${data.niche}
• Средний чек: ${formatMoney(data.averageOrder)} ₽
• Нужен интернет-магазин: ${data.needEcommerce ? 'Да' : 'Нет'}

Целевые показатели:
• Заказов в месяц: ${formatNumber(data.ordersNeeded)}
• Посетителей: ${formatNumber(data.visitorsNeeded)}
• Показов рекламы: ${formatNumber(data.impressionsNeeded)}

Рекламный бюджет:
• Месячный бюджет: ${formatMoney(data.adBudget)} ₽
• CPC: ${data.cpc} ₽
• CPO: ${formatMoney(data.cpo)} ₽
• Конверсия: ${data.conversion}%

Разумный бюджет на сайт:
• Оптимально: ${formatMoney(data.optimalReasonable)} ₽
• Коридор: ${formatMoney(data.minReasonable)} – ${formatMoney(data.maxReasonable)} ₽
• Чистая прибыль: ${netProfitDisplay} ₽/мес
• Окупаемость: ${roiText}

Рекомендованное решение:
• ${data.recommendedSite.name}
• Инвестиции: ${data.recommendedSite.isSubscription ? formatMoney(data.recommendedSite.avgPrice) + ' ₽/мес' : formatMoney(data.recommendedSite.minPrice) + ' – ' + formatMoney(data.recommendedSite.maxPrice) + ' ₽'}
• Срок запуска: ${data.recommendedSite.timeToDevelop}
• ${data.recommendedSite.description}`;

        // Экранируем специальные символы для Markdown
        return message
            .replace(/([*_`[\]()])/g, '\\$1')  // Экранируем спецсимволы
            .replace(/•/g, '\\•');  // Экранируем маркеры списка
    }

    // Формируем ссылку на Telegram
    const telegramUsername = 'nadinski'; // ⚠️ ЗАМЕНИ НА СВОЙ TELEGRAM USERNAME
    const telegramMessage = generateTelegramMessage(data);
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(telegramMessage)}`;
    
    results.innerHTML = `
        <!-- Блок 1: Целевые показатели -->
        <div class="result-section">
            <h3>🎯 Целевые показатели — ${data.niche}</h3>
            <div class="result-item">
                <strong>📦 Заказов в месяц:</strong>
                <span>${formatNumber(data.ordersNeeded)}</span>
            </div>
            <div class="result-item">
                <strong>👥 Посетителей:</strong>
                <span>${formatNumber(data.visitorsNeeded)}</span>
            </div>
            <div class="result-item">
                <strong>👁️ Показов рекламы:</strong>
                <span>${formatNumber(data.impressionsNeeded)}</span>
            </div>
        </div>
        
        <!-- Блок 2: Рекламный бюджет -->
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
        
        ${redFlagHtml}
        
        <!-- Блок 3: Разумный бюджет + Рекомендация -->
        <div class="result-section assessment-block">
            <h3>${hasProfit ? '🏦 Разумный бюджет на разработку' : '📊 Анализ бюджета'}</h3>
            <div class="assessment-main">
                <div class="assessment-value">
                    <span class="big-number">${formatMoney(data.optimalReasonable)} ₽</span>
                    <span class="assessment-label">— оптимальные инвестиции</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                    <div style="background: #F8FAFC; padding: 10px; border-radius: 12px;">
                        <div style="font-size: 11px; color: #64748B; text-transform: uppercase;">Окупаемость</div>
                        <div style="font-size: 20px; font-weight: 800; color: #1E1B2E;">${roiText}</div>
                    </div>
                    <div style="background: #F8FAFC; padding: 10px; border-radius: 12px;">
                        <div style="font-size: 11px; color: #64748B; text-transform: uppercase;">Чистая прибыль</div>
                        <div style="font-size: 20px; font-weight: 800; color: ${hasProfit ? '#059669' : '#E5484D'};">${netProfitDisplay} ₽</div>
                    </div>
                </div>
                
                <div class="assessment-range">
                    💰 Разумный коридор: <strong>${formatMoney(data.minReasonable)} – ${formatMoney(data.maxReasonable)} ₽</strong>
                    <span class="range-hint">(10-20% от месячного оборота ${formatMoney(data.revenue)} ₽)</span>
                </div>
            </div>
            
            ${hasProfit ? `
            <!-- Блок 4: Рекомендованное решение -->
            <div style="margin-top: 20px; background: #FFFFFF; border-radius: 18px; padding: 16px; border: 1px solid #F0E8DF;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 18px;">🏆</span>
                    <span style="font-weight: 700; color: #1E1B2E; text-transform: uppercase; font-size: 13px;">Рекомендованное решение</span>
                </div>
                
                <div style="background: linear-gradient(135deg, #6D3AFF08 0%, #FF9E2C08 100%); padding: 14px; border-radius: 14px; margin-bottom: 12px;">
                    <div style="font-size: 20px; font-weight: 800; color: #1E1B2E; margin-bottom: 6px;">${data.recommendedSite.name}</div>
                    <div style="font-size: 14px; color: #64748B; line-height: 1.5;">${data.recommendedSite.description}</div>
                </div>
                
                <div class="result-item">
                    <strong>💰 Инвестиции:</strong>
                    <span>${data.recommendedSite.isSubscription ? formatMoney(data.recommendedSite.avgPrice) + ' ₽/мес' : formatMoney(data.recommendedSite.minPrice) + ' – ' + formatMoney(data.recommendedSite.maxPrice) + ' ₽'}</span>
                </div>
                <div class="result-item">
                    <strong>⏳ Срок запуска:</strong>
                    <span>${data.recommendedSite.timeToDevelop}</span>
                </div>
                <div class="result-item">
                    <strong>📈 Окупаемость:</strong>
                    <span>${roiText}</span>
                </div>
                <div class="result-item" style="border-bottom: none; margin-bottom: 12px;">
                    <strong>💵 Чистая прибыль после рекламы:</strong>
                    <span><strong>${netProfitDisplay} ₽/мес</strong></span>
                </div>
                
                <a href="${telegramUrl}" target="_blank" class="btn-recommend">Хочу такой сайт</a>
            </div>
            ` : ''}
            
            ${alternativesHtml}
        </div>
        
        <!-- Блок 5: Рекомендации по оптимизации -->
        <div class="result-section">
            <h3>🎯 Рекомендации по оптимизации</h3>
            ${optimizationHtml}
        </div>
        
        <div class="result-footer">
            <small>* Расчёт на основе реальных данных Яндекс.Директ (2026). Отклонения ±20%.</small>
        </div>
    `;
}

// ==================== РЕСТАРТ ====================
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

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
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
