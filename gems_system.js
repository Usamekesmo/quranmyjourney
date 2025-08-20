// gems_system.js - نظام إدارة الجواهر في الواجهة الأمامية

/**
 * دوال إدارة الجواهر والمتجر
 * يجب تضمين هذا الملف في HTML بعد main.js
 */

// === متغيرات عامة ===
let userGems = 0;
let storeItems = [];
let userPurchases = [];

// === دوال إدارة الجواهر ===

/**
 * إضافة جواهر للمستخدم الحالي
 * @param {number} amount - عدد الجواهر المراد إضافتها
 * @param {string} reason - سبب الحصول على الجواهر
 */
async function addGems(amount, reason = 'اختبار مثالي') {
    if (!currentUser || amount <= 0) return false;
    
    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'addGems');
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('amount', amount);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            userGems = result.data.newTotal;
            currentUser.gems = userGems;
            updateGemsUI();
            
            // عرض رسالة تهنئة
            showGemsNotification(amount, reason);
            
            return true;
        } else {
            console.error('فشل في إضافة الجواهر:', result.error);
            return false;
        }
    } catch (error) {
        console.error('خطأ في إضافة الجواهر:', error);
        return false;
    }
}

/**
 * خصم جواهر من المستخدم
 * @param {number} amount - عدد الجواهر المراد خصمها
 */
async function spendGems(amount) {
    if (!currentUser || amount <= 0) return false;
    
    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'spendGems');
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('amount', amount);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            userGems = result.data.newTotal;
            currentUser.gems = userGems;
            updateGemsUI();
            return true;
        } else {
            alert(result.error);
            return false;
        }
    } catch (error) {
        console.error('خطأ في خصم الجواهر:', error);
        return false;
    }
}

/**
 * الحصول على رصيد الجواهر الحالي
 */
async function getGemsBalance() {
    if (!currentUser) return 0;
    
    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'getGemsBalance');
        url.searchParams.append('userId', currentUser.userId);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            userGems = result.data.gems;
            return userGems;
        }
    } catch (error) {
        console.error('خطأ في جلب رصيد الجواهر:', error);
    }
    
    return 0;
}

// === دوال واجهة المستخدم للجواهر ===

/**
 * تحديث عرض الجواهر في الواجهة
 */
function updateGemsUI() {
    const gemsElements = document.querySelectorAll('.user-gems');
    gemsElements.forEach(element => {
        element.textContent = userGems;
    });
    
    // تحديث عرض الجواهر في لوحة التحكم إذا كانت موجودة
    const gemsDisplay = document.getElementById('userGems');
    if (gemsDisplay) {
        gemsDisplay.textContent = `${userGems} 💎`;
    }
}

/**
 * عرض إشعار الحصول على جواهر
 * @param {number} amount - عدد الجواهر المكتسبة
 * @param {string} reason - سبب الحصول على الجواهر
 */
function showGemsNotification(amount, reason) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'gems-notification';
    notification.innerHTML = `
        <div class="gems-notification-content">
            <span class="gems-icon">💎</span>
            <span class="gems-text">+${amount} جوهرة</span>
            <span class="gems-reason">${reason}</span>
        </div>
    `;
    
    // إضافة الأنماط
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #ffd700, #ffed4e);
        color: #333;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        z-index: 1000;
        animation: slideInRight 0.5s ease-out;
        font-weight: bold;
        border: 2px solid #ffc107;
    `;
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// === دوال المتجر ===

/**
 * جلب منتجات المتجر
 */
async function loadStoreItems() {
    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'getStoreItems');
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            storeItems = result.data;
            return storeItems;
        } else {
            console.error('فشل في جلب منتجات المتجر:', result.error);
            return [];
        }
    } catch (error) {
        console.error('خطأ في جلب منتجات المتجر:', error);
        return [];
    }
}

/**
 * جلب مشتريات المستخدم
 */
async function loadUserPurchases() {
    if (!currentUser) return [];
    
    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'getUserPurchases');
        url.searchParams.append('userId', currentUser.userId);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            userPurchases = result.data;
            return userPurchases;
        } else {
            console.error('فشل في جلب مشتريات المستخدم:', result.error);
            return [];
        }
    } catch (error) {
        console.error('خطأ في جلب مشتريات المستخدم:', error);
        return [];
    }
}

/**
 * شراء منتج من المتجر
 * @param {string} itemId - معرف المنتج
 */
async function purchaseItem(itemId) {
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return false;
    }
    
    const item = storeItems.find(item => item.id === itemId);
    if (!item) {
        alert('المنتج غير موجود');
        return false;
    }
    
    // التأكد من الشراء
    const confirmPurchase = confirm(
        `هل تريد شراء "${item.name}" مقابل ${item.price} جوهرة؟\n\n${item.description}`
    );
    
    if (!confirmPurchase) return false;
    
    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'purchaseItem');
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('itemId', itemId);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            userGems = result.data.newGemsBalance;
            currentUser.gems = userGems;
            
            // إضافة المنتج إلى قائمة المشتريات
            userPurchases.push(result.data.purchaseRecord);
            
            // تحديث الواجهة
            updateGemsUI();
            updateStoreUI();
            
            alert(`تم شراء "${item.name}" بنجاح! 🎉`);
            return true;
        } else {
            alert(result.error);
            return false;
        }
    } catch (error) {
        console.error('خطأ في شراء المنتج:', error);
        alert('حدث خطأ أثناء الشراء. الرجاء المحاولة مرة أخرى.');
        return false;
    }
}

/**
 * التحقق من ملكية المستخدم لمنتج معين
 * @param {string} itemId - معرف المنتج
 */
function hasUserPurchased(itemId) {
    return userPurchases.some(purchase => purchase.itemId === itemId);
}

/**
 * الحصول على المنتجات المشتراة من فئة معينة
 * @param {string} category - فئة المنتجات
 */
function getPurchasedItemsByCategory(category) {
    return userPurchases
        .filter(purchase => {
            const item = storeItems.find(item => item.id === purchase.itemId);
            return item && item.category === category;
        })
        .map(purchase => {
            const item = storeItems.find(item => item.id === purchase.itemId);
            return { ...item, purchaseDate: purchase.purchaseDate };
        });
}

// === دوال فحص الجواهر بعد الاختبارات ===

/**
 * فحص استحقاق الجواهر بعد انتهاء الاختبار
 * @param {number} score - النتيجة المحققة
 * @param {number} totalQuestions - إجمالي الأسئلة
 * @param {boolean} isPerfectStreak - هل هذا جزء من سلسلة نجاح مثالية
 */
async function checkGemsReward(score, totalQuestions, isPerfectStreak = false) {
    let gemsEarned = 0;
    let reason = '';
    
    // جوهرة واحدة للاختبار المثالي (100%)
    if (score === totalQuestions) {
        gemsEarned += 1;
        reason = 'اختبار مثالي 100%';
        
        // مكافأة إضافية لسلسلة النجاح
        if (isPerfectStreak) {
            gemsEarned += 1;
            reason = 'اختبار مثالي + سلسلة نجاح';
        }
    }
    
    // إضافة الجواهر إذا كان هناك استحقاق
    if (gemsEarned > 0) {
        await addGems(gemsEarned, reason);
        return gemsEarned;
    }
    
    return 0;
}

// === تهيئة النظام ===

/**
 * تهيئة نظام الجواهر عند تحميل الصفحة
 */
async function initializeGemsSystem() {
    if (currentUser) {
        userGems = currentUser.gems || 0;
        await loadStoreItems();
        await loadUserPurchases();
        updateGemsUI();
    }
}

// === إضافة الأنماط CSS للإشعارات ===
const gemsStyles = document.createElement('style');
gemsStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .gems-notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .gems-icon {
        font-size: 20px;
    }
    
    .gems-text {
        font-size: 16px;
        font-weight: bold;
    }
    
    .gems-reason {
        font-size: 12px;
        opacity: 0.8;
    }
`;

document.head.appendChild(gemsStyles);

