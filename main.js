// main.js - النسخة النهائية مع جميع أنواع الاختبارات الجديدة

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_3Q0Vib_WaJQT_pzesr2yn_sw-hsuwpqJN2g3iBuJVSXZlkq5AyXq5LudmCEie-K3LA/exec';
let currentUser = null;

// --- دوال عامة متاحة للملفات الأخرى ---
async function addXP(points) {
    if (!currentUser || points === 0) return;
    currentUser.xp += points;
    updateGamificationUI(currentUser);
    
    try {
        const { level, stage } = calculateLevelAndStage(currentUser.xp);
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'updateUserData');
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('xp', currentUser.xp);
        url.searchParams.append('level', level);
        url.searchParams.append('stage', stage);
        url.searchParams.append('testedPages', JSON.stringify(currentUser.testedPages || []));

        const response = await fetch(url);
        const result = await response.json();
        if (result.success) console.log("User data updated.");
    } catch (error) {
        console.error('Failed to update user data:', error);
    }
}

function updateGamificationUI(user) {
    const { stage, level, xpForNextLevel, progressXP, baseXPForLevel } = calculateLevelAndStage(user.xp);
    document.getElementById('userTitle').textContent = getTitle(stage, level);
    document.getElementById('userXP').textContent = user.xp;
    document.getElementById('userLevel').textContent = `${level} / ${STAGES[stage].levels}`;
    
    const progressPercentage = (progressXP / baseXPForLevel) * 100;
    const progressBar = document.getElementById('levelProgress');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${Math.round(progressPercentage)}%`;
    
    document.getElementById('progressText').textContent = (xpForNextLevel === Infinity) ?
        'لقد وصلت إلى أعلى مستوى!' : `النقاط المطلوبة للمستوى التالي: ${xpForNextLevel}`;
    
    // تحديث عرض الجواهر
    const gemsElement = document.getElementById('userGems');
    if (gemsElement) {
        gemsElement.textContent = `${user.gems || 0} 💎`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- متغيرات حالة الاختبار ---
    let allAyahs = [];
    let score = 0;
    let questionsAsked = 0;
    let totalQuestions = 5;
    let testedScope = [];
    let perfectStreak = 0; // متغير لتتبع سلسلة النجاح المثالية
    
    const reciters = {
        "ar.alafasy": "مشاري راشد العفاسي", 
        "ar.abdulsamad": "عبد الباسط عبد الصمد", 
        "ar.sudais": "عبد الرحمن السديس",
        "ar.mahermuaiqly": "ماهر المعيقلي", 
        "ar.minshawi": "محمد صديق المنشاوي"
    };

    // --- عناصر الواجهة ---
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const profileSection = document.getElementById('profileSection');
    const quizArea = document.getElementById('quizArea');
    const resultsSection = document.getElementById('resultsSection');
    const storeSection = document.getElementById('storeSection');
    const loginBtn = document.getElementById('loginBtn');
    const fullNameInput = document.getElementById('fullNameInput');
    const nameError = document.getElementById('nameError');
    const startTestBtn = document.getElementById('startTestBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const profileBtn = document.getElementById('profileBtn');
    const storeBtn = document.getElementById('storeBtn');
    const backToDashboardFromProfileBtn = document.getElementById('backToDashboardFromProfileBtn');
    const backToDashboardFromStoreBtn = document.getElementById('backToDashboardFromStoreBtn');
    const challengesContainer = document.getElementById('challengesContainer');
    const quranGrid = document.getElementById('quran-grid');
    const loader = document.getElementById('loader');
    const quizContent = document.getElementById('quizContent');
    const questionText = document.getElementById('questionText');
    const audioPlayer = document.getElementById('audioPlayer');
    const answerContainer = document.getElementById('answer-container');
    const resultMessage = document.getElementById('resultMessage');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');

    // --- ربط الأحداث ---
    loginBtn.addEventListener('click', handleLogin);
    startTestBtn.addEventListener('click', startTest);
    backToDashboardBtn.addEventListener('click', handleBackToDashboard);
    profileBtn.addEventListener('click', showProfile);
    if (storeBtn) storeBtn.addEventListener('click', showStore);
    backToDashboardFromProfileBtn.addEventListener('click', handleBackToDashboard);
    if (backToDashboardFromStoreBtn) backToDashboardFromStoreBtn.addEventListener('click', handleBackToDashboard);
    nextQuestionBtn.addEventListener('click', nextQuestion);

    // --- الدوال الرئيسية ---
    async function handleLogin() {
        const fullName = fullNameInput.value.trim();
        if (fullName.length > 20 || fullName.split(' ').length < 2) {
            nameError.classList.remove('hidden');
            return;
        }
        nameError.classList.add('hidden');
        loginBtn.disabled = true;
        loginBtn.textContent = 'جاري الدخول...';

        try {
            const url = new URL(GOOGLE_SCRIPT_URL);
            url.searchParams.append('action', 'getUserData');
            url.searchParams.append('userId', fullName);
            url.searchParams.append('fullName', fullName);
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (!result.success || !result.data) throw new Error(result.error || "بيانات الخادم غير صالحة.");
            
            currentUser = result.data;
            
            // تهيئة نظام الجواهر
            await initializeGemsSystem();
            
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            updateUI(currentUser);
        } catch (error) {
            alert(`فشل تسجيل الدخول: ${error.message}`);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'دخول / إنشاء حساب';
        }
    }

    function handleBackToDashboard() {
        resultsSection.classList.add('hidden');
        profileSection.classList.add('hidden');
        if (storeSection) storeSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        updateUI(currentUser);
    }

    function updateUI(user) {
        if (!user) return;
        document.getElementById('welcomeMessage').textContent = `مرحباً يا ${user.fullName}!`;
        updateGamificationUI(user);
        updateTestSelectionUI(user);
        displayChallenges(user, challengesContainer);
    }

    function updateTestSelectionUI(user) {
        const { stage } = calculateLevelAndStage(user.xp);
        const stageInfo = STAGES[stage];
        const testOptionsContainer = document.getElementById('testOptionsContainer');
        const scopeContainer = document.getElementById('scopeSelectionContainer');
        const stageTitleElement = document.getElementById('stageTitle');

        if (!testOptionsContainer || !scopeContainer || !stageTitleElement) {
            console.error("Critical UI elements are missing.");
            return;
        }

        let optionsHtml = '', scopeHtml = '';
        stageTitleElement.textContent = `أنت في المرحلة ${stage}: ${stageInfo.name}.`;

        // حساب عدد الأسئلة مع مراعاة المنتجات المشتراة
        let questionsCount = Math.min(15, 5 * stage);
        const extraQuestions = getPurchasedItemsByCategory('questions');
        if (extraQuestions.length > 0) {
            questionsCount += extraQuestions.length * 5;
        }

        // حساب القراء المتاحين مع مراعاة المنتجات المشتراة
        let availableRecitersCount = Math.min(Object.keys(reciters).length, stage);
        const extraReciters = getPurchasedItemsByCategory('reciters');
        availableRecitersCount += extraReciters.length;

        optionsHtml += `<label for="numQuestions">عدد الأسئلة:</label><input type="number" id="numQuestions" value="${questionsCount}" min="${5 * stage}" max="${questionsCount}">`;
        optionsHtml += `<label for="reciter">اختر الشيخ:</label><select id="reciter">`;
        
        const allReciters = Object.entries(reciters);
        for (let i = 0; i < Math.min(availableRecitersCount, allReciters.length); i++) {
            const [id, name] = allReciters[i];
            optionsHtml += `<option value="${id}">${name}</option>`;
        }
        optionsHtml += `</select>`;
        testOptionsContainer.innerHTML = optionsHtml;

        // منطق اختيار النطاق
        switch (stage) {
            case 1:
                scopeHtml = `<p>في هذه المرحلة، يمكنك الاختبار في صفحة واحدة فقط.</p><label for="pageNumber">اختر رقم الصفحة (1 - 604):</label><input type="number" id="pageNumber" min="1" max="604" value="1">`;
                break;
            case 2: case 3: case 4:
                scopeHtml = `<p>أحسنت! يمكنك الآن الاختبار في نطاق من <strong>${stage} صفحات متتالية</strong>.</p><label for="startPage">اختر صفحة البداية:</label><input type="number" id="startPage" min="1" max="${605 - stage}" value="1"><label for="endPage">صفحة النهاية (تلقائي):</label><input type="number" id="endPage" value="${stage}" readonly style="background-color: #e9ecef;">`;
                break;
            case 5:
                scopeHtml = `<p>مبارك! يمكنك الآن الاختبار في نطاق صفحات، أو جزء كامل، أو سورة كاملة.</p><label for="scopeType">اختر نوع النطاق:</label><select id="scopeType"><option value="range">نطاق صفحات</option><option value="juz">جزء كامل</option><option value="surah">سورة كاملة</option></select><div id="scopeInputs"></div>`;
                break;
        }
        scopeContainer.innerHTML = scopeHtml;

        if (stage >= 2 && stage <= 4) {
            const startInput = document.getElementById('startPage');
            if (startInput) startInput.addEventListener('input', () => {
                document.getElementById('endPage').value = Math.min(604, (parseInt(startInput.value) || 1) + stage - 1);
            });
        } else if (stage === 5) {
            const scopeTypeSelect = document.getElementById('scopeType');
            if (scopeTypeSelect) {
                scopeTypeSelect.addEventListener('change', handleScopeTypeChange);
                handleScopeTypeChange();
            }
        }
    }

    function handleScopeTypeChange() { 
        // منطق تغيير النطاق في المرحلة 5
    }

    async function startTest() {
        const reciterSelect = document.getElementById('reciter');
        const numQuestionsInput = document.getElementById('numQuestions');
        
        if (!reciterSelect || !numQuestionsInput) {
            alert("خطأ في الواجهة: لم يتم العثور على عناصر الاختبار. الرجاء تحديث الصفحة.");
            return;
        }
        
        const selectedReciter = reciterSelect.value;
        totalQuestions = parseInt(numQuestionsInput.value) || 5;
        const { stage } = calculateLevelAndStage(currentUser.xp);
        testedScope = [];
        let apiUrl = '';

        try {
            switch (stage) {
                case 1:
                    const page = document.getElementById('pageNumber').value;
                    apiUrl = `https://api.alquran.cloud/v1/page/${page}/${selectedReciter}`;
                    testedScope.push(parseInt(page));
                    break;
                case 2: case 3: case 4:
                    const startPage = parseInt(document.getElementById('startPage').value);
                    const endPage = parseInt(document.getElementById('endPage').value);
                    apiUrl = { type: 'range', start: startPage, end: endPage, reciter: selectedReciter };
                    for (let i = startPage; i <= endPage; i++) testedScope.push(i);
                    break;
                case 5:
                    // منطق المرحلة الخامسة
                    break;
            }

            dashboardSection.classList.add('hidden');
            quizArea.classList.remove('hidden');
            loader.classList.remove('hidden');
            quizContent.classList.add('hidden');
            loader.textContent = 'جاري تحميل بيانات الآيات...';

            allAyahs = [];
            if (typeof apiUrl === 'string') {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('فشل في جلب البيانات.');
                const data = await response.json();
                allAyahs = data.data.ayahs;
            } else if (apiUrl.type === 'range') {
                for (let i = apiUrl.start; i <= apiUrl.end; i++) {
                    const response = await fetch(`https://api.alquran.cloud/v1/page/${i}/${apiUrl.reciter}`);
                    if (!response.ok) throw new Error(`فشل جلب صفحة ${i}`);
                    const data = await response.json();
                    allAyahs.push(...data.data.ayahs);
                }
            }

            if (allAyahs.length < 4) throw new Error('لا يوجد عدد كافٍ من الآيات في هذا النطاق.');
            score = 0;
            questionsAsked = 0;
            nextQuestion();
        } catch (error) {
            loader.textContent = `خطأ: ${error.message}`;
            quizArea.innerHTML += `<button class="main-btn" onclick="location.reload()">العودة</button>`;
        }
    }

    function nextQuestion() {
        if (questionsAsked >= totalQuestions) {
            showFinalResults();
            return;
        }
        questionsAsked++;
        resetUIForNewQuestion();
        
        // اختيار نوع سؤال بناءً على المنتجات المشتراة
        const availableQuestionTypes = getAvailableQuestionTypes();
        const type = availableQuestionTypes[Math.floor(Math.random() * availableQuestionTypes.length)];
        
        executeQuestionType(type);
    }

    // دالة للحصول على أنواع الأسئلة المتاحة
    function getAvailableQuestionTypes() {
        let types = ['mcq_next_ayah', 'mcq_previous_ayah'];
        
        // إضافة أنواع أسئلة جديدة بناءً على المشتريات
        if (hasUserPurchased('question_type_sequence')) {
            types.push('sequence_ayahs_3', 'sequence_ayahs_4', 'sequence_ayahs_5');
        }
        if (hasUserPurchased('question_type_intruder')) {
            types.push('find_intruder_3', 'find_intruder_4', 'find_intruder_5');
        }
        if (hasUserPurchased('question_type_location')) {
            types.push('ayah_location', 'page_number', 'ayah_number');
        }
        if (hasUserPurchased('question_type_completion')) {
            types.push('complete_ayah_5', 'complete_ayah_4', 'complete_ayah_3', 'complete_ayah_2');
        }
        
        return types;
    }

    // دالة تنفيذ نوع السؤال المحدد
    function executeQuestionType(type) {
        switch (type) {
            // الأنواع الأساسية
            case 'mcq_next_ayah':
                setupMCQ_NextAyah();
                break;
            case 'mcq_previous_ayah':
                setupMCQ_PreviousAyah();
                break;
            
            // اختبارات ترتيب الآيات
            case 'sequence_ayahs_3':
                setupSequenceAyahs3();
                break;
            case 'sequence_ayahs_4':
                setupSequenceAyahs4();
                break;
            case 'sequence_ayahs_5':
                setupSequenceAyahs5();
                break;
            
            // اختبارات الآية الدخيلة
            case 'find_intruder_3':
                setupFindIntruder3();
                break;
            case 'find_intruder_4':
                setupFindIntruder4();
                break;
            case 'find_intruder_5':
                setupFindIntruder5();
                break;
            
            // اختبارات تحديد الموقع
            case 'ayah_location':
                setupAyahLocation();
                break;
            case 'page_number':
                setupPageNumber();
                break;
            case 'ayah_number':
                setupAyahNumber();
                break;
            
            // اختبارات إكمال الآيات
            case 'complete_ayah_5':
                setupCompleteAyah5Words();
                break;
            case 'complete_ayah_4':
                setupCompleteAyah4Words();
                break;
            case 'complete_ayah_3':
                setupCompleteAyah3Words();
                break;
            case 'complete_ayah_2':
                setupCompleteAyah2Words();
                break;
            
            default:
                setupMCQ_NextAyah(); // الافتراضي
        }
    }

    // الدوال الأساسية للاختبارات الموجودة
    function setupMCQ_NextAyah() {
        questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: اختر الآية التالية:`;
        const questionIndex = Math.floor(Math.random() * (allAyahs.length - 1));
        const questionAyah = allAyahs[questionIndex];
        const correctAnswer = allAyahs[questionIndex + 1];
        audioPlayer.src = questionAyah.audio;
        const wrongChoices = allAyahs.filter(a => a.number !== correctAnswer.number && a.number !== questionAyah.number).sort(() => 0.5 - Math.random()).slice(0, 3);
        createChoiceButtons(shuffleArray([correctAnswer, ...wrongChoices]), correctAnswer);
    }

    function setupMCQ_PreviousAyah() {
        questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: اختر الآية السابقة:`;
        const questionIndex = Math.floor(Math.random() * (allAyahs.length - 1)) + 1;
        const questionAyah = allAyahs[questionIndex];
        const correctAnswer = allAyahs[questionIndex - 1];
        audioPlayer.src = questionAyah.audio;
        const wrongChoices = allAyahs.filter(a => a.number !== correctAnswer.number && a.number !== questionAyah.number).sort(() => 0.5 - Math.random()).slice(0, 3);
        createChoiceButtons(shuffleArray([correctAnswer, ...wrongChoices]), correctAnswer);
    }

    function createChoiceButtons(choices, correctAnswer) {
        const choicesContainer = document.createElement('div');
        choicesContainer.id = 'choices-container';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn ayah-text';
            button.textContent = choice.text;
            button.onclick = () => {
                choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
                showResult(choice.number === correctAnswer.number, button, `الإجابة الصحيحة: <div class="ayah-text">${correctAnswer.text}</div>`);
            };
            choicesContainer.appendChild(button);
        });
        answerContainer.appendChild(choicesContainer);
    }

    function showResult(isCorrect, selectedButton, detailedAnswer) {
        if (isCorrect) {
            score++;
            resultMessage.textContent = 'إجابة صحيحة! أحسنت.';
            resultMessage.className = 'resultMessage correct-msg';
            selectedButton.classList.add('correct');
        } else {
            resultMessage.innerHTML = `إجابة خاطئة. ${detailedAnswer}`;
            resultMessage.className = 'resultMessage incorrect-msg';
            selectedButton.classList.add('incorrect');
        }
        resultMessage.classList.remove('hidden');
        nextQuestionBtn.classList.remove('hidden');
    }

    async function showFinalResults() {
        quizArea.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        const xpGained = score * 10;
        const isPerfect = (score === totalQuestions);
        
        document.getElementById('finalScore').textContent = `أحسنت! لقد أجبت على ${score} من ${totalQuestions} أسئلة بشكل صحيح.`;
        document.getElementById('xpGained').textContent = `+${xpGained} XP`;
        
        // فحص استحقاق الجواهر
        const gemsEarned = await checkGemsReward(score, totalQuestions, isPerfect && perfectStreak >= 2);
        
        // تحديث سلسلة النجاح المثالية
        if (isPerfect) {
            perfectStreak++;
        } else {
            perfectStreak = 0;
        }
        
        // تلوين الصفحات عند النجاح
        if (score / totalQuestions >= 0.5) {
            if (!currentUser.testedPages) currentUser.testedPages = [];
            testedScope.forEach(page => {
                if (!currentUser.testedPages.includes(page)) currentUser.testedPages.push(page);
            });
        }
        
        await addXP(xpGained);
        await checkDailyChallengeProgress(testedScope[0], currentUser);
        
        // عرض معلومات الجواهر المكتسبة
        if (gemsEarned > 0) {
            const gemsInfo = document.createElement('p');
            gemsInfo.className = 'gems-gain';
            gemsInfo.textContent = `+${gemsEarned} 💎`;
            gemsInfo.style.cssText = 'color: #ffc107; font-size: 1.5em; font-weight: bold; text-align: center; margin-top: 10px;';
            document.getElementById('xpGained').parentNode.insertBefore(gemsInfo, document.getElementById('xpGained').nextSibling);
        }
    }

    function resetUIForNewQuestion() {
        loader.classList.add('hidden');
        quizContent.classList.remove('hidden');
        resultMessage.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        answerContainer.innerHTML = '';
        audioPlayer.src = '';
    }

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function showProfile() {
        dashboardSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
        updateProfileUI();
    }

    function showStore() {
        dashboardSection.classList.add('hidden');
        if (storeSection) {
            storeSection.classList.remove('hidden');
            updateStoreUI();
        }
    }

    function updateProfileUI() {
        if (!currentUser) return;
        const { stage, level } = calculateLevelAndStage(currentUser.xp);
        document.getElementById('profileUserTitle').textContent = getTitle(stage, level);
        document.getElementById('profileUserXP').textContent = currentUser.xp;
        document.getElementById('profileUserStage').textContent = `${stage}: ${STAGES[stage].name}`;
        
        // تحديث شجرة الحفظ
        if (quranGrid) {
            quranGrid.innerHTML = '';
            for (let page = 1; page <= 604; page++) {
                const pageDiv = document.createElement('div');
                pageDiv.className = 'grid-page';
                pageDiv.textContent = page;
                
                if (currentUser.testedPages && currentUser.testedPages.includes(page)) {
                    pageDiv.classList.add('tested');
                } else {
                    pageDiv.classList.add('not-tested');
                }
                
                quranGrid.appendChild(pageDiv);
            }
        }
    }
});

