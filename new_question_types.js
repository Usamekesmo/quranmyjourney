// new_question_types.js - أنواع الاختبارات الجديدة الصوتية متعددة الخيارات

/**
 * ملف يحتوي على جميع أنواع الاختبارات الجديدة التي يمكن شراؤها من المتجر
 * جميع الاختبارات صوتية ومتعددة الخيارات كما طلب المستخدم
 */

// === الفئة 1: اختبارات ترتيب الآيات ===

/**
 * اختبار ترتيب الآيات المسموعة (3 آيات)
 * يستمع المستخدم لـ 3 آيات بترتيب عشوائي ويختار الترتيب الصحيح
 */
function setupSequenceAyahs3() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: رتب الآيات حسب تسلسلها الصحيح:`;
    
    // اختيار 3 آيات متتالية عشوائياً
    const startIndex = Math.floor(Math.random() * (allAyahs.length - 3));
    const correctSequence = [
        allAyahs[startIndex],
        allAyahs[startIndex + 1], 
        allAyahs[startIndex + 2]
    ];
    
    // خلط الترتيب للعرض الصوتي
    const shuffledSequence = [...correctSequence].sort(() => Math.random() - 0.5);
    
    // إنشاء مقطع صوتي مدمج (سيتم محاكاته بتشغيل متتالي)
    playSequentialAudio(shuffledSequence, () => {
        // إنشاء خيارات الترتيب
        const orderOptions = [
            "الآية الأولى، ثم الثانية، ثم الثالثة",
            "الآية الأولى، ثم الثالثة، ثم الثانية", 
            "الآية الثانية، ثم الأولى، ثم الثالثة",
            "الآية الثانية، ثم الثالثة، ثم الأولى",
            "الآية الثالثة، ثم الأولى، ثم الثانية",
            "الآية الثالثة، ثم الثانية، ثم الأولى"
        ];
        
        // تحديد الإجابة الصحيحة بناءً على الترتيب المسموع
        const correctOrderIndex = findCorrectSequenceOrder(shuffledSequence, correctSequence);
        const correctAnswer = orderOptions[correctOrderIndex];
        
        // خلط الخيارات
        const shuffledOptions = shuffleArray([...orderOptions]);
        
        createSequenceChoiceButtons(shuffledOptions, correctAnswer, shuffledSequence);
    });
}

/**
 * اختبار ترتيب الآيات المسموعة (4 آيات)
 */
function setupSequenceAyahs4() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: رتب الآيات الأربع حسب تسلسلها الصحيح:`;
    
    const startIndex = Math.floor(Math.random() * (allAyahs.length - 4));
    const correctSequence = [
        allAyahs[startIndex],
        allAyahs[startIndex + 1], 
        allAyahs[startIndex + 2],
        allAyahs[startIndex + 3]
    ];
    
    const shuffledSequence = [...correctSequence].sort(() => Math.random() - 0.5);
    
    playSequentialAudio(shuffledSequence, () => {
        // للآيات الأربع، نقدم 4 خيارات ترتيب مختلفة
        const orderOptions = generateSequenceOptions(4);
        const correctOrderIndex = findCorrectSequenceOrder(shuffledSequence, correctSequence);
        const correctAnswer = orderOptions[correctOrderIndex];
        
        const shuffledOptions = shuffleArray(orderOptions.slice(0, 4)); // أخذ 4 خيارات فقط
        
        createSequenceChoiceButtons(shuffledOptions, correctAnswer, shuffledSequence);
    });
}

/**
 * اختبار ترتيب الآيات المسموعة (5 آيات)
 */
function setupSequenceAyahs5() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: رتب الآيات الخمس حسب تسلسلها الصحيح:`;
    
    const startIndex = Math.floor(Math.random() * (allAyahs.length - 5));
    const correctSequence = [
        allAyahs[startIndex],
        allAyahs[startIndex + 1], 
        allAyahs[startIndex + 2],
        allAyahs[startIndex + 3],
        allAyahs[startIndex + 4]
    ];
    
    const shuffledSequence = [...correctSequence].sort(() => Math.random() - 0.5);
    
    playSequentialAudio(shuffledSequence, () => {
        const orderOptions = generateSequenceOptions(5);
        const correctOrderIndex = findCorrectSequenceOrder(shuffledSequence, correctSequence);
        const correctAnswer = orderOptions[correctOrderIndex];
        
        const shuffledOptions = shuffleArray(orderOptions.slice(0, 4)); // أخذ 4 خيارات فقط
        
        createSequenceChoiceButtons(shuffledOptions, correctAnswer, shuffledSequence);
    });
}

// === الفئة 2: اختبارات تمييز الآية الدخيلة ===

/**
 * اختبار اكتشاف الآية الدخيلة (3 آيات)
 * آيتان متتاليتان من النطاق + آية دخيلة من مكان آخر
 */
function setupFindIntruder3() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: أي آية لا تنتمي للتسلسل؟`;
    
    // اختيار آيتين متتاليتين من النطاق
    const startIndex = Math.floor(Math.random() * (allAyahs.length - 2));
    const correctAyahs = [allAyahs[startIndex], allAyahs[startIndex + 1]];
    
    // اختيار آية دخيلة من مكان بعيد
    let intruderIndex;
    do {
        intruderIndex = Math.floor(Math.random() * allAyahs.length);
    } while (Math.abs(intruderIndex - startIndex) < 10); // التأكد من أنها بعيدة
    
    const intruderAyah = allAyahs[intruderIndex];
    
    // دمج الآيات وخلطها
    const allThreeAyahs = [...correctAyahs, intruderAyah];
    const shuffledAyahs = shuffleArray(allThreeAyahs);
    
    // تحديد موقع الآية الدخيلة في الترتيب المخلوط
    const intruderPosition = shuffledAyahs.findIndex(ayah => ayah.number === intruderAyah.number);
    
    playSequentialAudio(shuffledAyahs, () => {
        const positionOptions = [
            "الآية الأولى",
            "الآية الثانية", 
            "الآية الثالثة"
        ];
        
        const correctAnswer = positionOptions[intruderPosition];
        const shuffledOptions = shuffleArray([...positionOptions]);
        
        createIntruderChoiceButtons(shuffledOptions, correctAnswer, shuffledAyahs, intruderAyah);
    });
}

/**
 * اختبار اكتشاف الآية الدخيلة (4 آيات)
 */
function setupFindIntruder4() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: أي آية لا تنتمي للتسلسل؟`;
    
    const startIndex = Math.floor(Math.random() * (allAyahs.length - 3));
    const correctAyahs = [
        allAyahs[startIndex], 
        allAyahs[startIndex + 1], 
        allAyahs[startIndex + 2]
    ];
    
    let intruderIndex;
    do {
        intruderIndex = Math.floor(Math.random() * allAyahs.length);
    } while (Math.abs(intruderIndex - startIndex) < 10);
    
    const intruderAyah = allAyahs[intruderIndex];
    const allFourAyahs = [...correctAyahs, intruderAyah];
    const shuffledAyahs = shuffleArray(allFourAyahs);
    
    const intruderPosition = shuffledAyahs.findIndex(ayah => ayah.number === intruderAyah.number);
    
    playSequentialAudio(shuffledAyahs, () => {
        const positionOptions = [
            "الآية الأولى",
            "الآية الثانية", 
            "الآية الثالثة",
            "الآية الرابعة"
        ];
        
        const correctAnswer = positionOptions[intruderPosition];
        const shuffledOptions = shuffleArray([...positionOptions]);
        
        createIntruderChoiceButtons(shuffledOptions, correctAnswer, shuffledAyahs, intruderAyah);
    });
}

/**
 * اختبار اكتشاف الآية الدخيلة (5 آيات)
 */
function setupFindIntruder5() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: أي آية لا تنتمي للتسلسل؟`;
    
    const startIndex = Math.floor(Math.random() * (allAyahs.length - 4));
    const correctAyahs = [
        allAyahs[startIndex], 
        allAyahs[startIndex + 1], 
        allAyahs[startIndex + 2],
        allAyahs[startIndex + 3]
    ];
    
    let intruderIndex;
    do {
        intruderIndex = Math.floor(Math.random() * allAyahs.length);
    } while (Math.abs(intruderIndex - startIndex) < 10);
    
    const intruderAyah = allAyahs[intruderIndex];
    const allFiveAyahs = [...correctAyahs, intruderAyah];
    const shuffledAyahs = shuffleArray(allFiveAyahs);
    
    const intruderPosition = shuffledAyahs.findIndex(ayah => ayah.number === intruderAyah.number);
    
    playSequentialAudio(shuffledAyahs, () => {
        const positionOptions = [
            "الآية الأولى",
            "الآية الثانية", 
            "الآية الثالثة",
            "الآية الرابعة",
            "الآية الخامسة"
        ];
        
        const correctAnswer = positionOptions[intruderPosition];
        const shuffledOptions = shuffleArray([...positionOptions]);
        
        createIntruderChoiceButtons(shuffledOptions, correctAnswer, shuffledAyahs, intruderAyah);
    });
}

// === الفئة 3: اختبارات تحديد الموقع ===

/**
 * اختبار تحديد موقع الآية في النطاق (بداية/وسط/نهاية)
 */
function setupAyahLocation() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: أين تقع هذه الآية في النطاق؟`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    // تحديد الموقع النسبي
    let correctLocation;
    const position = randomIndex / (allAyahs.length - 1);
    
    if (position < 0.33) {
        correctLocation = "في بداية النطاق";
    } else if (position > 0.67) {
        correctLocation = "في نهاية النطاق";
    } else {
        correctLocation = "في وسط النطاق";
    }
    
    audioPlayer.src = selectedAyah.audio;
    
    const locationOptions = [
        "في بداية النطاق",
        "في وسط النطاق",
        "في نهاية النطاق"
    ];
    
    const shuffledOptions = shuffleArray([...locationOptions]);
    
    createLocationChoiceButtons(shuffledOptions, correctLocation, selectedAyah);
}

/**
 * اختبار معرفة رقم الصفحة
 */
function setupPageNumber() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: في أي صفحة تقع هذه الآية؟`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    // استخراج رقم الصفحة من بيانات الآية (إذا كانت متوفرة)
    // أو تقديرها بناءً على موقع الآية في النطاق
    const correctPage = estimatePageNumber(selectedAyah, randomIndex);
    
    audioPlayer.src = selectedAyah.audio;
    
    // إنشاء خيارات قريبة من الصفحة الصحيحة
    const pageOptions = [
        correctPage,
        correctPage + 1,
        correctPage - 1,
        correctPage + 2
    ].filter(page => page > 0 && page <= 604); // التأكد من صحة أرقام الصفحات
    
    const shuffledOptions = shuffleArray(pageOptions);
    
    createPageChoiceButtons(shuffledOptions, correctPage, selectedAyah);
}

/**
 * اختبار معرفة رقم الآية في السورة
 */
function setupAyahNumber() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: ما رقم هذه الآية في سورتها؟`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    // استخراج رقم الآية من بيانات API
    const correctNumber = selectedAyah.numberInSurah || 1;
    
    audioPlayer.src = selectedAyah.audio;
    
    // إنشاء خيارات قريبة من الرقم الصحيح
    const numberOptions = [
        correctNumber,
        correctNumber + 1,
        correctNumber - 1,
        correctNumber + 2
    ].filter(num => num > 0); // التأكد من أن الأرقام موجبة
    
    const shuffledOptions = shuffleArray(numberOptions);
    
    createNumberChoiceButtons(shuffledOptions, correctNumber, selectedAyah);
}

// === الفئة 4: اختبارات إكمال الآيات ===

/**
 * اختبار إكمال الآية من 5 كلمات
 */
function setupCompleteAyah5Words() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: اختر التكملة الصحيحة للآية:`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    // تقسيم نص الآية إلى كلمات
    const words = selectedAyah.text.split(' ');
    
    if (words.length < 8) {
        // إذا كانت الآية قصيرة جداً، استخدم آية أخرى
        setupCompleteAyah5Words();
        return;
    }
    
    // أخذ أول 5 كلمات كبداية
    const firstPart = words.slice(0, 5).join(' ');
    const correctCompletion = words.slice(5).join(' ');
    
    // إنشاء مقطع صوتي للجزء الأول فقط (محاكاة)
    displayPartialAyah(firstPart, selectedAyah.audio);
    
    // إنشاء خيارات التكملة من آيات أخرى
    const completionOptions = generateCompletionOptions(correctCompletion, 5);
    const shuffledOptions = shuffleArray(completionOptions);
    
    createCompletionChoiceButtons(shuffledOptions, correctCompletion, selectedAyah);
}

/**
 * اختبار إكمال الآية من 4 كلمات
 */
function setupCompleteAyah4Words() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: اختر التكملة الصحيحة للآية:`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    const words = selectedAyah.text.split(' ');
    
    if (words.length < 7) {
        setupCompleteAyah4Words();
        return;
    }
    
    const firstPart = words.slice(0, 4).join(' ');
    const correctCompletion = words.slice(4).join(' ');
    
    displayPartialAyah(firstPart, selectedAyah.audio);
    
    const completionOptions = generateCompletionOptions(correctCompletion, 4);
    const shuffledOptions = shuffleArray(completionOptions);
    
    createCompletionChoiceButtons(shuffledOptions, correctCompletion, selectedAyah);
}

/**
 * اختبار إكمال الآية من 3 كلمات
 */
function setupCompleteAyah3Words() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: اختر التكملة الصحيحة للآية:`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    const words = selectedAyah.text.split(' ');
    
    if (words.length < 6) {
        setupCompleteAyah3Words();
        return;
    }
    
    const firstPart = words.slice(0, 3).join(' ');
    const correctCompletion = words.slice(3).join(' ');
    
    displayPartialAyah(firstPart, selectedAyah.audio);
    
    const completionOptions = generateCompletionOptions(correctCompletion, 3);
    const shuffledOptions = shuffleArray(completionOptions);
    
    createCompletionChoiceButtons(shuffledOptions, correctCompletion, selectedAyah);
}

/**
 * اختبار إكمال الآية من كلمتين
 */
function setupCompleteAyah2Words() {
    questionText.textContent = `السؤال ${questionsAsked}/${totalQuestions}: اختر التكملة الصحيحة للآية:`;
    
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    const selectedAyah = allAyahs[randomIndex];
    
    const words = selectedAyah.text.split(' ');
    
    if (words.length < 5) {
        setupCompleteAyah2Words();
        return;
    }
    
    const firstPart = words.slice(0, 2).join(' ');
    const correctCompletion = words.slice(2).join(' ');
    
    displayPartialAyah(firstPart, selectedAyah.audio);
    
    const completionOptions = generateCompletionOptions(correctCompletion, 2);
    const shuffledOptions = shuffleArray(completionOptions);
    
    createCompletionChoiceButtons(shuffledOptions, correctCompletion, selectedAyah);
}

// === دوال مساعدة ===

/**
 * تشغيل مقاطع صوتية متتالية
 */
function playSequentialAudio(ayahs, callback) {
    let currentIndex = 0;
    
    function playNext() {
        if (currentIndex >= ayahs.length) {
            callback();
            return;
        }
        
        audioPlayer.src = ayahs[currentIndex].audio;
        audioPlayer.play();
        
        audioPlayer.onended = () => {
            currentIndex++;
            setTimeout(playNext, 500); // توقف قصير بين الآيات
        };
    }
    
    playNext();
}

/**
 * إنشاء خيارات ترتيب للآيات
 */
function generateSequenceOptions(count) {
    const options = [];
    const numbers = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
    
    // إنشاء بعض الترتيبات المختلفة
    for (let i = 0; i < Math.min(6, factorial(count)); i++) {
        const permutation = generatePermutation(count);
        const optionText = permutation.map(index => `الآية ${numbers[index]}`).join('، ثم ');
        options.push(optionText);
    }
    
    return options;
}

/**
 * العثور على ترتيب الآيات الصحيح
 */
function findCorrectSequenceOrder(shuffled, correct) {
    const mapping = shuffled.map(ayah => 
        correct.findIndex(correctAyah => correctAyah.number === ayah.number)
    );
    
    // تحويل التطابق إلى نص ترتيب
    const numbers = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
    return mapping.map(index => `الآية ${numbers[index]}`).join('، ثم ');
}

/**
 * تقدير رقم الصفحة بناءً على موقع الآية
 */
function estimatePageNumber(ayah, index) {
    // محاولة استخراج رقم الصفحة من بيانات الآية
    if (ayah.page) return ayah.page;
    
    // تقدير بناءً على الموقع في النطاق
    const estimatedPage = Math.floor((index / allAyahs.length) * 604) + 1;
    return Math.min(604, Math.max(1, estimatedPage));
}

/**
 * إنشاء خيارات التكملة للآيات
 */
function generateCompletionOptions(correctCompletion, wordCount) {
    const options = [correctCompletion];
    
    // إضافة خيارات خاطئة من آيات أخرى
    const usedCompletions = new Set([correctCompletion]);
    
    while (options.length < 4) {
        const randomAyah = allAyahs[Math.floor(Math.random() * allAyahs.length)];
        const words = randomAyah.text.split(' ');
        
        if (words.length > wordCount) {
            const completion = words.slice(wordCount).join(' ');
            if (!usedCompletions.has(completion) && completion !== correctCompletion) {
                options.push(completion);
                usedCompletions.add(completion);
            }
        }
    }
    
    return options;
}

/**
 * عرض جزء من الآية نصياً
 */
function displayPartialAyah(partialText, audioSrc) {
    const partialDisplay = document.createElement('div');
    partialDisplay.className = 'partial-ayah-display';
    partialDisplay.innerHTML = `
        <div class="ayah-text" style="font-size: 1.3em; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-right: 4px solid var(--primary-color);">
            ${partialText} <span style="color: #999;">...</span>
        </div>
    `;
    
    answerContainer.appendChild(partialDisplay);
    
    // تشغيل جزء من الصوت (محاكاة)
    audioPlayer.src = audioSrc;
}

// === دوال إنشاء أزرار الخيارات المختلفة ===

function createSequenceChoiceButtons(choices, correctAnswer, ayahs) {
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices-container';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.onclick = () => {
            choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
            const isCorrect = choice === correctAnswer;
            showResult(isCorrect, button, `الترتيب الصحيح: ${correctAnswer}`);
        };
        choicesContainer.appendChild(button);
    });
    
    answerContainer.appendChild(choicesContainer);
}

function createIntruderChoiceButtons(choices, correctAnswer, ayahs, intruderAyah) {
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices-container';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.onclick = () => {
            choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
            const isCorrect = choice === correctAnswer;
            showResult(isCorrect, button, `الآية الدخيلة: ${correctAnswer} - "${intruderAyah.text}"`);
        };
        choicesContainer.appendChild(button);
    });
    
    answerContainer.appendChild(choicesContainer);
}

function createLocationChoiceButtons(choices, correctAnswer, ayah) {
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices-container';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.onclick = () => {
            choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
            const isCorrect = choice === correctAnswer;
            showResult(isCorrect, button, `الموقع الصحيح: ${correctAnswer}`);
        };
        choicesContainer.appendChild(button);
    });
    
    answerContainer.appendChild(choicesContainer);
}

function createPageChoiceButtons(choices, correctAnswer, ayah) {
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices-container';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = `صفحة ${choice}`;
        button.onclick = () => {
            choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
            const isCorrect = choice === correctAnswer;
            showResult(isCorrect, button, `الصفحة الصحيحة: ${correctAnswer}`);
        };
        choicesContainer.appendChild(button);
    });
    
    answerContainer.appendChild(choicesContainer);
}

function createNumberChoiceButtons(choices, correctAnswer, ayah) {
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices-container';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = `آية رقم ${choice}`;
        button.onclick = () => {
            choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
            const isCorrect = choice === correctAnswer;
            showResult(isCorrect, button, `الرقم الصحيح: ${correctAnswer}`);
        };
        choicesContainer.appendChild(button);
    });
    
    answerContainer.appendChild(choicesContainer);
}

function createCompletionChoiceButtons(choices, correctAnswer, ayah) {
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices-container';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn ayah-text';
        button.textContent = choice;
        button.onclick = () => {
            choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
            const isCorrect = choice === correctAnswer;
            showResult(isCorrect, button, `التكملة الصحيحة: "${correctAnswer}"`);
        };
        choicesContainer.appendChild(button);
    });
    
    answerContainer.appendChild(choicesContainer);
}

// === دوال رياضية مساعدة ===

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

function generatePermutation(count) {
    const arr = Array.from({length: count}, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

