// gamification.js - النسخة النهائية (بدون تغيير)

const STAGES = {
    1: { name: "التأسيس", levels: 20, titleBase: "مُؤسِّس" },
    2: { name: "التمكين", levels: 20, titleBase: "مُمَكَّن" },
    3: { name: "الإتقان", levels: 20, titleBase: "مُتقِن" },
    4: { name: "الرسوخ", levels: 20, titleBase: "راسِخ" },
    5: { name: "الإجازة", levels: 20, titleBase: "مُجاز" }
};

const LEVEL_XP_BASE = 200; // النقاط المطلوبة لأول مستوى

function calculateLevelAndStage(xp) {
    if (xp < LEVEL_XP_BASE) {
        return {
            stage: 1,
            level: 1,
            xpForNextLevel: LEVEL_XP_BASE,
            progressXP: xp,
            baseXPForLevel: LEVEL_XP_BASE
        };
    }

    let totalLevels = 0;
    for (let s = 1; s <= 5; s++) {
        for (let l = 1; l <= STAGES[s].levels; l++) {
            totalLevels++;
            const requiredXP = totalLevels * LEVEL_XP_BASE;
            if (xp < requiredXP) {
                const prevLevelXP = (totalLevels - 1) * LEVEL_XP_BASE;
                return {
                    stage: s,
                    level: l,
                    xpForNextLevel: requiredXP,
                    progressXP: xp - prevLevelXP,
                    baseXPForLevel: LEVEL_XP_BASE
                };
            }
        }
    }
    
    const maxXP = totalLevels * LEVEL_XP_BASE;
    return { 
        stage: 5, 
        level: 20, 
        xpForNextLevel: Infinity, 
        progressXP: xp - maxXP, 
        baseXPForLevel: LEVEL_XP_BASE 
    };
}

function getTitle(stage, level) {
    const stageInfo = STAGES[stage];
    if (!stageInfo) return "مشارك";

    if (level <= 5) return `${stageInfo.titleBase} مبتدئ`;
    if (level <= 10) return `${stageInfo.titleBase} مجتهد`;
    if (level <= 15) return `${stageInfo.titleBase} متقدم`;
    
    return `${stageInfo.titleBase} خبير`;
}

