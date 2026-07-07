// =========================================================
// CodeBridge サンプル集（shared/samples.js から自動生成）
// 手編集しないでください — node scripts/sync-legacy-samples.mjs
// =========================================================

const CODEBRIDGE_SAMPLES = [
    {
        "id": "hello",
        "title": "はじめての表示",
        "description": "表示命令の基本",
        "learningGoals": [
            "表示命令で文字列を画面に出す",
            "プログラムの出力を確認する"
        ],
        "jpCode": "表示(\"Hello, CodeBridge!\");",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"Hello, CodeBridge!\\n\");\n\n    return 0;\n}",
        "algorithmSteps": [
            "文字列を画面に表示する"
        ]
    },
    {
        "id": "input-echo",
        "title": "入力と表示",
        "description": "scanf の基本",
        "learningGoals": [
            "キーボード入力を読み込む",
            "入力した値をそのまま表示する"
        ],
        "jpCode": "表示(\"数字を入力\");\n整数 player;\n入力(player);\n表示(player);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"数字を入力\\n\");\n    int player;\n    scanf(\"%d\", &player);\n    printf(\"%d\\n\", player);\n\n    return 0;\n}",
        "algorithmSteps": [
            "入力のお願いを画面に表示する",
            "キーボードから整数を読み込む",
            "読み込んだ値を画面に表示する"
        ]
    },
    {
        "id": "janken",
        "title": "じゃんけん",
        "description": "条件分岐と乱数",
        "learningGoals": [
            "乱数で CPU の手を決める",
            "if / else if / else で分岐する",
            "複数条件（かつ・または）で勝敗を判定する"
        ],
        "jpCode": "乱数初期化();\n\n表示(\"じゃんけんゲーム\");\n表示(\"0:グー 1:チョキ 2:パー\");\n表示(\"あなたの手を入力してください\");\n\n整数 player;\n入力(player);\n\n整数 CPU = 乱数() % 3;\n\n続けて表示(\"あなたの手: \");\nもし(playerが0と等しい){\n    表示(\"グー\");\n}\nそうでなくもし(playerが1と等しい){\n    表示(\"チョキ\");\n}\nそうでなければ{\n    表示(\"パー\");\n}\n\n続けて表示(\"CPUの手: \");\nもし(CPUが0と等しい){\n    表示(\"グー\");\n}\nそうでなくもし(CPUが1と等しい){\n    表示(\"チョキ\");\n}\nそうでなければ{\n    表示(\"パー\");\n}\n\n続けて表示(\"結果: \");\nもし(playerがCPUと等しい){\n    表示(\"あいこ\");\n}\nそうでなくもし(\n    (playerが0と等しい かつ CPUが1と等しい)\n    または\n    (playerが1と等しい かつ CPUが2と等しい)\n    または\n    (playerが2と等しい かつ CPUが0と等しい)\n){\n    表示(\"勝ち\");\n}\nそうでなければ{\n    表示(\"負け\");\n}",
        "cCode": "#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    srand((unsigned int)time(NULL));\n\n    printf(\"じゃんけんゲーム\\n\");\n    printf(\"0:グー 1:チョキ 2:パー\\n\");\n    printf(\"あなたの手を入力してください\\n\");\n\n    int player;\n    scanf(\"%d\", &player);\n\n    int CPU = rand() % 3;\n\n    printf(\"あなたの手: \");\n    if(player == 0){\n        printf(\"グー\\n\");\n    }\n    else if(player == 1){\n        printf(\"チョキ\\n\");\n    }\n    else{\n        printf(\"パー\\n\");\n    }\n\n    printf(\"CPUの手: \");\n    if(CPU == 0){\n        printf(\"グー\\n\");\n    }\n    else if(CPU == 1){\n        printf(\"チョキ\\n\");\n    }\n    else{\n        printf(\"パー\\n\");\n    }\n\n    printf(\"結果: \");\n    if(player == CPU){\n        printf(\"あいこ\\n\");\n    }\n    else if(\n    (player == 0 && CPU == 1)\n    ||\n    (player == 1 && CPU == 2)\n    ||\n    (player == 2 && CPU == 0)\n    ){\n        printf(\"勝ち\\n\");\n    }\n    else{\n        printf(\"負け\\n\");\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "乱数の種を初期化する",
            "プレイヤーが 0/1/2 を入力する",
            "CPUの手を乱数で決める",
            "プレイヤーの手を文字で表示する",
            "CPUの手を文字で表示する",
            "同じ手なら「あいこ」",
            "勝ち条件に当てはまれば「勝ち」",
            "それ以外は「負け」"
        ]
    },
    {
        "id": "bmi",
        "title": "BMI計算",
        "description": "小数と計算",
        "learningGoals": [
            "小数型で身長・体重を扱う",
            "BMI の計算式を組み立てる",
            "計算した BMI 値を画面に表示する",
            "条件分岐で判定結果を表示する"
        ],
        "jpCode": "表示(\"身長(cm)を入力\");\n小数 height;\n入力(height);\n表示(\"体重(kg)を入力\");\n小数 weight;\n入力(weight);\n小数 bmi = weight / ((height / 100) * (height / 100));\n\n続けて表示(\"BMI：\");\n表示(bmi);\n\nもし(bmiが18.5より小さい){\n    表示(\"判定：低体重\");\n}\nそうでなくもし(bmiが25より小さい){\n    表示(\"判定：普通体重\");\n}\nそうでなければ{\n    表示(\"判定：肥満\");\n}\n\n表示(\"\");\n表示(\"BMIの目安\");\n表示(\"18.5未満：低体重\");\n表示(\"18.5～24.9：普通体重\");\n表示(\"25以上：肥満\");",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"身長(cm)を入力\\n\");\n    double height;\n    scanf(\"%lf\", &height);\n    printf(\"体重(kg)を入力\\n\");\n    double weight;\n    scanf(\"%lf\", &weight);\n    double bmi = weight / ((height / 100) * (height / 100));\n\n    printf(\"BMI：\");\n    printf(\"%.2f\\n\", bmi);\n\n    if(bmi < 18.5){\n        printf(\"判定：低体重\\n\");\n    }\n    else if(bmi < 25){\n        printf(\"判定：普通体重\\n\");\n    }\n    else{\n        printf(\"判定：肥満\\n\");\n    }\n\n    printf(\"\\n\");\n    printf(\"BMIの目安\\n\");\n    printf(\"18.5未満：低体重\\n\");\n    printf(\"18.5～24.9：普通体重\\n\");\n    printf(\"25以上：肥満\\n\");\n\n    return 0;\n}",
        "algorithmSteps": [
            "身長を入力する",
            "体重を入力する",
            "BMI を計算する（体重 ÷ 身長m の2乗）",
            "計算した BMI の数値を表示する",
            "BMI の値に応じて判定を表示する",
            "BMI の目安一覧を表示する"
        ]
    },
    {
        "id": "grade",
        "title": "成績判定",
        "description": "if / else if / else",
        "learningGoals": [
            "点数を入力して受け取る",
            "else if で段階的に評価を分ける"
        ],
        "jpCode": "表示(\"点数を入力\");\n整数 score;\n入力(score);\nもし(scoreが90以上){\n    表示(\"評価: A\");\n}\nそうでなくもし(scoreが70以上){\n    表示(\"評価: B\");\n}\nそうでなくもし(scoreが60以上){\n    表示(\"評価: C\");\n}\nそうでなければ{\n    表示(\"評価: 不可\");\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"点数を入力\\n\");\n    int score;\n    scanf(\"%d\", &score);\n    if(score >= 90){\n        printf(\"評価: A\\n\");\n    }\n    else if(score >= 70){\n        printf(\"評価: B\\n\");\n    }\n    else if(score >= 60){\n        printf(\"評価: C\\n\");\n    }\n    else{\n        printf(\"評価: 不可\\n\");\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "点数を入力する",
            "90点以上なら評価 A",
            "70点以上なら評価 B",
            "60点以上なら評価 C",
            "それ以外は評価 不可"
        ]
    },
    {
        "id": "omikuji",
        "title": "おみくじ",
        "description": "乱数と分岐",
        "learningGoals": [
            "乱数で結果を決める",
            "複数の else if で結果を分岐する"
        ],
        "jpCode": "乱数初期化();\n\n整数 result = 乱数() % 4;\nもし(resultが0と等しい){\n    表示(\"大吉\");\n}\nそうでなくもし(resultが1と等しい){\n    表示(\"中吉\");\n}\nそうでなくもし(resultが2と等しい){\n    表示(\"小吉\");\n}\nそうでなければ{\n    表示(\"凶\");\n}",
        "cCode": "#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    srand((unsigned int)time(NULL));\n\n    int result = rand() % 4;\n    if(result == 0){\n        printf(\"大吉\\n\");\n    }\n    else if(result == 1){\n        printf(\"中吉\\n\");\n    }\n    else if(result == 2){\n        printf(\"小吉\\n\");\n    }\n    else{\n        printf(\"凶\\n\");\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "乱数の種を初期化する",
            "0〜3 の乱数を得る",
            "0 なら「大吉」、1 なら「中吉」、2 なら「小吉」",
            "それ以外は「凶」"
        ]
    },
    {
        "id": "quiz",
        "title": "四則演算クイズ",
        "description": "入力・計算・判定",
        "learningGoals": [
            "複数回の入力を行う",
            "式の結果と入力値を比較する"
        ],
        "jpCode": "表示(\"1つ目の数\");\n整数 a;\n入力(a);\n表示(\"2つ目の数\");\n整数 b;\n入力(b);\n表示(\"答え\");\n整数 ans;\n入力(ans);\nもし(ansが(a + b)と等しい){\n    表示(\"正解!\");\n}\nそうでなければ{\n    表示(\"不正解\");\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"1つ目の数\\n\");\n    int a;\n    scanf(\"%d\", &a);\n    printf(\"2つ目の数\\n\");\n    int b;\n    scanf(\"%d\", &b);\n    printf(\"答え\\n\");\n    int ans;\n    scanf(\"%d\", &ans);\n    if(ans == (a + b)){\n        printf(\"正解!\\n\");\n    }\n    else{\n        printf(\"不正解\\n\");\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "1つ目の数を入力する",
            "2つ目の数を入力する",
            "答えを入力する",
            "答えが a + b と等しければ「正解!」",
            "それ以外は「不正解」"
        ]
    }
];

if (typeof window !== "undefined") {
    window.CODEBRIDGE_SAMPLES = CODEBRIDGE_SAMPLES;
}

function getSampleEditorCode(sample, mode) {
    if (!sample) return "";
    if (mode === "c2jp") return sample.cCode ?? "";
    return sample.jpCode ?? sample.code ?? "";
}

function setupSampleSelector() {
    const select = document.getElementById("sampleSelect");
    if (!select) return;

    select.innerHTML =
        '<option value="">サンプルを選ぶ…</option>' +
        CODEBRIDGE_SAMPLES.map(
            (s) => `<option value="${s.id}">${s.title} — ${s.description}</option>`
        ).join("");

    select.addEventListener("change", () => {
        const sample = CODEBRIDGE_SAMPLES.find((s) => s.id === select.value);
        if (!sample) return;

        if (typeof window.loadSampleIntoEditor === "function") {
            window.loadSampleIntoEditor(sample);
        } else if (typeof window.loadCodeIntoEditor === "function") {
            const mode =
                typeof window.getInputMode === "function" ? window.getInputMode() : "jp2c";
            window.loadCodeIntoEditor(getSampleEditorCode(sample, mode), sample.title);
        }
    });
}

if (typeof window !== "undefined") {
    window.setupSampleSelector = setupSampleSelector;
    window.getSampleEditorCode = getSampleEditorCode;
}

try {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { CODEBRIDGE_SAMPLES, getSampleEditorCode };
    }
} catch {
    /* ブラウザ環境では無視 */
}
