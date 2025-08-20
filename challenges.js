// challenges.js - النسخة النهائية الكاملة

/**
 * يعرض التحديات اليومية والخاصة في الحاوية المخصصة.
 * @param {object} user - كائن المستخدم الحالي.
 * @param {HTMLElement} container - العنصر الذي سيحتوي على بطاقات التحديات.
 */
async function displayChallenges(user, container) {
    if (!container) return;
    container.innerHTML = '<p>جاري تحميل التحديات...</p>';

    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'getChallenges');
        url.searchParams.append('userId', user.userId);

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'فشل جلب بيانات التحديات.');
        }

        container.innerHTML = '';
        const challenges = result.data;

        // عرض التحدي اليومي إن وجد
        if (challenges.daily) {
            const daily = challenges.daily;
            const challengeCard = document.createElement('div');
            challengeCard.className = 'challenge-card daily';
            
            challengeCard.innerHTML = `
                <h3>${daily.title}</h3>
                <p>${daily.description}</p>
                <div class="challenge-progress">
                    <span>التقدم اليومي: ${daily.testsToday} / 5</span>
                </div>
                <p class="challenge-instruction">
                    💡 لتفعيل التحدي، أدخل رقم الصفحة <strong>${daily.page}</strong> في قسم "اختر اختبارك" بالأعلى وابدأ الاختبار.
                </p>
            `;
            container.appendChild(challengeCard);
        }

        // عرض التحديات الخاصة إن وجدت
        if (challenges.special && challenges.special.length > 0) {
            challenges.special.forEach(special => {
                const challengeCard = document.createElement('div');
                challengeCard.className = 'challenge-card special';
                challengeCard.innerHTML = `
                    <h3>${special.title} (${special.type})</h3>
                    <p>${special.description}</p>
                    <div class="challenge-progress">
                        <span>ينتهي في: ${new Date(special.endDate).toLocaleDateString('ar-EG')}</span>
                        <span>المكافأة: ${special.reward} XP</span>
                    </div>
                `;
                container.appendChild(challengeCard);
            });
        }

        // رسالة في حال عدم وجود أي تحديات
        if (container.innerHTML === '') {
            container.innerHTML = '<p>لا توجد تحديات نشطة حالياً. ترقب الجديد!</p>';
        }

    } catch (error) {
        console.error('Failed to load challenges:', error);
        container.innerHTML = '<p style="color: red;">حدث خطأ أثناء تحميل التحديات.</p>';
    }
}

/**
 * يتحقق من تقدم المستخدم في التحدي اليومي بعد كل اختبار.
 * @param {number} testedPage - رقم الصفحة التي اختبرها المستخدم.
 * @param {object} user - كائن المستخدم الحالي.
 */
async function checkDailyChallengeProgress(testedPage, user) {
    try {
        // أولاً، نحصل على بيانات التحدي الحالية للتأكد من أنها لم تتغير
        const urlGet = new URL(GOOGLE_SCRIPT_URL);
        urlGet.searchParams.append('action', 'getChallenges');
        urlGet.searchParams.append('userId', user.userId);
        const responseGet = await fetch(urlGet);
        const resultGet = await responseGet.json();

        if (!resultGet.success || !resultGet.data.daily) return;

        const dailyChallenge = resultGet.data.daily;

        // التحقق من أن الصفحة المختبرة تطابق صفحة التحدي
        // الإصلاح الحاسم: تحويل صفحة التحدي إلى رقم قبل المقارنة
        if (testedPage !== parseInt(dailyChallenge.page)) {
            console.log(`Test page (${testedPage}) does not match daily challenge page (${dailyChallenge.page}).`);
            return;
        }

        // زيادة عدد الاختبارات المنجزة اليوم ومنح النقاط
        let testsToday = parseInt(dailyChallenge.testsToday) + 1;
        let xpGained = 0;

        // منح النقاط في خطوات محددة (الاختبار الأول، الثالث، الخامس)
        if (testsToday === 1) xpGained = 10;
        else if (testsToday === 3) xpGained = 40;
        else if (testsToday === 5) xpGained = 50;

        if (xpGained > 0) {
            await addXP(xpGained); // استدعاء الدالة العامة من main.js
            alert(`تهانينا! لقد حصلت على ${xpGained} نقطة إضافية من التحدي اليومي!`);
        }

        // إرسال التحديث إلى الخادم
        const urlUpdate = new URL(GOOGLE_SCRIPT_URL);
        urlUpdate.searchParams.append('action', 'updateDailyChallenge');
        urlUpdate.searchParams.append('userId', user.userId);
        urlUpdate.searchParams.append('testsToday', testsToday);

        const responseUpdate = await fetch(urlUpdate);
        const resultUpdate = await responseUpdate.json();

        if (resultUpdate.success) {
            console.log("Daily challenge progress updated on server.");
        } else {
            console.error("Failed to update daily challenge on server:", resultUpdate.error);
        }

    } catch (error) {
        console.error("Error in checkDailyChallengeProgress:", error);
    }
}