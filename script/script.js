/* =========================================================
   FOCLYRA
   SMART STUDY PLANNER
   COMPLETE script.js
   ========================================================= */


/* =========================================================
   1. SAFE HTML
   ========================================================= */

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   2. STUDENT DATA
   ========================================================= */

function getStudentData() {

    const rawHours =
        Number(
            localStorage.getItem("studyHours")
        );

    let studyHours =
        Number.isFinite(rawHours)
            ? rawHours
            : 2;

    studyHours =
        Math.max(
            1,
            Math.min(
                6,
                Math.round(studyHours)
            )
        );

    return {

        name:
            localStorage.getItem(
                "studentName"
            ) || "Student",

        subjects:
            localStorage.getItem(
                "subjects"
            ) || "",

        examDate:
            localStorage.getItem(
                "examDate"
            ) || "",

        studyHours:
            studyHours,

        priority:
            localStorage.getItem(
                "priority"
            ) || "",

        progress:
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        localStorage.getItem(
                            "progress"
                        )
                    ) || 0
                )
            ),

        confidence:
            localStorage.getItem(
                "confidence"
            ) || "medium",

        difficulty:
            localStorage.getItem(
                "difficulty"
            ) || "medium",

        importance:
            localStorage.getItem(
                "importance"
            ) || "medium",

        weakTopics:
            localStorage.getItem(
                "weakTopics"
            ) || ""
    };
}


/* =========================================================
   3. SUBJECTS
   ========================================================= */

function getSubjects() {

    const data =
        getStudentData();

    return String(
        data.subjects || ""
    )
        .split(",")
        .map(function(subject) {

            return cleanSubjectName(
                subject
            );

        })
        .filter(function(subject) {

            return subject !== "";

        });
}


/* =========================================================
   4. CLEAN SUBJECT NAME
   ========================================================= */

function cleanSubjectName(subject) {

    return String(subject || "")

        .replace(
            /\s*—\s*Carry-over/gi,
            ""
        )

        .replace(
            /\s*-\s*Carry-over/gi,
            ""
        )

        .replace(
            /\s*—\s*Rescheduled/gi,
            ""
        )

        .replace(
            /\s*-\s*Rescheduled/gi,
            ""
        )

        .trim();
}


/* =========================================================
   5. EXAM DATE
   ========================================================= */

function getExamDateStatus() {

    const saved =
        localStorage.getItem(
            "examDate"
        );

    if (!saved) {

        return {
            valid: false,
            status: "missing",
            days: null
        };
    }

    const exam =
        new Date(
            saved + "T00:00:00"
        );

    if (
        Number.isNaN(
            exam.getTime()
        )
    ) {

        return {
            valid: false,
            status: "invalid",
            days: null
        };
    }

    const today =
        new Date();

    const todayStart =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

    const examStart =
        new Date(
            exam.getFullYear(),
            exam.getMonth(),
            exam.getDate()
        );

    const difference =
        examStart.getTime() -
        todayStart.getTime();

    const days =
        Math.round(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );

    if (days < 0) {

        return {
            valid: false,
            status: "past",
            days: days
        };
    }

    return {
        valid: true,
        status:
            days === 0
                ? "today"
                : "future",
        days: days
    };
}


/* =========================================================
   6. EXAM COUNTDOWN
   ========================================================= */

function getDaysUntilExam() {

    const result =
        getExamDateStatus();

    if (!result.valid) {

        return null;
    }

    return result.days;
}


/* =========================================================
   7. EXAM URGENCY
   ========================================================= */

function getExamUrgency() {

    const days =
        getDaysUntilExam();

    if (days === null) {

        return 20;
    }

    if (days === 0) {

        return 100;
    }

    if (days <= 3) {

        return 90;
    }

    if (days <= 7) {

        return 75;
    }

    if (days <= 14) {

        return 55;
    }

    if (days <= 30) {

        return 35;
    }

    return 20;
}


/* =========================================================
   8. LEVEL SCORES
   ========================================================= */

function getConfidenceGap(level) {

    level =
        String(level || "")
            .toLowerCase();

    if (level === "low") {

        return 100;
    }

    if (level === "medium") {

        return 60;
    }

    if (level === "high") {

        return 25;
    }

    return 60;
}


function getDifficultyScore(level) {

    level =
        String(level || "")
            .toLowerCase();

    if (level === "hard") {

        return 100;
    }

    if (level === "medium") {

        return 60;
    }

    if (level === "easy") {

        return 25;
    }

    return 60;
}


function getImportanceScore(level) {

    level =
        String(level || "")
            .toLowerCase();

    if (level === "high") {

        return 100;
    }

    if (level === "medium") {

        return 60;
    }

    if (level === "low") {

        return 25;
    }

    return 60;
}


/* =========================================================
   9. VALIDATE PRIORITY
   ========================================================= */

function getValidPriority() {

    const subjects =
        getSubjects();

    const savedPriority =
        String(
            localStorage.getItem(
                "priority"
            ) || ""
        ).trim();

    if (!savedPriority) {

        return "";
    }

    const match =
        subjects.find(
            function(subject) {

                return (
                    subject.toLowerCase() ===
                    savedPriority.toLowerCase()
                );
            }
        );

    if (!match) {

        localStorage.removeItem(
            "priority"
        );

        return "";
    }

    return match;
}


/* =========================================================
   10. FIND BEST SUBJECT
   ========================================================= */

function getBestSubject() {

    const subjects =
        getSubjects();

    if (!subjects.length) {

        return "";
    }

    const data =
        getStudentData();

    const ranked =
        subjects
            .map(function(subject) {

                return calculateSubjectPriority(
                    subject,
                    data
                );

            })
            .sort(function(a, b) {

                return (
                    b.score -
                    a.score
                );
            });

    return ranked.length
        ? ranked[0].subject
        : subjects[0];
}


/* =========================================================
   11. SUBJECT PRIORITY ENGINE
   ========================================================= */

function calculateSubjectPriority(
    subject,
    data
) {

    const urgency =
        getExamUrgency();

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    data.progress
                ) || 0
            )
        );

    const knowledgeGap =
        100 - progress;

    const confidenceGap =
        getConfidenceGap(
            data.confidence
        );

    const difficulty =
        getDifficultyScore(
            data.difficulty
        );

    const importance =
        getImportanceScore(
            data.importance
        );

    const selectedPriority =
        String(
            data.priority || ""
        )
            .trim()
            .toLowerCase();

    const currentSubject =
        String(subject)
            .trim()
            .toLowerCase();

    let priorityBonus = 0;

    if (
        selectedPriority &&
        selectedPriority ===
        currentSubject
    ) {

        priorityBonus = 20;
    }

    let score =

        urgency * 0.30 +

        knowledgeGap * 0.25 +

        confidenceGap * 0.15 +

        difficulty * 0.10 +

        importance * 0.10 +

        priorityBonus;

    score =
        Math.round(
            Math.min(
                100,
                score
            )
        );

    const reasons = [];

    if (urgency >= 75) {

        reasons.push(
            "your exam is approaching"
        );
    }

    if (knowledgeGap >= 60) {

        reasons.push(
            "your syllabus has significant room to cover"
        );
    }

    if (confidenceGap >= 80) {

        reasons.push(
            "your confidence is low"
        );
    }

    if (difficulty >= 80) {

        reasons.push(
            "this is a difficult subject"
        );
    }

    if (importance >= 80) {

        reasons.push(
            "you marked it as highly important"
        );
    }

    if (priorityBonus > 0) {

        reasons.push(
            "you selected it as your priority"
        );
    }

    if (
        data.weakTopics &&
        data.weakTopics.trim() !== ""
    ) {

        reasons.push(
            "you have weak or unfinished topics"
        );
    }

    let reason;

    if (reasons.length) {

        reason =
            "FOCLYRA prioritized " +
            subject +
            " because " +
            reasons.join(", ") +
            ".";

    } else {

        reason =
            subject +
            " is included to maintain balanced preparation.";
    }

    return {

        subject:
            cleanSubjectName(
                subject
            ),

        score:
            score,

        reason:
            reason
    };
}


/* =========================================================
   12. SESSION COUNT
   ========================================================= */

function chooseSessionCount(
    availableMinutes
) {

    const minutes =
        Math.max(
            0,
            Number(
                availableMinutes
            ) || 0
        );

    if (minutes < 25) {

        return 0;
    }

    if (minutes < 80) {

        return 1;
    }

    if (minutes < 150) {

        return 2;
    }

    if (minutes < 220) {

        return 3;
    }

    return 4;
}


/* =========================================================
   13. ALLOCATE STUDY TIME
   ========================================================= */

function allocateStudyMinutes(
    sessions,
    studyBudget
) {

    if (!sessions.length) {

        return;
    }

    let remaining =
        Math.max(
            0,
            Math.floor(
                Number(
                    studyBudget
                ) || 0
            )
        );

    sessions.forEach(
        function(session) {

            session.minutes = 25;

            remaining -= 25;
        }
    );

    if (remaining <= 0) {

        return;
    }

    const ranked =
        sessions
            .slice()
            .sort(function(a, b) {

                return (
                    (Number(b.score) || 0) -
                    (Number(a.score) || 0)
                );
            });

    while (remaining >= 5) {

        let changed =
            false;

        for (
            let i = 0;
            i < ranked.length &&
            remaining > 0;
            i++
        ) {

            const session =
                ranked[i];

            const room =
                90 -
                session.minutes;

            if (room <= 0) {

                continue;
            }

            const extra =
                Math.min(
                    5,
                    room,
                    remaining
                );

            if (extra > 0) {

                session.minutes +=
                    extra;

                remaining -=
                    extra;

                changed =
                    true;
            }
        }

        if (!changed) {

            break;
        }
    }
}


/* =========================================================
   14. GENERATE SMART PLAN
   ========================================================= */

function generateSmartPlan() {

    const data =
        getStudentData();

    const subjects =
        getSubjects();

    if (!subjects.length) {

        return [];
    }

    const availableMinutes =
        Math.floor(
            data.studyHours * 60
        );

    const ranked =
        subjects
            .map(function(subject) {

                return calculateSubjectPriority(
                    subject,
                    data
                );

            })
            .sort(function(a, b) {

                return (
                    b.score -
                    a.score
                );
            });

    const sessionCount =
        chooseSessionCount(
            availableMinutes
        );

    if (
        sessionCount === 0
    ) {

        return [];
    }

    const selected = [];

    for (
        let i = 0;
        i < sessionCount;
        i++
    ) {

        selected.push(
            {
                subject:
                    ranked[
                        i %
                        ranked.length
                    ].subject,

                score:
                    ranked[
                        i %
                        ranked.length
                    ].score,

                reason:
                    ranked[
                        i %
                        ranked.length
                    ].reason,

                minutes:
                    25,

                status:
                    "planned"
            }
        );
    }

    const breakMinutes =
        Math.max(
            0,
            (
                selected.length -
                1
            ) * 10
        );

    const studyBudget =
        availableMinutes -
        breakMinutes;

    allocateStudyMinutes(
        selected,
        studyBudget
    );

    const plan = [];

    selected.forEach(
        function(session, index) {

            plan.push({

                id:
                    "session-" +
                    Date.now() +
                    "-" +
                    index,

                subject:
                    cleanSubjectName(
                        session.subject
                    ),

                minutes:
                    session.minutes,

                score:
                    session.score,

                reason:
                    session.reason,

                status:
                    session.status
            });

            if (
                index <
                selected.length - 1
            ) {

                plan.push({

                    id:
                        "break-" +
                        Date.now() +
                        "-" +
                        index,

                    subject:
                        "Break",

                    minutes:
                        10,

                    score:
                        0,

                    reason:
                        "Recovery break to protect focus.",

                    status:
                        "break"
                });
            }
        }
    );

    return plan;
}


/* =========================================================
   15. VALIDATE PLAN
   ========================================================= */

function validatePlan(
    plan,
    availableMinutes
) {

    if (!Array.isArray(plan)) {

        plan = [];
    }

    const totalMinutes =
        plan.reduce(
            function(sum, session) {

                return (
                    sum +
                    (
                        Number(
                            session.minutes
                        ) || 0
                    )
                );
            },
            0
        );

    const studySessions =
        plan.filter(
            function(session) {

                return (
                    session.subject !==
                    "Break"
                );
            }
        );

    const breaks =
        plan.filter(
            function(session) {

                return (
                    session.subject ===
                    "Break"
                );
            }
        );

    const fitsTime =
        totalMinutes <=
        availableMinutes;

    const realistic =
        studySessions.every(
            function(session) {

                const minutes =
                    Number(
                        session.minutes
                    );

                return (
                    minutes >= 25 &&
                    minutes <= 90
                );
            }
        );

    const correctBreaks =
        breaks.length ===
        Math.max(
            0,
            studySessions.length - 1
        );

    const hasOverlap =
        false;

    let score =
        100;

    if (!fitsTime) {

        score -= 40;
    }

    if (!realistic) {

        score -= 20;
    }

    if (!correctBreaks) {

        score -= 15;
    }

    if (!studySessions.length) {

        score -= 20;
    }

    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );

    return {

        valid:
            fitsTime &&
            realistic &&
            correctBreaks &&
            !hasOverlap &&
            studySessions.length > 0,

        score:
            score,

        totalMinutes:
            totalMinutes,

        availableMinutes:
            availableMinutes,

        hasOverlap:
            hasOverlap,

        hasBreak:
            breaks.length > 0
    };
}


/* =========================================================
   16. PLAN SIGNATURE
   ========================================================= */

function getPlanSignature() {

    const data =
        getStudentData();

    return JSON.stringify({

        subjects:
            getSubjects(),

        examDate:
            data.examDate,

        studyHours:
            data.studyHours,

        priority:
            getValidPriority(),

        progress:
            data.progress,

        confidence:
            data.confidence,

        difficulty:
            data.difficulty,

        importance:
            data.importance,

        weakTopics:
            data.weakTopics
    });
}


/* =========================================================
   17. CREATE + SAVE PLAN
   ========================================================= */

function createFoclyraPlan() {

    const data =
        getStudentData();

    const availableMinutes =
        Math.floor(
            data.studyHours * 60
        );

    let plan =
        generateSmartPlan();

    let validation =
        validatePlan(
            plan,
            availableMinutes
        );

    if (
        !validation.valid &&
        getSubjects().length
    ) {

        const bestSubject =
            getBestSubject();

        plan = [

            {

                id:
                    "emergency-" +
                    Date.now(),

                subject:
                    bestSubject,

                minutes:
                    Math.min(
                        90,
                        Math.max(
                            25,
                            availableMinutes
                        )
                    ),

                score:
                    calculateSubjectPriority(
                        bestSubject,
                        data
                    ).score,

                reason:
                    "FOCLYRA created a focused recovery session based on your highest current priority.",

                status:
                    "planned"
            }
        ];

        validation =
            validatePlan(
                plan,
                availableMinutes
            );
    }

    localStorage.setItem(
        "foclyraPlan",
        JSON.stringify(plan)
    );

    localStorage.setItem(
        "foclyraPlanValidation",
        JSON.stringify(validation)
    );

    localStorage.setItem(
        "foclyraPlanSignature",
        getPlanSignature()
    );

    return {

        plan:
            plan,

        validation:
            validation
    };
}/* =========================================================
   18. LOAD PLAN
   ========================================================= */

function loadFoclyraPlan() {

    const saved =
        localStorage.getItem(
            "foclyraPlan"
        );

    if (!saved) {

        return [];
    }

    try {

        const plan =
            JSON.parse(
                saved
            );

        return Array.isArray(plan)
            ? plan
            : [];

    } catch (error) {

        localStorage.removeItem(
            "foclyraPlan"
        );

        localStorage.removeItem(
            "foclyraPlanValidation"
        );

        return [];
    }
}


/* =========================================================
   19. ENSURE CURRENT PLAN
   ========================================================= */

function ensureCurrentPlan() {

    const subjects =
        getSubjects();

    if (!subjects.length) {

        return [];
    }

    const currentSignature =
        getPlanSignature();

    const savedSignature =
        localStorage.getItem(
            "foclyraPlanSignature"
        );

    const existingPlan =
        loadFoclyraPlan();

    /*
       If the student changed their
       planner information, rebuild.
    */

    if (
        !existingPlan.length ||
        savedSignature !==
        currentSignature
    ) {

        return createFoclyraPlan()
            .plan;
    }

    return existingPlan;
}


/* =========================================================
   20. CUSTOM PLAN DATA
   ========================================================= */

function getCustomPlanData() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "foclyraCustomPlan"
                ) || "{}"
            );

        return saved &&
            typeof saved === "object"
            ? saved
            : {};

    } catch (error) {

        return {};
    }
}


function saveCustomPlanData(data) {

    localStorage.setItem(
        "foclyraCustomPlan",
        JSON.stringify(data)
    );
}


/* =========================================================
   21. RESET CUSTOM PLAN
   ========================================================= */

function resetCustomPlan() {

    localStorage.removeItem(
        "foclyraCustomPlan"
    );

    localStorage.removeItem(
        "foclyraPlanCustomized"
    );

    createFoclyraPlan();

    displaySmartPlan();

    alert(
        "FOCLYRA's recommended plan has been restored."
    );
}


/* =========================================================
   22. UPDATE CUSTOM SUBJECT TIME
   ========================================================= */

function changeSubjectTime(
    subject,
    change
) {

    const plan =
        loadFoclyraPlan();

    const sessions =
        plan.filter(
            function(session) {

                return (
                    session.subject !==
                    "Break"
                );
            }
        );

    const target =
        sessions.find(
            function(session) {

                return (
                    cleanSubjectName(
                        session.subject
                    ).toLowerCase() ===
                    cleanSubjectName(
                        subject
                    ).toLowerCase()
                );
            }
        );

    if (!target) {

        return;
    }

    const current =
        Number(
            target.minutes
        ) || 25;

    const newMinutes =
        current +
        Number(change);

    /*
       Each study session stays
       between 25 and 90 minutes.
    */

    if (newMinutes < 25) {

        return;
    }

    if (newMinutes > 90) {

        alert(
            "A single study session cannot exceed 90 minutes."
        );

        return;
    }

    /*
       Calculate the new total BEFORE saving.
    */

    const availableMinutes =
        getStudentData()
            .studyHours * 60;

    const currentTotal =
        plan.reduce(
            function(sum, session) {

                return (
                    sum +
                    (
                        Number(
                            session.minutes
                        ) || 0
                    )
                );
            },
            0
        );

    const proposedTotal =
        currentTotal +
        Number(change);

    if (
        proposedTotal >
        availableMinutes
    ) {

        alert(
            "That would exceed your available study time."
        );

        return;
    }

    target.minutes =
        newMinutes;

    /*
       Store the customized
       subject time.
    */

    const customData =
        getCustomPlanData();

    customData[
        cleanSubjectName(
            subject
        )
    ] =
        newMinutes;

    saveCustomPlanData(
        customData
    );

    localStorage.setItem(
        "foclyraPlanCustomized",
        "true"
    );

    /*
       Rebuild breaks so that
       they remain between sessions.
    */

    const rebuiltPlan = [];

    let sessionNumber = 0;

    plan.forEach(
        function(session) {

            if (
                session.subject ===
                "Break"
            ) {

                return;
            }

            rebuiltPlan.push(
                session
            );

            sessionNumber++;

            if (
                sessionNumber <
                sessions.length
            ) {

                rebuiltPlan.push({

                    id:
                        "custom-break-" +
                        Date.now() +
                        "-" +
                        sessionNumber,

                    subject:
                        "Break",

                    minutes:
                        10,

                    score:
                        0,

                    reason:
                        "Recovery break to protect focus.",

                    status:
                        "break"
                });
            }
        }
    );

    localStorage.setItem(
        "foclyraPlan",
        JSON.stringify(
            rebuiltPlan
        )
    );

    const validation =
        validatePlan(
            rebuiltPlan,
            availableMinutes
        );

    localStorage.setItem(
        "foclyraPlanValidation",
        JSON.stringify(
            validation
        )
    );

    /*
       IMPORTANT:
       Customized plans must not be
       automatically regenerated
       just because their signature
       differs from the original.
    */

    localStorage.setItem(
        "foclyraPlanSignature",
        getPlanSignature()
    );

    displaySmartPlan();
}


/* =========================================================
   23. APPLY SAVED CUSTOM TIMES
   ========================================================= */

function applySavedCustomTimes(
    plan
) {

    const customData =
        getCustomPlanData();

    if (
        !customData ||
        typeof customData !== "object"
    ) {

        return plan;
    }

    const copiedPlan =
        plan.map(
            function(session) {

                return {
                    ...session
                };
            }
        );

    copiedPlan.forEach(
        function(session) {

            if (
                session.subject ===
                "Break"
            ) {

                return;
            }

            const key =
                cleanSubjectName(
                    session.subject
                );

            if (
                customData[key] != null
            ) {

                const minutes =
                    Number(
                        customData[key]
                    );

                if (
                    minutes >= 25 &&
                    minutes <= 90
                ) {

                    session.minutes =
                        minutes;
                }
            }
        }
    );

    return copiedPlan;
}


/* =========================================================
   24. CALCULATE CUSTOM PLAN SCORE
   ========================================================= */

function calculateCustomPlanScore(
    plan,
    availableMinutes
) {

    const validation =
        validatePlan(
            plan,
            availableMinutes
        );

    let score =
        validation.score;

    const originalPlan =
        generateSmartPlan();

    const originalSessions =
        originalPlan.filter(
            function(session) {

                return (
                    session.subject !==
                    "Break"
                );
            }
        );

    const customSessions =
        plan.filter(
            function(session) {

                return (
                    session.subject !==
                    "Break"
                );
            }
        );

    /*
       Small adjustment for moving
       away from FOCLYRA's recommendation.

       This does NOT punish the student
       heavily. It simply shows that the
       plan has been manually adjusted.
    */

    originalSessions.forEach(
        function(original) {

            const custom =
                customSessions.find(
                    function(session) {

                        return (
                            cleanSubjectName(
                                session.subject
                            ).toLowerCase() ===
                            cleanSubjectName(
                                original.subject
                            ).toLowerCase()
                        );
                    }
                );

            if (!custom) {

                return;
            }

            const difference =
                Math.abs(
                    Number(
                        custom.minutes
                    ) -
                    Number(
                        original.minutes
                    )
                );

            score -=
                Math.min(
                    5,
                    Math.floor(
                        difference / 20
                    )
                );
        }
    );

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(score)
        )
    );
}


/* =========================================================
   25. DISPLAY SMART PLAN
   ========================================================= */

function displaySmartPlan() {

    const planList =
        document.getElementById(
            "smartPlanList"
        );

    if (!planList) {

        return;
    }

    let plan =
        ensureCurrentPlan();

    if (!plan.length) {

        planList.innerHTML =
            '<div class="smart-plan-break">' +
            'Add your subjects in Edit Plan to generate your Smart Plan.' +
            '</div>';

        return;
    }

    /*
       Apply customized times only
       when the student has customized
       the plan.
    */

    if (
        localStorage.getItem(
            "foclyraPlanCustomized"
        ) === "true"
    ) {

        plan =
            applySavedCustomTimes(
                plan
            );

        localStorage.setItem(
            "foclyraPlan",
            JSON.stringify(
                plan
            )
        );
    }

    const availableMinutes =
        getStudentData()
            .studyHours * 60;

    /*
       Recalculate validation.
    */

    const validation =
        validatePlan(
            plan,
            availableMinutes
        );

    const customScore =
        localStorage.getItem(
            "foclyraPlanCustomized"
        ) === "true"
            ? calculateCustomPlanScore(
                plan,
                availableMinutes
            )
            : validation.score;

    localStorage.setItem(
        "foclyraPlanValidation",
        JSON.stringify(
            validation
        )
    );

    planList.innerHTML = "";

    /*
       CUSTOMIZE HEADER
    */

    const customizeHeader =
        document.createElement(
            "div"
        );

    customizeHeader.style.cssText =
        "display:flex;" +
        "justify-content:space-between;" +
        "align-items:center;" +
        "gap:12px;" +
        "margin-bottom:16px;" +
        "flex-wrap:wrap;";

    customizeHeader.innerHTML =

        '<div>' +

        '<div style="' +
        'font-size:11px;' +
        'font-weight:800;' +
        'letter-spacing:1.5px;' +
        'color:#2563eb;' +
        'margin-bottom:4px;' +
        '">' +

        'STUDY TIME CONTROL' +

        '</div>' +

        '<div style="' +
        'font-size:13px;' +
        'color:#64748b;' +
        '">' +

        'Adjust how much time you want to give each subject.' +

        '</div>' +

        '</div>' +

        '<button ' +
        'type="button" ' +
        'id="resetCustomPlanBtn" ' +
        'style="' +
        'border:1px solid #dbe5ff;' +
        'background:#f8faff;' +
        'color:#2563eb;' +
        'padding:9px 13px;' +
        'border-radius:10px;' +
        'font-size:12px;' +
        'font-weight:700;' +
        'cursor:pointer;' +
        '">' +

        '↻ Reset to FOCLYRA' +

        '</button>';

    planList.appendChild(
        customizeHeader
    );

    /*
       PLAN ITEMS
    */

    let number =
        1;

    plan.forEach(
        function(session) {

            if (
                session.subject ===
                "Break"
            ) {

                const breakDiv =
                    document.createElement(
                        "div"
                    );

                breakDiv.className =
                    "smart-plan-break";

                breakDiv.textContent =
                    "☕ " +
                    Number(
                        session.minutes
                    ) +
                    " minute break";

                planList.appendChild(
                    breakDiv
                );

                return;
            }

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "smart-plan-item";

            const score =
                Number(
                    session.score
                ) || 0;

            let priorityLabel =
                "Medium Priority";

            if (
                score >= 75
            ) {

                priorityLabel =
                    "High Priority";

            } else if (
                score < 45
            ) {

                priorityLabel =
                    "Low Priority";
            }

            item.innerHTML =

                '<div class="plan-number">' +
                number +
                '</div>' +

                '<div class="plan-details">' +

                '<div class="plan-subject">' +

                escapeHTML(
                    cleanSubjectName(
                        session.subject
                    )
                ) +

                ' <span class="plan-priority">' +

                priorityLabel +

                '</span>' +

                '</div>' +

                '<div class="plan-reason">' +

                escapeHTML(
                    session.reason ||
                    "Planned according to your current study priorities."
                ) +

                '</div>' +

                '</div>' +

                '<div style="' +
                'display:flex;' +
                'align-items:center;' +
                'gap:8px;' +
                'margin-left:auto;' +
                '">' +

                '<button ' +
                'type="button" ' +
                'class="time-control-btn" ' +
                'data-subject="' +
                escapeHTML(
                    session.subject
                ) +
                '" ' +
                'data-change="-5" ' +
                'style="' +
                'width:30px;' +
                'height:30px;' +
                'border:1px solid #dbe5ff;' +
                'background:#f8faff;' +
                'color:#2563eb;' +
                'border-radius:8px;' +
                'font-size:17px;' +
                'font-weight:700;' +
                'cursor:pointer;' +
                '">' +

                '−' +

                '</button>' +

                '<div style="' +
                'min-width:58px;' +
                'text-align:center;' +
                'font-size:14px;' +
                'font-weight:800;' +
                'color:#172554;' +
                '">' +

                Number(
                    session.minutes
                ) +

                ' min' +

                '</div>' +

                '<button ' +
                'type="button" ' +
                'class="time-control-btn" ' +
                'data-subject="' +
                escapeHTML(
                    session.subject
                ) +
                '" ' +
                'data-change="5" ' +
                'style="' +
                'width:30px;' +
                'height:30px;' +
                'border:1px solid #dbe5ff;' +
                'background:#f8faff;' +
                'color:#2563eb;' +
                'border-radius:8px;' +
                'font-size:17px;' +
                'font-weight:700;' +
                'cursor:pointer;' +
                '">' +

                '+' +

                '</button>' +

                '</div>';

            planList.appendChild(
                item
            );

            number++;
        }
    );

    /*
       PLAN SUMMARY
    */

    const studyMinutes =
        plan
            .filter(
                function(session) {

                    return (
                        session.subject !==
                        "Break"
                    );
                }
            )
            .reduce(
                function(sum, session) {

                    return (
                        sum +
                        Number(
                            session.minutes
                        )
                    );
                },
                0
            );

    const breakMinutes =
        plan
            .filter(
                function(session) {

                    return (
                        session.subject ===
                        "Break"
                    );
                }
            )
            .reduce(
                function(sum, session) {

                    return (
                        sum +
                        Number(
                            session.minutes
                        )
                    );
                },
                0
            );

    const totalMinutes =
        studyMinutes +
        breakMinutes;

    const remaining =
        availableMinutes -
        totalMinutes;

    const summary =
        document.createElement(
            "div"
        );

    summary.style.cssText =
        "margin-top:16px;" +
        "padding:14px 16px;" +
        "background:#f8faff;" +
        "border:1px solid #e0e7ff;" +
        "border-radius:14px;" +
        "display:flex;" +
        "gap:18px;" +
        "flex-wrap:wrap;" +
        "font-size:12px;" +
        "color:#64748b;";

    summary.innerHTML =

        '<div>' +
        '<strong style="color:#172554;">Study</strong><br>' +
        studyMinutes +
        ' min' +
        '</div>' +

        '<div>' +
        '<strong style="color:#172554;">Breaks</strong><br>' +
        breakMinutes +
        ' min' +
        '</div>' +

        '<div>' +
        '<strong style="color:#172554;">Total</strong><br>' +
        totalMinutes +
        ' / ' +
        availableMinutes +
        ' min' +
        '</div>' +

        '<div>' +
        '<strong style="color:' +
        (
            remaining < 0
                ? "#dc2626"
                : "#16a34a"
        ) +
        ';">' +

        (
            remaining < 0
                ? "Over by "
                : "Remaining "
        ) +

        Math.abs(
            remaining
        ) +

        ' min</strong>' +
        '</div>';

    planList.appendChild(
        summary
    );

    /*
       PLAN SCORE
    */

    const planScore =
        document.getElementById(
            "planScore"
        );

    if (planScore) {

        planScore.textContent =
            customScore;
    }

    /*
       PLAN VALIDATION
    */

    const validationBox =
        document.getElementById(
            "planValidation"
        );

    if (validationBox) {

        if (
            validation.valid
        ) {

            validationBox.innerHTML =

                "✅ <strong>Plan accepted.</strong> " +

                totalMinutes +

                " minutes planned within your " +

                availableMinutes +

                " minute study window.";

            if (
                localStorage.getItem(
                    "foclyraPlanCustomized"
                ) === "true"
            ) {

                validationBox.innerHTML +=
                    " You customized the recommended plan.";
            }

        } else {

            validationBox.innerHTML =

                "⚠️ <strong>Plan needs adjustment.</strong> " +

                "Reduce some subject time so the plan fits your available study window.";
        }
    }

    /*
       BUTTON EVENTS
    */

    const resetButton =
        document.getElementById(
            "resetCustomPlanBtn"
        );

    if (resetButton) {

        resetButton.onclick =
            resetCustomPlan;
    }

    const timeButtons =
        planList.querySelectorAll(
            ".time-control-btn"
        );

    timeButtons.forEach(
        function(button) {

            button.onclick =
                function() {

                    changeSubjectTime(
                        button.dataset.subject,
                        Number(
                            button.dataset.change
                        )
                    );
                };
        }
    );
}/* =========================================================
   26. EXAM RADAR
   ========================================================= */

function createExamRadar() {

    const container =
        document.getElementById(
            "examRadar"
        );

    if (!container) {

        return;
    }

    const status =
        getExamDateStatus();

    if (
        !status.valid
    ) {

        container.innerHTML =
            '<div class="radar-empty">' +
            'Set your exam date in Edit Plan to activate Exam Radar.' +
            '</div>';

        return;
    }

    let title =
        "";

    let message =
        "";

    let urgencyClass =
        "";

    if (
        status.status ===
        "today"
    ) {

        title =
            "Exam day!";

        message =
            "Focus only on your highest-priority revision.";

        urgencyClass =
            "urgent";

    } else if (
        status.days <= 3
    ) {

        title =
            status.days +
            " days left";

        message =
            "Your exam is very close. FOCLYRA is prioritizing high-impact topics.";

        urgencyClass =
            "urgent";

    } else if (
        status.days <= 7
    ) {

        title =
            status.days +
            " days left";

        message =
            "Your preparation window is getting tighter.";

        urgencyClass =
            "warning";

    } else {

        title =
            status.days +
            " days left";

        message =
            "You still have time to build consistent preparation.";

        urgencyClass =
            "normal";
    }

    container.innerHTML =

        '<div class="exam-radar-card ' +
        urgencyClass +
        '">' +

        '<div class="exam-radar-title">' +
        escapeHTML(
            title
        ) +
        '</div>' +

        '<div class="exam-radar-message">' +
        escapeHTML(
            message
        ) +
        '</div>' +

        '</div>';
}


/* =========================================================
   27. WEAK TOPIC RADAR
   ========================================================= */

function getWeakTopicList() {

    const data =
        getStudentData();

    const raw =
        String(
            data.weakTopics || ""
        );

    if (!raw.trim()) {

        return [];
    }

    return raw
        .split(",")
        .map(function(topic) {

            return topic.trim();

        })
        .filter(function(topic) {

            return topic !== "";

        });
}


function createWeakTopicRadar() {

    const container =
        document.getElementById(
            "weakTopicRadar"
        );

    if (!container) {

        return;
    }

    const topics =
        getWeakTopicList();

    const priority =
        getValidPriority();

    /*
       Show only the most useful
       weak-topic signals instead
       of flooding the dashboard.
    */

    const visibleTopics =
        topics.slice(
            0,
            3
        );

    if (
        !visibleTopics.length &&
        !priority
    ) {

        container.innerHTML =

            '<div class="radar-empty">' +

            'No weak topics added yet. ' +

            'Add them in Edit Plan and FOCLYRA will use them to prioritize your study plan.' +

            '</div>';

        return;
    }

    let html =
        "";

    if (
        visibleTopics.length
    ) {

        html +=

            '<div class="weak-topic-list">';

        visibleTopics.forEach(
            function(topic, index) {

                html +=

                    '<div class="weak-topic-item">' +

                    '<div class="weak-topic-number">' +
                    (
                        index + 1
                    ) +
                    '</div>' +

                    '<div>' +

                    '<div class="weak-topic-name">' +
                    escapeHTML(
                        topic
                    ) +
                    '</div>' +

                    '<div class="weak-topic-label">' +
                    'Needs extra attention' +
                    '</div>' +

                    '</div>' +

                    '</div>';
            }
        );

        html +=
            '</div>';

    } else {

        html +=

            '<div class="radar-empty">' +
            'No weak topics entered yet.' +
            '</div>';
    }

    if (
        priority
    ) {

        html +=

            '<div class="priority-radar">' +

            '<span>Priority subject</span>' +

            '<strong>' +
            escapeHTML(
                priority
            ) +
            '</strong>' +

            '</div>';
    }

    container.innerHTML =
        html;
}


/* =========================================================
   28. RECOMMENDATION ENGINE
   ========================================================= */

function updateRecommendation() {

    const element =
        document.getElementById(
            "recommendationText"
        );

    if (!element) {

        return;
    }

    const data =
        getStudentData();

    const subjects =
        getSubjects();

    if (!subjects.length) {

        element.textContent =
            "Add your subjects in Edit Plan to receive a personalized recommendation.";

        return;
    }

    const bestSubject =
        getBestSubject();

    const days =
        getDaysUntilExam();

    const weakTopics =
        getWeakTopicList();

    let recommendation =
        "";

    if (
        days === 0
    ) {

        recommendation =
            "Your exam is today. Focus on " +
            bestSubject +
            " and revise only the most important concepts.";

    } else if (
        days !== null &&
        days <= 3
    ) {

        recommendation =
            "With only " +
            days +
            " days left, prioritize " +
            bestSubject +
            " and avoid spreading your time too thin.";

    } else if (
        weakTopics.length
    ) {

        recommendation =
            "Start with " +
            bestSubject +
            ", then spend part of your session fixing a weak topic.";

    } else if (
        Number(data.progress) < 40
    ) {

        recommendation =
            "Your current progress is still building. Focus on " +
            bestSubject +
            " and aim for consistent daily sessions.";

    } else {

        recommendation =
            "Keep your momentum by starting today's session with " +
            bestSubject +
            ".";
    }

    element.textContent =
        recommendation;
}


/* =========================================================
   29. WHY THIS RECOMMENDATION
   ========================================================= */

function createWhyThisExplanation() {

    const container =
        document.getElementById(
            "whyThis"
        );

    if (!container) {

        return;
    }

    const data =
        getStudentData();

    const bestSubject =
        getBestSubject();

    if (!bestSubject) {

        container.innerHTML =
            "Add your subjects to see why FOCLYRA recommends a topic.";

        return;
    }

    const result =
        calculateSubjectPriority(
            bestSubject,
            data
        );

    container.innerHTML =

        '<strong>Why this subject?</strong>' +

        '<div style="' +
        'margin-top:6px;' +
        'color:#64748b;' +
        'line-height:1.6;' +
        '">' +

        escapeHTML(
            result.reason
        ) +

        '</div>';
}


/* =========================================================
   30. MOTIVATION
   ========================================================= */

function showMotivation() {

    const element =
        document.getElementById(
            "motivationText"
        );

    if (!element) {

        return;
    }

    const messages = [

        "Small progress today becomes confidence tomorrow.",

        "You do not need a perfect day. You need a focused one.",

        "One completed session is better than an imagined perfect plan.",

        "Keep showing up. Consistency beats last-minute pressure.",

        "Your future self will thank you for studying today.",

        "Focus on the next session, not the entire syllabus."
    ];

    const index =
        new Date().getDate() %
        messages.length;

    element.textContent =
        messages[index];
}


/* =========================================================
   31. CONSISTENCY
   ========================================================= */

function getStudyHistory() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "studyHistory"
                ) || "[]"
            );

        return Array.isArray(saved)
            ? saved
            : [];

    } catch (error) {

        return [];
    }
}


function saveStudyHistory(
    minutes
) {

    const history =
        getStudyHistory();

    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );

    const existing =
        history.find(
            function(entry) {

                return (
                    entry.date ===
                    today
                );
            }
        );

    if (existing) {

        existing.minutes +=
            Number(minutes) || 0;

    } else {

        history.push({

            date:
                today,

            minutes:
                Number(minutes) || 0
        });
    }

    localStorage.setItem(
        "studyHistory",
        JSON.stringify(
            history
        )
    );
}


function calculateConsistency() {

    const history =
        getStudyHistory();

    if (!history.length) {

        return 0;
    }

    const today =
        new Date();

    let streak =
        0;

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const date =
            new Date(
                today
            );

        date.setDate(
            today.getDate() -
            i
        );

        const key =
            date.toISOString()
                .slice(
                    0,
                    10
                );

        const entry =
            history.find(
                function(item) {

                    return (
                        item.date ===
                        key &&
                        Number(
                            item.minutes
                        ) > 0
                    );
                }
            );

        if (!entry) {

            break;
        }

        streak++;
    }

    return streak;
}


function updateConsistency() {

    const element =
        document.getElementById(
            "consistencyValue"
        );

    if (!element) {

        return;
    }

    const streak =
        calculateConsistency();

    element.textContent =
        streak +
        (
            streak === 1
                ? " day"
                : " days"
        );
}


/* =========================================================
   32. STUDY MINUTES
   ========================================================= */

function getStudiedMinutes() {

    return Math.max(
        0,
        Number(
            localStorage.getItem(
                "studiedMinutes"
            )
        ) || 0
    );
}


function updateStudyMinutesDisplay() {

    const element =
        document.getElementById(
            "studiedMinutes"
        );

    if (!element) {

        return;
    }

    element.textContent =
        getStudiedMinutes();
}


/* =========================================================
   33. DAILY GOAL
   ========================================================= */

function updateDailyGoal() {

    const element =
        document.getElementById(
            "dailyGoal"
        );

    if (!element) {

        return;
    }

    const data =
        getStudentData();

    const goal =
        data.studyHours * 60;

    const studied =
        getStudiedMinutes();

    element.textContent =
        Math.min(
            studied,
            goal
        ) +
        " / " +
        goal +
        " min";
}


/* =========================================================
   34. PROGRESS
   ========================================================= */

function updateProgressDisplay() {

    const data =
        getStudentData();

    const progressElements =
        document.querySelectorAll(
            "[data-progress]"
        );

    progressElements.forEach(
        function(element) {

            element.textContent =
                data.progress +
                "%";
        }
    );

    const bars =
        document.querySelectorAll(
            "[data-progress-bar]"
        );

    bars.forEach(
        function(bar) {

            bar.style.width =
                data.progress +
                "%";
        }
    );
}


/* =========================================================
   35. SUBJECT DISPLAY
   ========================================================= */

function updateSubjectDisplay() {

    const subjects =
        getSubjects();

    const containers =
        document.querySelectorAll(
            "[data-subject-list]"
        );

    containers.forEach(
        function(container) {

            if (!subjects.length) {

                container.innerHTML =
                    '<div class="subject-empty">' +
                    'Add subjects in Edit Plan.' +
                    '</div>';

                return;
            }

            container.innerHTML =
                subjects
                    .map(
                        function(subject, index) {

                            return (

                                '<div class="subject-item">' +

                                '<span class="subject-number">' +
                                (
                                    index + 1
                                ) +
                                '</span>' +

                                '<span>' +
                                escapeHTML(
                                    subject
                                ) +
                                '</span>' +

                                '</div>'
                            );
                        }
                    )
                    .join("");
        }
    );
}


/* =========================================================
   36. STUDENT GREETING
   ========================================================= */

function updateStudentGreeting() {

    const data =
        getStudentData();

    const elements =
        document.querySelectorAll(
            "[data-student-name]"
        );

    elements.forEach(
        function(element) {

            element.textContent =
                data.name ||
                "Student";
        }
    );
}


/* =========================================================
   37. EXAM COUNTDOWN DISPLAY
   ========================================================= */

function updateExamCountdownDisplay() {

    const elements =
        document.querySelectorAll(
            "[data-exam-countdown]"
        );

    if (!elements.length) {

        return;
    }

    const status =
        getExamDateStatus();

    let text =
        "";

    if (
        status.status ===
        "missing"
    ) {

        text =
            "Set exam date";

    } else if (
        status.status ===
        "invalid"
    ) {

        text =
            "Invalid exam date";

    } else if (
        status.status ===
        "past"
    ) {

        text =
            "Exam date has passed";

    } else if (
        status.status ===
        "today"
    ) {

        text =
            "Exam day!";

    } else {

        text =
            status.days +
            " days";
    }

    elements.forEach(
        function(element) {

            element.textContent =
                text;
        }
    );
}


/* =========================================================
   38. PLAN HEALTH
   ========================================================= */

function updatePlanHealth() {

    const element =
        document.getElementById(
            "planHealth"
        );

    if (!element) {

        return;
    }

    const plan =
        ensureCurrentPlan();

    const availableMinutes =
        getStudentData()
            .studyHours * 60;

    const validation =
        validatePlan(
            plan,
            availableMinutes
        );

    let label =
        "Needs setup";

    if (
        validation.valid &&
        validation.score >= 90
    ) {

        label =
            "Excellent";

    } else if (
        validation.valid &&
        validation.score >= 70
    ) {

        label =
            "Healthy";

    } else if (
        validation.valid
    ) {

        label =
            "Good";

    } else if (
        plan.length
    ) {

        label =
            "Needs adjustment";
    }

    element.textContent =
        label;
}


/* =========================================================
   39. DASHBOARD REFRESH
   ========================================================= */

function refreshFoclyraDashboard() {

    displaySmartPlan();

    updateRecommendation();

    createWhyThisExplanation();

    createExamRadar();

    createWeakTopicRadar();

    updateConsistency();

    updateStudyMinutesDisplay();

    updateDailyGoal();

    updateProgressDisplay();

    updateSubjectDisplay();

    updateStudentGreeting();

    updateExamCountdownDisplay();

    updatePlanHealth();

    showMotivation();
}/* =========================================================
   40. FOCUS TIMER
   ========================================================= */

let foclyraTimerInterval = null;

let foclyraTimerSeconds = 25 * 60;

let foclyraTimerRunning = false;


function formatTimer(
    seconds
) {

    const safeSeconds =
        Math.max(
            0,
            Number(seconds) || 0
        );

    const minutes =
        Math.floor(
            safeSeconds / 60
        );

    const remainingSeconds =
        safeSeconds % 60;

    return (

        String(minutes)
            .padStart(2, "0") +

        ":" +

        String(
            remainingSeconds
        )
            .padStart(2, "0")
    );
}


function updateFocusTimerDisplay() {

    const elements =
        document.querySelectorAll(
            "[data-focus-timer]"
        );

    elements.forEach(
        function(element) {

            element.textContent =
                formatTimer(
                    foclyraTimerSeconds
                );
        }
    );

    const legacyElement =
        document.getElementById(
            "timer"
        );

    if (legacyElement) {

        legacyElement.textContent =
            formatTimer(
                foclyraTimerSeconds
            );
    }
}


function saveFocusSession(
    minutes
) {

    const safeMinutes =
        Math.max(
            0,
            Math.floor(
                Number(minutes) || 0
            )
        );

    if (
        safeMinutes <= 0
    ) {

        return;
    }

    const current =
        getStudiedMinutes();

    localStorage.setItem(
        "studiedMinutes",
        String(
            current +
            safeMinutes
        )
    );

    saveStudyHistory(
        safeMinutes
    );

    updateStudyMinutesDisplay();

    updateDailyGoal();

    updateConsistency();
}


function completeFocusSession() {

    saveFocusSession(
        25
    );

    foclyraTimerSeconds =
        25 * 60;

    foclyraTimerRunning =
        false;

    clearInterval(
        foclyraTimerInterval
    );

    foclyraTimerInterval =
        null;

    updateFocusTimerDisplay();

    const status =
        document.getElementById(
            "timerStatus"
        );

    if (status) {

        status.textContent =
            "Focus session complete! 🎉";
    }

    alert(
        "Great work! Your 25-minute focus session has been added."
    );
}


function startFocusTimer() {

    if (
        foclyraTimerRunning
    ) {

        return;
    }

    if (
        foclyraTimerSeconds <= 0
    ) {

        foclyraTimerSeconds =
            25 * 60;
    }

    foclyraTimerRunning =
        true;

    const status =
        document.getElementById(
            "timerStatus"
        );

    if (status) {

        status.textContent =
            "Focus mode active";
    }

    foclyraTimerInterval =
        setInterval(
            function() {

                foclyraTimerSeconds--;

                updateFocusTimerDisplay();

                if (
                    foclyraTimerSeconds <= 0
                ) {

                    completeFocusSession();
                }

            },
            1000
        );
}


function pauseFocusTimer() {

    foclyraTimerRunning =
        false;

    clearInterval(
        foclyraTimerInterval
    );

    foclyraTimerInterval =
        null;

    const status =
        document.getElementById(
            "timerStatus"
        );

    if (status) {

        status.textContent =
            "Focus session paused";
    }
}


function resetFocusTimer() {

    foclyraTimerRunning =
        false;

    clearInterval(
        foclyraTimerInterval
    );

    foclyraTimerInterval =
        null;

    foclyraTimerSeconds =
        25 * 60;

    updateFocusTimerDisplay();

    const status =
        document.getElementById(
            "timerStatus"
        );

    if (status) {

        status.textContent =
            "Ready for a 25-minute focus session";
    }
}


function setupFocusTimer() {

    const startButtons =
        document.querySelectorAll(
            "[data-focus-start], #startTimer, #startBtn"
        );

    const pauseButtons =
        document.querySelectorAll(
            "[data-focus-pause], #pauseTimer, #pauseBtn"
        );

    const resetButtons =
        document.querySelectorAll(
            "[data-focus-reset], #resetTimer, #resetBtn"
        );

    startButtons.forEach(
        function(button) {

            button.onclick =
                startFocusTimer;
        }
    );

    pauseButtons.forEach(
        function(button) {

            button.onclick =
                pauseFocusTimer;
        }
    );

    resetButtons.forEach(
        function(button) {

            button.onclick =
                resetFocusTimer;
        }
    );

    updateFocusTimerDisplay();
}


/* =========================================================
   41. PLAN RESCUE
   ========================================================= */

function createPlanRescue() {

    const container =
        document.getElementById(
            "planRescue"
        );

    if (!container) {

        return;
    }

    const plan =
        loadFoclyraPlan();

    if (!plan.length) {

        container.innerHTML =
            '<div class="radar-empty">' +
            'Your Plan Rescue will appear after FOCLYRA creates a study plan.' +
            '</div>';

        return;
    }

    const missedSubject =
        localStorage.getItem(
            "missedSubject"
        ) || "";

    const cleanMissed =
        cleanSubjectName(
            missedSubject
        );

    if (!cleanMissed) {

        container.innerHTML =

            '<div class="rescue-content">' +

            '<strong>Plan Rescue is ready.</strong>' +

            '<div style="' +
            'margin-top:6px;' +
            'color:#64748b;' +
            'line-height:1.6;' +
            '">' +

            'If you miss a session, FOCLYRA can rebalance the remaining plan instead of letting the backlog grow.' +

            '</div>' +

            '<button ' +
            'type="button" ' +
            'id="simulateMissedSessionBtn" ' +
            'style="' +
            'margin-top:12px;' +
            'border:0;' +
            'background:#2563eb;' +
            'color:white;' +
            'padding:10px 14px;' +
            'border-radius:10px;' +
            'font-weight:700;' +
            'cursor:pointer;' +
            '">' +

            'Simulate Missed Session' +

            '</button>' +

            '</div>';

        const simulateButton =
            document.getElementById(
                "simulateMissedSessionBtn"
            );

        if (simulateButton) {

            simulateButton.onclick =
                function() {

                    const best =
                        getBestSubject();

                    if (!best) {

                        return;
                    }

                    localStorage.setItem(
                        "missedSubject",
                        best
                    );

                    createPlanRescue();
                };
        }

        return;
    }

    const subjects =
        getSubjects();

    const candidates =
        subjects
            .filter(
                function(subject) {

                    return (
                        cleanSubjectName(
                            subject
                        ).toLowerCase() !==
                        cleanMissed.toLowerCase()
                    );
                }
            )
            .map(
                function(subject) {

                    return calculateSubjectPriority(
                        subject,
                        getStudentData()
                    );
                }
            )
            .sort(
                function(a, b) {

                    return (
                        b.score -
                        a.score
                    );
                }
            );

    const rescueTarget =
        candidates.length
            ? candidates[0].subject
            : cleanMissed;

    container.innerHTML =

        '<div class="rescue-content">' +

        '<div style="' +
        'font-size:11px;' +
        'font-weight:800;' +
        'letter-spacing:1.4px;' +
        'color:#2563eb;' +
        'margin-bottom:6px;' +
        '">' +

        'PLAN RESCUE' +

        '</div>' +

        '<strong>' +

        'Missed: ' +

        escapeHTML(
            cleanMissed
        ) +

        '</strong>' +

        '<div style="' +
        'margin-top:7px;' +
        'color:#64748b;' +
        'line-height:1.6;' +
        '">' +

        'FOCLYRA recommends shifting attention toward ' +

        '<strong>' +

        escapeHTML(
            rescueTarget
        ) +

        '</strong>' +

        ' while keeping the plan within your available study time.' +

        '</div>' +

        '<button ' +
        'type="button" ' +
        'id="applyRescueBtn" ' +
        'style="' +
        'margin-top:12px;' +
        'border:0;' +
        'background:#2563eb;' +
        'color:white;' +
        'padding:10px 14px;' +
        'border-radius:10px;' +
        'font-weight:700;' +
        'cursor:pointer;' +
        '">' +

        'Apply Rescue Plan' +

        '</button>' +

        '<button ' +
        'type="button" ' +
        'id="clearRescueBtn" ' +
        'style="' +
        'margin-top:12px;' +
        'margin-left:8px;' +
        'border:1px solid #dbe5ff;' +
        'background:#f8faff;' +
        'color:#2563eb;' +
        'padding:10px 14px;' +
        'border-radius:10px;' +
        'font-weight:700;' +
        'cursor:pointer;' +
        '">' +

        'Clear' +

        '</button>' +

        '</div>';

    const applyButton =
        document.getElementById(
            "applyRescueBtn"
        );

    if (applyButton) {

        applyButton.onclick =
            function() {

                applyPlanRescue(
                    cleanMissed,
                    rescueTarget
                );
            };
    }

    const clearButton =
        document.getElementById(
            "clearRescueBtn"
        );

    if (clearButton) {

        clearButton.onclick =
            function() {

                localStorage.removeItem(
                    "missedSubject"
                );

                createPlanRescue();
            };
    }
}


/* =========================================================
   42. APPLY PLAN RESCUE
   ========================================================= */

function applyPlanRescue(
    missedSubject,
    replacementSubject
) {

    const data =
        getStudentData();

    const availableMinutes =
        data.studyHours * 60;

    let plan =
        loadFoclyraPlan();

    if (!plan.length) {

        createFoclyraPlan();

        plan =
            loadFoclyraPlan();
    }

    /*
       Remove the missed study
       session from the active plan.
    */

    const filtered =
        plan.filter(
            function(session) {

                return !(
                    session.subject !==
                    "Break" &&

                    cleanSubjectName(
                        session.subject
                    ).toLowerCase() ===
                    cleanSubjectName(
                        missedSubject
                    ).toLowerCase()
                );
            }
        );

    /*
       Remove all breaks temporarily.
    */

    const studySessions =
        filtered.filter(
            function(session) {

                return (
                    session.subject !==
                    "Break"
                );
            }
        );

    /*
       Add the replacement
       subject only if it is not
       already represented.
    */

    const alreadyExists =
        studySessions.some(
            function(session) {

                return (
                    cleanSubjectName(
                        session.subject
                    ).toLowerCase() ===
                    cleanSubjectName(
                        replacementSubject
                    ).toLowerCase()
                );
            }
        );

    if (!alreadyExists) {

        const priority =
            calculateSubjectPriority(
                replacementSubject,
                data
            );

        studySessions.push({

            id:
                "rescue-" +
                Date.now(),

            subject:
                cleanSubjectName(
                    replacementSubject
                ),

            minutes:
                25,

            score:
                priority.score,

            reason:
                "Added by Plan Rescue after a missed session.",

            status:
                "rescheduled"
        });
    }

    /*
       Remove duplicate subjects
       while preserving the strongest
       session.
    */

    const unique = [];

    studySessions.forEach(
        function(session) {

            const exists =
                unique.find(
                    function(item) {

                        return (
                            cleanSubjectName(
                                item.subject
                            ).toLowerCase() ===
                            cleanSubjectName(
                                session.subject
                            ).toLowerCase()
                        );
                    }
                );

            if (!exists) {

                unique.push(
                    session
                );

            } else if (
                Number(
                    session.score
                ) >
                Number(
                    exists.score
                )
            ) {

                exists.minutes =
                    session.minutes;

                exists.score =
                    session.score;

                exists.reason =
                    session.reason;
            }
        }
    );

    /*
       Keep the strongest sessions
       first.
    */

    unique.sort(
        function(a, b) {

            return (
                (
                    Number(b.score) || 0
                ) -
                (
                    Number(a.score) || 0
                )
            );
        }
    );

    /*
       Make sure total study time
       fits inside the student's
       available time.
    */

    let remaining =
        availableMinutes;

    const rescuedSessions =
        [];

    unique.forEach(
        function(session) {

            if (
                remaining < 25
            ) {

                return;
            }

            const minutes =
                Math.min(
                    Number(
                        session.minutes
                    ) || 25,
                    90,
                    remaining
                );

            if (
                minutes >= 25
            ) {

                session.minutes =
                    minutes;

                rescuedSessions.push(
                    session
                );

                remaining -=
                    minutes;
            }
        }
    );

    /*
       Rebuild breaks.
    */

    const rescuedPlan =
        [];

    rescuedSessions.forEach(
        function(session, index) {

            rescuedPlan.push(
                session
            );

            if (
                index <
                rescuedSessions.length - 1
            ) {

                rescuedPlan.push({

                    id:
                        "rescue-break-" +
                        Date.now() +
                        "-" +
                        index,

                    subject:
                        "Break",

                    minutes:
                        10,

                    score:
                        0,

                    reason:
                        "Recovery break to protect focus.",

                    status:
                        "break"
                });
            }
        }
    );

    /*
       If breaks caused the total
       to exceed available time,
       remove the last session until
       the plan fits.
    */

    while (
        validatePlan(
            rescuedPlan,
            availableMinutes
        ).totalMinutes >
        availableMinutes
    ) {

        let removed =
            false;

        for (
            let i =
                rescuedPlan.length - 1;
            i >= 0;
            i--
        ) {

            if (
                rescuedPlan[i]
                    .subject !==
                "Break"
            ) {

                rescuedPlan.splice(
                    i,
                    1
                );

                removed =
                    true;

                break;
            }
        }

        if (!removed) {

            break;
        }

        /*
           Rebuild breaks again.
        */

        const rebuilt =
            [];

        const sessions =
            rescuedPlan.filter(
                function(session) {

                    return (
                        session.subject !==
                        "Break"
                    );
                }
            );

        sessions.forEach(
            function(session, index) {

                rebuilt.push(
                    session
                );

                if (
                    index <
                    sessions.length - 1
                ) {

                    rebuilt.push({

                        id:
                            "rescue-break-" +
                            Date.now() +
                            "-" +
                            index,

                        subject:
                            "Break",

                        minutes:
                            10,

                        score:
                            0,

                        reason:
                            "Recovery break to protect focus.",

                        status:
                            "break"
                    });
                }
            }
        );

        rescuedPlan.length =
            0;

        rebuilt.forEach(
            function(item) {

                rescuedPlan.push(
                    item
                );
            }
        );
    }

    localStorage.setItem(
        "foclyraPlan",
        JSON.stringify(
            rescuedPlan
        )
    );

    localStorage.setItem(
        "foclyraPlanValidation",
        JSON.stringify(
            validatePlan(
                rescuedPlan,
                availableMinutes
            )
        )
    );

    localStorage.setItem(
        "foclyraPlanCustomized",
        "true"
    );

    localStorage.removeItem(
        "missedSubject"
    );

    localStorage.setItem(
        "foclyraPlanSignature",
        getPlanSignature()
    );

    refreshFoclyraDashboard();

    alert(
        "Plan Rescue applied. FOCLYRA rebuilt today's plan around your remaining time."
    );
}


/* =========================================================
   43. DATA RESET
   ========================================================= */

function resetFoclyraData() {

    const confirmed =
        confirm(
            "Reset all FOCLYRA study data?"
        );

    if (!confirmed) {

        return;
    }

    const keys = [

        "studentName",

        "subjects",

        "examDate",

        "studyHours",

        "priority",

        "progress",

        "confidence",

        "difficulty",

        "importance",

        "weakTopics",

        "foclyraPlan",

        "foclyraPlanValidation",

        "foclyraPlanSignature",

        "foclyraCustomPlan",

        "foclyraPlanCustomized",

        "missedSubject",

        "studiedMinutes",

        "studyHistory"
    ];

    keys.forEach(
        function(key) {

            localStorage.removeItem(
                key
            );
        }
    );

    location.reload();
}


/* =========================================================
   44. GENERIC BUTTON HELPERS
   ========================================================= */

function setupResetButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-reset-foclyra], #resetData"
        );

    buttons.forEach(
        function(button) {

            button.onclick =
                resetFoclyraData;
        }
    );
}


function setupRefreshButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-refresh-dashboard], #refreshDashboard"
        );

    buttons.forEach(
        function(button) {

            button.onclick =
                function() {

                    refreshFoclyraDashboard();
                };
        }
    );
}


/* =========================================================
   45. PAGE DETECTION
   ========================================================= */

function getCurrentPage() {

    return (
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase()
    );
}


/* =========================================================
   46. PAGE STARTUP
   ========================================================= */

function startFoclyra() {

    const page =
        getCurrentPage();

    /*
       Dashboard
    */

    if (
        page ===
        "dashboard.html" ||
        page ===
        ""
    ) {

        refreshFoclyraDashboard();

        createPlanRescue();
    }

    /*
       Focus page
    */

    if (
        page ===
        "focus.html"
    ) {

        setupFocusTimer();

        updateStudyMinutesDisplay();

        updateDailyGoal();

        updateConsistency();
    }

    /*
       Planner
    */

    if (
        page ===
        "planner.html"
    ) {

        updateStudentGreeting();

        updateSubjectDisplay();

        updateExamCountdownDisplay();
    }

    /*
       Any page containing
       dashboard-style widgets.
    */

    if (
        document.getElementById(
            "smartPlanList"
        )
    ) {

        displaySmartPlan();
    }

    if (
        document.getElementById(
            "examRadar"
        )
    ) {

        createExamRadar();
    }

    if (
        document.getElementById(
            "weakTopicRadar"
        )
    ) {

        createWeakTopicRadar();
    }

    if (
        document.getElementById(
            "planRescue"
        )
    ) {

        createPlanRescue();
    }

    setupResetButtons();

    setupRefreshButtons();
}


/* =========================================================
   47. SAFE START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startFoclyra
    );

} else {

    startFoclyra();
}


/* =========================================================
   48. DEBUG HELPERS
   ========================================================= */

window.FOCLYRA = {

    getStudentData:
        getStudentData,

    getSubjects:
        getSubjects,

    getExamDateStatus:
        getExamDateStatus,

    calculateSubjectPriority:
        calculateSubjectPriority,

    generateSmartPlan:
        generateSmartPlan,

    validatePlan:
        validatePlan,

    createFoclyraPlan:
        createFoclyraPlan,

    loadFoclyraPlan:
        loadFoclyraPlan,

    refreshDashboard:
        refreshFoclyraDashboard,

    resetData:
        resetFoclyraData
};


/* =========================================================
   END OF FOCLYRA script.js
   ========================================================= */
   /* =========================================================
   FOCLYRA COMPATIBILITY FIX
   Connect planner data with dashboard
   ========================================================= */

(function () {

    function syncPlannerData() {

        const savedName =
            localStorage.getItem("name") || "";

        if (savedName) {

            localStorage.setItem(
                "studentName",
                savedName
            );
        }
    }


    function refreshDashboardIdentity() {

        syncPlannerData();

        const data =
            getStudentData();

        const userName =
            document.getElementById(
                "userName"
            );

        if (userName) {

            userName.textContent =
                data.name ||
                "Student";
        }


        const prioritySubject =
            document.getElementById(
                "prioritySubject"
            );

        if (prioritySubject) {

            const priority =
                getValidPriority();

            prioritySubject.textContent =
                priority ||
                getBestSubject() ||
                "Your priority subject";
        }


        const countdown =
            document.getElementById(
                "countdown"
            );

        if (countdown) {

            const status =
                getExamDateStatus();

            if (
                status.status === "missing"
            ) {

                countdown.textContent =
                    "No exam date";

            } else if (
                status.status === "invalid"
            ) {

                countdown.textContent =
                    "Enter a valid exam date";

            } else if (
                status.status === "past"
            ) {

                countdown.textContent =
                    "Exam date has passed";

            } else if (
                status.status === "today"
            ) {

                countdown.textContent =
                    "Exam day!";

            } else {

                countdown.textContent =
                    status.days +
                    " days";
            }
        }
    }


    /*
       Run after the planner's own
       DOMContentLoaded save code.
    */

    window.addEventListener(
        "load",
        function () {

            syncPlannerData();

            refreshDashboardIdentity();

        }
    );

})();

/* =========================================================
   FINAL FOCLYRA COMPATIBILITY PATCH
   - Supports both old and current dashboard IDs
   - Keeps planner data consistent
   - Fixes name, subjects, study hours, countdown,
     plan score and plan health rendering
   - Safe to run with the existing FOCLYRA functions
   ========================================================= */

(function () {

    function readText(keys) {
        for (const key of keys) {
            const value = localStorage.getItem(key);
            if (value !== null && String(value).trim() !== "") {
                return String(value).trim();
            }
        }
        return "";
    }

    function getSafeNumber(key, fallback, min, max) {
        const raw = Number(localStorage.getItem(key));
        if (!Number.isFinite(raw)) return fallback;
        return Math.max(min, Math.min(max, raw));
    }

    /* ---------------------------------------------------------
       STUDENT DATA — single source of truth
       --------------------------------------------------------- */

    getStudentData = function () {
        return {
            name: readText(["name", "studentName"]) || "Student",
            subjects: readText(["subjects"]),
            examDate: readText(["examDate"]),
            studyHours: Math.round(
                getSafeNumber("studyHours", 2, 1, 6)
            ),
            priority: readText(["priority"]),
            progress: Math.round(
                getSafeNumber("progress", 0, 0, 100)
            ),
            confidence: readText(["confidence"]) || "medium",
            difficulty: readText(["difficulty"]) || "medium",
            importance: readText(["importance"]) || "medium",
            weakTopics: readText(["weakTopics"])
        };
    };

    /* Keep both keys synchronized for old/new code. */
    function syncPlannerStorage() {
        const name = readText(["name", "studentName"]);
        if (name) {
            localStorage.setItem("name", name);
            localStorage.setItem("studentName", name);
        }
    }

    /* ---------------------------------------------------------
       DASHBOARD ID HELPERS
       --------------------------------------------------------- */

    function firstElement(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    function allElements(selectors) {
        const set = new Set();
        selectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                set.add(el);
            });
        });
        return Array.from(set);
    }

    /* ---------------------------------------------------------
       GREETING
       --------------------------------------------------------- */

    updateStudentGreeting = function () {
        syncPlannerStorage();
        const name = getStudentData().name || "Student";

        allElements([
            "[data-student-name]",
            "#userName",
            "#studentName",
            ".student-name"
        ]).forEach(function (element) {
            element.textContent = name;
        });
    };

    /* ---------------------------------------------------------
       SUBJECTS
       --------------------------------------------------------- */

    updateSubjectDisplay = function () {
        const subjects = String(getStudentData().subjects || "")
            .split(",")
            .map(function (subject) {
                return String(subject).trim();
            })
            .filter(Boolean);

        allElements([
            "[data-subject-list]",
            "#subjectList",
            "#subjectsList",
            ".subject-list"
        ]).forEach(function (container) {

            if (!subjects.length) {
                container.innerHTML =
                    '<div class="subject-empty">Add subjects in Edit Plan.</div>';
                return;
            }

            container.innerHTML = subjects.map(function (subject, index) {
                return (
                    '<div class="subject-item">' +
                    '<span class="subject-number">' +
                    (index + 1) +
                    '</span>' +
                    '<span>' +
                    escapeHTML(subject) +
                    '</span>' +
                    '</div>'
                );
            }).join("");
        });
    };

    /* ---------------------------------------------------------
       EXAM COUNTDOWN
       --------------------------------------------------------- */

    updateExamCountdownDisplay = function () {
        const elements = allElements([
            "[data-exam-countdown]",
            "#countdown",
            "#examCountdown",
            "#examDays",
            ".exam-countdown"
        ]);

        if (!elements.length) return;

        const saved = getStudentData().examDate;
        let text = "Set exam date";

        if (!saved) {
            text = "Set exam date";
        } else {
            const exam = new Date(saved + "T00:00:00");
            if (Number.isNaN(exam.getTime())) {
                text = "Invalid exam date";
            } else {
                const today = new Date();
                const startToday = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );
                const startExam = new Date(
                    exam.getFullYear(),
                    exam.getMonth(),
                    exam.getDate()
                );
                const days = Math.ceil(
                    (startExam.getTime() - startToday.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (days < 0) text = "Exam date has passed";
                else if (days === 0) text = "Exam day!";
                else text = days + " days";
            }
        }

        elements.forEach(function (element) {
            element.textContent = text;
        });
    };

    /* ---------------------------------------------------------
       DAILY STUDY GOAL
       --------------------------------------------------------- */

    updateDailyGoal = function () {
        const hours = getStudentData().studyHours;
        const studied = Math.max(
            0,
            Number(localStorage.getItem("studiedMinutes")) || 0
        );
        const goal = hours * 60;

        allElements([
            "#dailyGoal",
            "#dailyStudyGoal",
            "#dailyStudyHours",
            "[data-daily-goal]",
            "[data-study-goal]"
        ]).forEach(function (element) {
            /* Preserve compact dashboard cards when they exist. */
            if (
                element.id === "dailyStudyHours" ||
                element.dataset.studyGoal === "hours"
            ) {
                element.textContent = hours + " hours";
            } else {
                element.textContent =
                    Math.min(studied, goal) +
                    " / " +
                    goal +
                    " min";
            }
        });

        /* Some dashboard versions use #studyHours for the daily goal card. */
        const dashboardHours = document.querySelector("#studyHours");
        if (dashboardHours && dashboardHours.tagName !== "INPUT") {
            dashboardHours.textContent = hours;
        }
    };

    /* ---------------------------------------------------------
       DASHBOARD DATA
       --------------------------------------------------------- */

    loadDashboardData = function () {
        syncPlannerStorage();
        const data = getStudentData();

        allElements([
            "#userName",
            "#studentName",
            "[data-student-name]"
        ]).forEach(function (element) {
            element.textContent = data.name;
        });

        const priority =
            data.priority ||
            (typeof getBestSubject === "function" ? getBestSubject() : "") ||
            "Your priority subject";

        allElements([
            "#prioritySubject",
            "[data-priority-subject]"
        ]).forEach(function (element) {
            element.textContent = priority;
        });

        allElements([
            "#studyHours",
            "#dailyStudyHoursValue",
            "[data-study-hours]"
        ]).forEach(function (element) {
            if (element.tagName !== "INPUT") {
                element.textContent = data.studyHours;
            }
        });

        updateSubjectDisplay();
        updateExamCountdownDisplay();
        updateDailyGoal();
    };

    /* ---------------------------------------------------------
       SMART PLAN + PLAN SCORE
       --------------------------------------------------------- */

    function getWorkingPlan() {
        let plan = [];

        try {
            if (typeof ensureCurrentPlan === "function") {
                plan = ensureCurrentPlan();
            } else if (typeof loadFoclyraPlan === "function") {
                plan = loadFoclyraPlan();
            }
        } catch (error) {
            console.error("FOCLYRA plan load error:", error);
        }

        return Array.isArray(plan) ? plan : [];
    }

    function getValidationForPlan(plan) {
        const available =
            Math.max(25, getStudentData().studyHours * 60);

        try {
            if (typeof validatePlan === "function") {
                return validatePlan(plan, available) || {};
            }
        } catch (error) {
            console.error("FOCLYRA validation error:", error);
        }

        return {};
    }

    function renderPlanScore(plan) {
        const validation = getValidationForPlan(plan);
        const score = Number(validation.score);
        const safeScore = Number.isFinite(score)
            ? Math.round(Math.max(0, Math.min(100, score)))
            : 0;

        allElements([
            "#planScore",
            "[data-plan-score]"
        ]).forEach(function (element) {
            element.textContent = String(safeScore);
        });

        return {
            validation: validation,
            score: safeScore
        };
    }

    /* Wrap the existing renderer rather than throwing it away. */
    const originalDisplaySmartPlan = displaySmartPlan;

    displaySmartPlan = function () {
        try {
            originalDisplaySmartPlan();
        } catch (error) {
            console.error("FOCLYRA Smart Plan render error:", error);
        }

        const plan = getWorkingPlan();
        renderPlanScore(plan);
    };

    /* ---------------------------------------------------------
       PLAN HEALTH — supports current and legacy dashboard markup
       --------------------------------------------------------- */

    updatePlanHealth = function () {
        const scoreElements = allElements([
            "#planHealthScore",
            "[data-plan-health-score]"
        ]);
        const statusElements = allElements([
            "#planHealthStatus",
            "[data-plan-health-status]"
        ]);
        const detailsElements = allElements([
            "#planHealthDetails",
            "[data-plan-health-details]"
        ]);
        const suggestionElements = allElements([
            "#planHealthSuggestion",
            "[data-plan-health-suggestion]"
        ]);
        const legacy = document.getElementById("planHealth");

        const plan = getWorkingPlan();
        const result = renderPlanScore(plan);
        const score = result.score;
        const validation = result.validation;

        if (!plan.length) {
            scoreElements.forEach(function (el) {
                el.textContent = "--";
            });
            statusElements.forEach(function (el) {
                el.textContent = "Create your Smart Plan first.";
            });
            detailsElements.forEach(function (el) {
                el.textContent = "FOCLYRA is waiting for your study plan.";
            });
            suggestionElements.forEach(function (el) {
                el.textContent = "Add your subjects and generate a plan.";
            });
            if (legacy) legacy.textContent = "Needs setup";
            return;
        }

        let status = "";
        if (score >= 85) {
            status = "🟢 Healthy — your plan looks realistic.";
        } else if (score >= 70) {
            status = "🟡 Needs a small adjustment.";
        } else {
            status = "🔴 Needs attention — your plan may be difficult to follow.";
        }

        scoreElements.forEach(function (el) {
            el.textContent = String(score);
        });

        statusElements.forEach(function (el) {
            el.textContent = status;
        });

        const totalMinutes = Number(validation.totalMinutes) ||
            plan.reduce(function (total, item) {
                return total + (Number(item.minutes) || 0);
            }, 0);

        const availableMinutes =
            getStudentData().studyHours * 60;

        const details = [];
        if (totalMinutes <= availableMinutes) {
            details.push("✓ Plan fits your available study time.");
        } else {
            details.push("⚠ Plan exceeds your available study time.");
        }

        const studySessions = plan.filter(function (item) {
            return item && item.subject && item.subject !== "Break";
        });

        const realistic = studySessions.every(function (item) {
            const minutes = Number(item.minutes) || 0;
            return minutes >= 25 && minutes <= 90;
        });

        if (realistic) {
            details.push("✓ Study sessions are realistic.");
        } else {
            details.push("⚠ One or more study sessions need adjustment.");
        }

        if (validation.hasOverlap) {
            details.push("⚠ Some sessions overlap.");
        } else {
            details.push("✓ No session overlap detected.");
        }

        detailsElements.forEach(function (el) {
            el.innerHTML = details
                .map(function (item) {
                    return "<div>" + escapeHTML(item) + "</div>";
                })
                .join("");
        });

        const suggestion =
            totalMinutes > availableMinutes
                ? "FOCLYRA suggests reducing or redistributing today's sessions."
                : score >= 85
                    ? "✨ Your plan is balanced. Follow it consistently."
                    : "💡 Make one small adjustment instead of rebuilding everything.";

        suggestionElements.forEach(function (el) {
            el.innerHTML = "<strong>FOCLYRA suggests:</strong> " +
                escapeHTML(suggestion);
        });

        if (legacy) {
            legacy.textContent = score >= 90
                ? "Excellent"
                : score >= 70
                    ? "Healthy"
                    : "Needs adjustment";
        }
    };

    /* ---------------------------------------------------------
       DASHBOARD REFRESH
       --------------------------------------------------------- */

    refreshFoclyraDashboard = function () {
        try { loadDashboardData(); } catch (e) { console.error(e); }
        try { displaySmartPlan(); } catch (e) { console.error(e); }
        try { createExamRadar(); } catch (e) { console.error(e); }
        try { createWeakTopicRadar(); } catch (e) { console.error(e); }
        try { updateRecommendation(); } catch (e) { console.error(e); }
        try { createWhyThisExplanation(); } catch (e) { console.error(e); }
        try { updateConsistency(); } catch (e) { console.error(e); }
        try { updateStudyMinutesDisplay(); } catch (e) { console.error(e); }
        try { updateDailyGoal(); } catch (e) { console.error(e); }
        try { updateProgressDisplay(); } catch (e) { console.error(e); }
        try { updateSubjectDisplay(); } catch (e) { console.error(e); }
        try { updateStudentGreeting(); } catch (e) { console.error(e); }
        try { updateExamCountdownDisplay(); } catch (e) { console.error(e); }
        try { updatePlanHealth(); } catch (e) { console.error(e); }
        try { showMotivation(); } catch (e) { console.error(e); }
    };

    /* ---------------------------------------------------------
       FINAL STARTUP
       --------------------------------------------------------- */

    function finalStartup() {
        syncPlannerStorage();

        const path = window.location.pathname.toLowerCase();
        const isDashboard =
            path.endsWith("dashboard.html") ||
            document.getElementById("smartPlanList") ||
            document.querySelector(".smart-plan-section");

        if (isDashboard) {
            refreshFoclyraDashboard();
            try { createPlanRescue(); } catch (e) { console.error(e); }
        }

        if (path.endsWith("focus.html")) {
            try { setupFocusTimer(); } catch (e) { console.error(e); }
            try { updateStudyMinutesDisplay(); } catch (e) { console.error(e); }
            try { updateDailyGoal(); } catch (e) { console.error(e); }
            try { updateConsistency(); } catch (e) { console.error(e); }
        }

        if (path.endsWith("planner.html")) {
            try { updateStudentGreeting(); } catch (e) { console.error(e); }
            try { updateSubjectDisplay(); } catch (e) { console.error(e); }
            try { updateExamCountdownDisplay(); } catch (e) { console.error(e); }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", finalStartup);
    } else {
        finalStartup();
    }

})();
