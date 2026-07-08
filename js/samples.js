// =========================================================
// CodeBridge サンプル集（shared/samples.js から自動生成）
// 手編集しないでください — node scripts/sync-legacy-samples.mjs
// =========================================================

const CODEBRIDGE_SAMPLES = [
    {
        "id": "hello",
        "title": "はじめての表示",
        "description": "表示命令の基本",
        "category": "基本",
        "difficulty": 1,
        "tags": [
            "入門",
            "表示"
        ],
        "commands": [
            "表示"
        ],
        "learningGoals": [
            "表示命令で文字列を画面に出す",
            "プログラムの出力を確認する"
        ],
        "jpCode": "表示(\"Hello, CodeBridge!\");",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"Hello, CodeBridge!\\n\");\n\n    return 0;\n}",
        "algorithmSteps": [
            "文字列を画面に表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "Hello, CodeBridge!"
            ]
        },
        "practice": {
            "prompt": "「こんにちは」と表示してください。",
            "hints": [
                "表示命令を使います。",
                "表示(\"こんにちは\"); の形で書きます。"
            ],
            "expectedCommands": [
                "表示"
            ],
            "expectedOutputIncludes": [
                "こんにちは"
            ]
        }
    },
    {
        "id": "input-echo",
        "title": "入力と表示",
        "description": "scanf の基本",
        "category": "基本",
        "difficulty": 1,
        "tags": [
            "入門",
            "入力",
            "表示"
        ],
        "commands": [
            "表示",
            "入力",
            "整数"
        ],
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
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "42を入力",
                "stdin": "42",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "42"
            ]
        },
        "practice": {
            "prompt": "数字を1つ入力して、その数字を表示してください。",
            "hints": [
                "整数型の変数を宣言します。",
                "入力(変数); で読み込みます。",
                "表示(変数); で出力します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数"
            ],
            "expectedOutputIncludes": [
                "42"
            ]
        }
    },
    {
        "id": "janken",
        "title": "じゃんけん",
        "description": "条件分岐と乱数",
        "category": "条件分岐",
        "difficulty": 3,
        "tags": [
            "分岐",
            "乱数",
            "入力"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "整数",
            "乱数",
            "乱数初期化",
            "もし",
            "そうでなくもし",
            "そうでなければ",
            "かつ",
            "または"
        ],
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
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "チョキ(1)",
                "stdin": "1",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "じゃんけんゲーム",
                "あなたの手:",
                "CPUの手:",
                "結果:"
            ]
        },
        "practice": {
            "prompt": "0/1/2を入力して、CPUとじゃんけんをするプログラムを作ってください。",
            "hints": [
                "乱数初期化() を最初に呼びます。",
                "乱数() % 3 で CPU の手を決めます。",
                "もし / そうでなくもし で勝敗を分岐します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数",
                "乱数",
                "もし"
            ],
            "expectedOutputIncludes": [
                "じゃんけん",
                "結果:"
            ]
        }
    },
    {
        "id": "bmi",
        "title": "BMI計算",
        "description": "小数と計算",
        "category": "計算",
        "difficulty": 3,
        "tags": [
            "計算",
            "小数",
            "分岐",
            "入力"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "小数",
            "もし",
            "そうでなくもし",
            "そうでなければ"
        ],
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
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "1行のみ",
                "stdin": "160",
                "expectStatus": "input_required"
            },
            {
                "label": "標準例(160cm/58.6kg)",
                "stdin": "160\n58.6",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "BMI：",
                "22.89",
                "判定：普通体重",
                "BMIの目安"
            ]
        },
        "practice": {
            "prompt": "身長と体重を入力してBMIを判定してください。",
            "hints": [
                "小数型で身長・体重を入力します。",
                "BMI = 体重 ÷ (身長m)² を計算します。",
                "もし で低体重・普通・肥満を判定します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "小数",
                "もし"
            ],
            "expectedOutputIncludes": [
                "BMI",
                "判定"
            ]
        }
    },
    {
        "id": "grade",
        "title": "成績判定",
        "description": "if / else if / else",
        "category": "条件分岐",
        "difficulty": 2,
        "tags": [
            "分岐",
            "入力"
        ],
        "commands": [
            "表示",
            "入力",
            "整数",
            "もし",
            "そうでなくもし",
            "そうでなければ"
        ],
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
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "80点",
                "stdin": "80",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "評価: B"
            ]
        },
        "practice": {
            "prompt": "点数を入力して、A/B/C/不可の評価を表示してください。",
            "hints": [
                "整数で点数を入力します。",
                "そうでなくもし で段階的に評価を分けます。",
                "90点以上なら A など条件を決めます。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数",
                "もし"
            ],
            "expectedOutputIncludes": [
                "評価"
            ]
        }
    },
    {
        "id": "omikuji",
        "title": "おみくじ",
        "description": "乱数と分岐",
        "category": "乱数",
        "difficulty": 2,
        "tags": [
            "乱数",
            "分岐"
        ],
        "commands": [
            "乱数初期化",
            "乱数",
            "整数",
            "もし",
            "そうでなくもし",
            "そうでなければ",
            "表示"
        ],
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
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [],
            "oneOf": [
                "大吉",
                "中吉",
                "小吉",
                "凶"
            ]
        },
        "practice": {
            "prompt": "乱数でおみくじ（大吉・中吉・小吉・凶）を表示してください。",
            "hints": [
                "乱数初期化() を呼びます。",
                "乱数() % 4 で 0〜3 の結果を得ます。",
                "もし / そうでなくもし で結果を分岐します。"
            ],
            "expectedCommands": [
                "乱数",
                "乱数初期化",
                "もし",
                "表示"
            ],
            "expectedOutputIncludes": []
        }
    },
    {
        "id": "quiz",
        "title": "四則演算クイズ",
        "description": "入力・計算・判定",
        "category": "計算",
        "difficulty": 3,
        "tags": [
            "入力",
            "分岐",
            "計算"
        ],
        "commands": [
            "表示",
            "入力",
            "整数",
            "もし",
            "そうでなければ"
        ],
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
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "正解(3+4=7)",
                "stdin": "3\n4\n7",
                "expectStatus": "success",
                "expectedOutput": {
                    "includes": [
                        "正解!"
                    ]
                }
            },
            {
                "label": "不正解(3+4=8)",
                "stdin": "3\n4\n8",
                "expectStatus": "success",
                "expectedOutput": {
                    "includes": [
                        "不正解"
                    ]
                }
            }
        ],
        "expectedOutput": {
            "includes": []
        },
        "practice": {
            "prompt": "2つの数を入力し、足し算の答えが正しいか判定してください。",
            "hints": [
                "3回 入力 して a, b, 答えを読みます。",
                "もし で答えが a + b と等しいか調べます。",
                "正解なら「正解!」、違えば「不正解」を表示します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数",
                "もし"
            ],
            "expectedOutputIncludes": [
                "正解"
            ]
        }
    },
    {
        "id": "even-odd",
        "title": "偶数・奇数判定",
        "description": "剰余と条件分岐",
        "category": "条件分岐",
        "difficulty": 2,
        "tags": [
            "分岐",
            "入力",
            "計算"
        ],
        "commands": [
            "表示",
            "入力",
            "整数",
            "もし",
            "そうでなければ"
        ],
        "learningGoals": [
            "整数を入力して受け取る",
            "剰余（%）で偶数・奇数を判定する",
            "if / else で結果を分岐表示する"
        ],
        "jpCode": "表示(\"整数を入力\");\n整数 n;\n入力(n);\nもし(n % 2が0と等しい){\n    表示(\"偶数\");\n}\nそうでなければ{\n    表示(\"奇数\");\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"整数を入力\\n\");\n    int n;\n    scanf(\"%d\", &n);\n    if(n % 2 == 0){\n        printf(\"偶数\\n\");\n    }\n    else{\n        printf(\"奇数\\n\");\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "整数を入力する",
            "2で割った余りが0なら偶数",
            "それ以外は奇数"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "偶数(4)",
                "stdin": "4",
                "expectStatus": "success",
                "expectedOutput": {
                    "includes": [
                        "偶数"
                    ]
                }
            },
            {
                "label": "奇数(7)",
                "stdin": "7",
                "expectStatus": "success",
                "expectedOutput": {
                    "includes": [
                        "奇数"
                    ]
                }
            }
        ],
        "expectedOutput": {
            "includes": [],
            "oneOf": [
                "偶数",
                "奇数"
            ]
        },
        "practice": {
            "prompt": "整数を入力して、偶数か奇数かを表示してください。",
            "hints": [
                "n % 2 が 0 かどうかで判定します。",
                "もし / そうでなければ で分岐します。",
                "「偶数」「奇数」を表示します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数",
                "もし"
            ],
            "expectedOutputIncludes": [
                "偶数"
            ]
        }
    },
    {
        "id": "max-value",
        "title": "最大値を求める",
        "description": "3つの数の比較",
        "category": "計算",
        "difficulty": 2,
        "tags": [
            "入力",
            "比較",
            "変数"
        ],
        "commands": [
            "表示",
            "入力",
            "整数",
            "もし"
        ],
        "learningGoals": [
            "複数の値を入力する",
            "変数に最大値を保持する",
            "比較してより大きい値に更新する"
        ],
        "jpCode": "表示(\"1つ目\");\n整数 a;\n入力(a);\n表示(\"2つ目\");\n整数 b;\n入力(b);\n表示(\"3つ目\");\n整数 c;\n入力(c);\n整数 max = a;\nもし(bがmaxより大きい){\n    max = b;\n}\nもし(cがmaxより大きい){\n    max = c;\n}\n表示(max);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"1つ目\\n\");\n    int a;\n    scanf(\"%d\", &a);\n    printf(\"2つ目\\n\");\n    int b;\n    scanf(\"%d\", &b);\n    printf(\"3つ目\\n\");\n    int c;\n    scanf(\"%d\", &c);\n    int max = a;\n    if(b > max){\n        max = b;\n    }\n    if(c > max){\n        max = c;\n    }\n    printf(\"%d\\n\", max);\n\n    return 0;\n}",
        "algorithmSteps": [
            "3つの整数を入力する",
            "最初の値を最大値とする",
            "2つ目が大きければ最大値を更新する",
            "3つ目が大きければ最大値を更新する",
            "最大値を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "3,9,5",
                "stdin": "3\n9\n5",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "9"
            ]
        },
        "practice": {
            "prompt": "3つの整数を入力して、最大値を表示してください。",
            "hints": [
                "3回 入力 します。",
                "最初の値を max にして、あと2つと比較します。",
                "もし(bがmaxより大きい) で更新します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数",
                "もし"
            ],
            "expectedOutputIncludes": [
                "9"
            ]
        }
    },
    {
        "id": "sum-average",
        "title": "合計と平均",
        "description": "3つの数の合計と平均",
        "category": "計算",
        "difficulty": 2,
        "tags": [
            "入力",
            "計算",
            "小数"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "整数",
            "小数"
        ],
        "learningGoals": [
            "複数の値を入力する",
            "合計を計算する",
            "平均を小数で計算して表示する"
        ],
        "jpCode": "表示(\"1つ目\");\n整数 a;\n入力(a);\n表示(\"2つ目\");\n整数 b;\n入力(b);\n表示(\"3つ目\");\n整数 c;\n入力(c);\n整数 sum = a + b + c;\n小数 avg = (小数)sum / 3;\n続けて表示(\"合計: \");\n表示(sum);\n続けて表示(\"平均: \");\n表示(avg);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"1つ目\\n\");\n    int a;\n    scanf(\"%d\", &a);\n    printf(\"2つ目\\n\");\n    int b;\n    scanf(\"%d\", &b);\n    printf(\"3つ目\\n\");\n    int c;\n    scanf(\"%d\", &c);\n    int sum = a + b + c;\n    double avg = (double)sum / 3;\n    printf(\"合計: \");\n    printf(\"%d\\n\", sum);\n    printf(\"平均: \");\n    printf(\"%.2f\\n\", avg);\n\n    return 0;\n}",
        "algorithmSteps": [
            "3つの整数を入力する",
            "3つの値を足して合計を求める",
            "合計を3で割って平均を計算する",
            "合計と平均を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "10,20,30",
                "stdin": "10\n20\n30",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "合計: 60",
                "平均: 20.00"
            ]
        },
        "practice": {
            "prompt": "3つの整数を入力して、合計と平均を表示してください。",
            "hints": [
                "3つの整数を入力します。",
                "合計は3つの足し算です。",
                "平均は合計 ÷ 3 を小数で表示します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "整数"
            ],
            "expectedOutputIncludes": [
                "合計",
                "平均"
            ]
        }
    },
    {
        "id": "for-one-to-ten",
        "title": "for文で1〜10を表示",
        "description": "繰り返しの基本",
        "category": "繰り返し",
        "difficulty": 2,
        "tags": [
            "繰り返し",
            "表示"
        ],
        "commands": [
            "表示",
            "整数",
            "繰り返し"
        ],
        "learningGoals": [
            "for 文（繰り返し）の書き方を学ぶ",
            "1から10まで順に表示する"
        ],
        "jpCode": "整数 i;\n繰り返し(i = 1; i <= 10; i++){\n    表示(i);\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int i;\n    for(i = 1; i <= 10; i++){\n        printf(\"%d\\n\", i);\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "カウンタ変数 i を用意する",
            "i が 1 から 10 まで1ずつ増えるループを回す",
            "ループのたびに i の値を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "1",
                "10"
            ]
        },
        "practice": {
            "prompt": "1から10まで表示してください。",
            "hints": [
                "繰り返しを使います。",
                "開始値は1、終了条件は i <= 10 です。",
                "表示(i); で値を出力します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "表示"
            ],
            "expectedOutputIncludes": [
                "1",
                "10"
            ]
        }
    },
    {
        "id": "array-sum",
        "title": "配列の合計",
        "description": "配列と繰り返し",
        "category": "配列",
        "difficulty": 3,
        "tags": [
            "配列",
            "繰り返し",
            "計算"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "整数",
            "繰り返し"
        ],
        "learningGoals": [
            "整数配列を宣言して初期値を入れる",
            "ループで配列の各要素にアクセスする",
            "要素の合計を求めて表示する"
        ],
        "jpCode": "整数 data[5] = {10, 20, 30, 40, 50};\n整数 sum = 0;\n整数 i;\n繰り返し(i = 0; i < 5; i++){\n    sum = sum + data[i];\n}\n続けて表示(\"合計: \");\n表示(sum);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int data[5] = {10, 20, 30, 40, 50};\n    int sum = 0;\n    int i;\n    for(i = 0; i < 5; i++){\n        sum = sum + data[i];\n    }\n    printf(\"合計: \");\n    printf(\"%d\\n\", sum);\n\n    return 0;\n}",
        "algorithmSteps": [
            "5要素の配列に値を入れる",
            "合計用の変数を0で用意する",
            "配列の各要素を順に足し込む",
            "合計を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "合計: 150"
            ]
        },
        "practice": {
            "prompt": "配列の要素を合計して表示してください。",
            "hints": [
                "整数配列を宣言して初期値を入れます。",
                "繰り返し で各要素を足し込みます。",
                "合計を表示します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "表示",
                "整数"
            ],
            "expectedOutputIncludes": [
                "合計",
                "150"
            ]
        }
    },
    {
        "id": "for-kuku",
        "title": "九九（9×9）",
        "description": "二重ループで掛け算表",
        "category": "繰り返し",
        "difficulty": 3,
        "tags": [
            "繰り返し",
            "計算"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "整数",
            "繰り返し"
        ],
        "learningGoals": [
            "二重のfor文（繰り返し）で表形式の出力を作る",
            "変数 i と j を使って掛け算の結果を求める",
            "繰り返しの中にさらに繰り返しを入れ子にする"
        ],
        "jpCode": "整数 i;\n整数 j;\n繰り返し(i = 1; i <= 9; i++){\n    繰り返し(j = 1; j <= 9; j++){\n        続けて表示(i);\n        続けて表示(\" x \");\n        続けて表示(j);\n        続けて表示(\" = \");\n        表示(i * j);\n    }\n}\n",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int i;\n    int j;\n    for(i = 1; i <= 9; i++){\n        for(j = 1; j <= 9; j++){\n            printf(\"%d\", i);\n            printf(\" x \");\n            printf(\"%d\", j);\n            printf(\" = \");\n            printf(\"%d\\n\", i * j);\n        }\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "①外側のループで行（1〜9）を決める",
            "②内側のループで列（1〜9）を決める",
            "③i × j の結果を「i x j = 答え」の形で表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "1 x 1 = 1",
                "9 x 9 = 81"
            ]
        },
        "practice": {
            "prompt": "九九（9×9）の表を表示してください。",
            "hints": [
                "二重の繰り返しを使います。",
                "外側のループが行、内側が列です。",
                "i × j の結果を表示します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "表示"
            ],
            "expectedOutputIncludes": [
                "1 x 1 = 1",
                "9 x 9 = 81"
            ]
        }
    },
    {
        "id": "for-reverse",
        "title": "逆順表示（10〜1）",
        "description": "for文でカウントダウン",
        "category": "繰り返し",
        "difficulty": 2,
        "tags": [
            "繰り返し",
            "表示"
        ],
        "commands": [
            "表示",
            "整数",
            "繰り返し"
        ],
        "learningGoals": [
            "for文の初期値・条件・更新を自分で設定する",
            "10から1まで逆順に表示する",
            "i-- で変数を1ずつ減らす"
        ],
        "jpCode": "整数 i;\n繰り返し(i = 10; i >= 1; i--){\n    表示(i);\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int i;\n    for(i = 10; i >= 1; i--){\n        printf(\"%d\\n\", i);\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "①カウンタ i を10から始める",
            "②i が1以上の間、ループを繰り返す",
            "③i の値を表示し、i を1減らす"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "10",
                "1"
            ]
        },
        "practice": {
            "prompt": "10から1まで逆順に表示してください。",
            "hints": [
                "繰り返しで i = 10 から始めます。",
                "条件は i >= 1 です。",
                "i-- で1ずつ減らします。"
            ],
            "expectedCommands": [
                "繰り返し",
                "表示"
            ],
            "expectedOutputIncludes": [
                "10",
                "1"
            ]
        }
    },
    {
        "id": "for-triangle",
        "title": "＊の三角形",
        "description": "二重ループで図形表示",
        "category": "繰り返し",
        "difficulty": 3,
        "tags": [
            "繰り返し",
            "表示"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "整数",
            "繰り返し"
        ],
        "learningGoals": [
            "行ごとに表示する＊の数を変える",
            "二重ループで三角形の形を作る",
            "続けて表示で改行なしの出力を使う"
        ],
        "jpCode": "整数 row;\n繰り返し(row = 1; row <= 5; row++){\n    整数 col;\n    繰り返し(col = 1; col <= row; col++){\n        続けて表示(\"*\");\n    }\n    表示(\"\");\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int row;\n    for(row = 1; row <= 5; row++){\n        int col;\n        for(col = 1; col <= row; col++){\n            printf(\"*\");\n        }\n        printf(\"\\n\");\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "①1行目から5行目まで繰り返す",
            "②その行の番号と同じ回数だけ＊を表示する",
            "③1行終わったら改行して次の行へ進む"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "*",
                "*****"
            ]
        },
        "practice": {
            "prompt": "＊を使って三角形を表示してください。",
            "hints": [
                "二重の繰り返しを使います。",
                "行の番号と同じ個数の＊を表示します。",
                "続けて表示(\"*\"); と 表示(\"\"); で改行します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "表示"
            ],
            "expectedOutputIncludes": [
                "*",
                "*****"
            ]
        }
    },
    {
        "id": "while-one-to-hundred",
        "title": "1〜100まで表示",
        "description": "while文の基本",
        "category": "繰り返し",
        "difficulty": 2,
        "tags": [
            "繰り返し",
            "表示"
        ],
        "commands": [
            "表示",
            "整数",
            "間"
        ],
        "learningGoals": [
            "while文（間）で条件が満たされる間ループする",
            "1から100まで順に表示する",
            "ループの中で変数を更新する"
        ],
        "jpCode": "整数 n = 1;\n間(nが100以下){\n    表示(n);\n    n = n + 1;\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int n = 1;\n    while(n <= 100){\n        printf(\"%d\\n\", n);\n        n = n + 1;\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "①変数 n を1で初期化する",
            "②n が100以下の間、表示と加算を繰り返す",
            "③n を1増やして次のループへ進む"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "1",
                "100"
            ]
        },
        "practice": {
            "prompt": "1から100まで表示してください（while文を使う）。",
            "hints": [
                "間(...) で条件が真の間ループします。",
                "n を1から始めて、表示後に n = n + 1 します。",
                "条件は nが100以下 です。"
            ],
            "expectedCommands": [
                "間",
                "表示"
            ],
            "expectedOutputIncludes": [
                "1",
                "100"
            ]
        }
    },
    {
        "id": "while-until-zero",
        "title": "0が入力されるまで繰り返す",
        "description": "while文と入力",
        "category": "繰り返し",
        "difficulty": 3,
        "tags": [
            "繰り返し",
            "入力"
        ],
        "commands": [
            "表示",
            "入力",
            "整数",
            "間"
        ],
        "learningGoals": [
            "入力した値が0になるまで繰り返す",
            "while文で終了条件を設定する",
            "ループの中で何度も入力を受け取る"
        ],
        "jpCode": "表示(\"数字を入力してください(0で終了)\");\n整数 n;\n入力(n);\n間(nが0と等しくない){\n    表示(n);\n    入力(n);\n}",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"数字を入力してください(0で終了)\\n\");\n    int n;\n    scanf(\"%d\", &n);\n    while(n != 0){\n        printf(\"%d\\n\", n);\n        scanf(\"%d\", &n);\n    }\n\n    return 0;\n}",
        "algorithmSteps": [
            "①最初の数字を入力する",
            "②0以外が入力されている間、ループを続ける",
            "③入力した数字を表示し、次の数字を入力する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "5と0",
                "stdin": "5\n0",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "5"
            ]
        },
        "practice": {
            "prompt": "0が入力されるまで数字を入力し、0以外を表示してください。",
            "hints": [
                "間(nが0と等しくない) でループします。",
                "ループ内で 入力 と 表示 を繰り返します。",
                "0を入力したらループを抜けます。"
            ],
            "expectedCommands": [
                "間",
                "入力",
                "表示"
            ],
            "expectedOutputIncludes": [
                "5"
            ]
        }
    },
    {
        "id": "array-max",
        "title": "配列の最大値",
        "description": "配列を走査して最大値を求める",
        "category": "配列",
        "difficulty": 3,
        "tags": [
            "配列",
            "繰り返し",
            "比較"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "整数",
            "繰り返し",
            "もし"
        ],
        "learningGoals": [
            "配列の各要素を順に調べる",
            "これまでの最大値と比較して更新する",
            "ループで配列全体を処理する"
        ],
        "jpCode": "整数 data[5] = {3, 9, 1, 7, 4};\n整数 max = data[0];\n整数 i;\n繰り返し(i = 1; i < 5; i++){\n    整数 temp = data[i];\n    もし(tempがmaxより大きい){\n        max = temp;\n    }\n}\n続けて表示(\"最大値: \");\n表示(max);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int data[5] = {3, 9, 1, 7, 4};\n    int max = data[0];\n    int i;\n    for(i = 1; i < 5; i++){\n        int temp = data[i];\n        if(temp > max){\n            max = temp;\n        }\n    }\n    printf(\"最大値: \");\n    printf(\"%d\\n\", max);\n\n    return 0;\n}",
        "algorithmSteps": [
            "①配列の先頭を最大値の初期値とする",
            "②2番目以降の要素を1つずつ調べる",
            "③より大きい値があれば最大値を更新し、最後に表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "最大値: 9"
            ]
        },
        "practice": {
            "prompt": "配列の最大値を求めて表示してください。",
            "hints": [
                "配列の先頭を最大値の初期値にします。",
                "繰り返し で2番目以降を調べます。",
                "もし(要素がmaxより大きい) で更新します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "もし",
                "表示"
            ],
            "expectedOutputIncludes": [
                "最大値",
                "9"
            ]
        }
    },
    {
        "id": "array-min",
        "title": "配列の最小値",
        "description": "配列を走査して最小値を求める",
        "category": "配列",
        "difficulty": 3,
        "tags": [
            "配列",
            "繰り返し",
            "比較"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "整数",
            "繰り返し",
            "もし"
        ],
        "learningGoals": [
            "配列の各要素を順に調べる",
            "これまでの最小値と比較して更新する",
            "最大値を求める処理と同じ考え方を使う"
        ],
        "jpCode": "整数 data[5] = {3, 9, 1, 7, 4};\n整数 min = data[0];\n整数 i;\n繰り返し(i = 1; i < 5; i++){\n    整数 temp = data[i];\n    もし(tempがminより小さい){\n        min = temp;\n    }\n}\n続けて表示(\"最小値: \");\n表示(min);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int data[5] = {3, 9, 1, 7, 4};\n    int min = data[0];\n    int i;\n    for(i = 1; i < 5; i++){\n        int temp = data[i];\n        if(temp < min){\n            min = temp;\n        }\n    }\n    printf(\"最小値: \");\n    printf(\"%d\\n\", min);\n\n    return 0;\n}",
        "algorithmSteps": [
            "①配列の先頭を最小値の初期値とする",
            "②2番目以降の要素を1つずつ調べる",
            "③より小さい値があれば最小値を更新し、最後に表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "最小値: 1"
            ]
        },
        "practice": {
            "prompt": "配列の最小値を求めて表示してください。",
            "hints": [
                "配列の先頭を最小値の初期値にします。",
                "繰り返し で各要素を調べます。",
                "もし(要素がminより小さい) で更新します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "もし",
                "表示"
            ],
            "expectedOutputIncludes": [
                "最小値",
                "1"
            ]
        }
    },
    {
        "id": "array-average",
        "title": "配列の平均",
        "description": "配列の合計と平均を求める",
        "category": "配列",
        "difficulty": 3,
        "tags": [
            "配列",
            "繰り返し",
            "計算",
            "小数"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "整数",
            "小数",
            "繰り返し"
        ],
        "learningGoals": [
            "配列の全要素を足し合わせて合計を求める",
            "合計を要素数で割って平均を計算する",
            "整数から小数への型変換を使う"
        ],
        "jpCode": "整数 data[5] = {10, 20, 30, 40, 50};\n整数 sum = 0;\n整数 i;\n繰り返し(i = 0; i < 5; i++){\n    sum = sum + data[i];\n}\n小数 avg = (小数)sum / 5;\n続けて表示(\"平均: \");\n表示(avg);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int data[5] = {10, 20, 30, 40, 50};\n    int sum = 0;\n    int i;\n    for(i = 0; i < 5; i++){\n        sum = sum + data[i];\n    }\n    double avg = (double)sum / 5;\n    printf(\"平均: \");\n    printf(\"%.2f\\n\", avg);\n\n    return 0;\n}",
        "algorithmSteps": [
            "①配列の各要素を順に足して合計を求める",
            "②合計を要素数（5）で割る",
            "③平均を小数で表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "平均: 30.00"
            ]
        },
        "practice": {
            "prompt": "配列の平均を求めて表示してください。",
            "hints": [
                "繰り返し で全要素を足して合計を求めます。",
                "合計を要素数で割ります。",
                "小数型で平均を表示します。"
            ],
            "expectedCommands": [
                "繰り返し",
                "表示"
            ],
            "expectedOutputIncludes": [
                "平均",
                "30.00"
            ]
        }
    },
    {
        "id": "func-add",
        "title": "足し算関数",
        "description": "2つの数を足す関数",
        "category": "関数",
        "difficulty": 3,
        "tags": [
            "関数",
            "入力",
            "計算"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "整数",
            "戻る"
        ],
        "learningGoals": [
            "引数を受け取る関数を定義する",
            "関数の戻り値を使って計算結果を得る",
            "入力した2つの数を関数に渡す"
        ],
        "jpCode": "整数 add(整数 a, 整数 b){\n    戻る a + b;\n}\n表示(\"1つ目\");\n整数 a;\n入力(a);\n表示(\"2つ目\");\n整数 b;\n入力(b);\n整数 result = add(a, b);\n続けて表示(\"合計: \");\n表示(result);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int add(int a, int b){\n        return a + b;\n    }\n    printf(\"1つ目\\n\");\n    int a;\n    scanf(\"%d\", &a);\n    printf(\"2つ目\\n\");\n    int b;\n    scanf(\"%d\", &b);\n    int result = add(a, b);\n    printf(\"合計: \");\n    printf(\"%d\\n\", result);\n}",
        "algorithmSteps": [
            "①2つの整数を受け取り、足した結果を返す関数を作る",
            "②キーボードから2つの数を入力する",
            "③関数を呼び出して合計を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "3と4",
                "stdin": "3\n4",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "合計: 7"
            ]
        },
        "practice": {
            "prompt": "2つの数を足す関数を作り、結果を表示してください。",
            "hints": [
                "整数 add(整数 a, 整数 b) のような関数を定義します。",
                "戻る で a + b を返します。",
                "関数を呼び出して結果を表示します。"
            ],
            "expectedCommands": [
                "戻る",
                "表示",
                "入力"
            ],
            "expectedOutputIncludes": [
                "合計",
                "7"
            ]
        }
    },
    {
        "id": "func-max",
        "title": "最大値を返す関数",
        "description": "2つの数の大きい方を返す",
        "category": "関数",
        "difficulty": 3,
        "tags": [
            "関数",
            "入力",
            "分岐"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "整数",
            "もし",
            "戻る"
        ],
        "learningGoals": [
            "条件分岐を使って大きい方の値を選ぶ",
            "関数から結果を返す（戻る）",
            "関数の戻り値を変数に代入する"
        ],
        "jpCode": "整数 getMax(整数 a, 整数 b){\n    もし(aがbより大きい){\n        戻る a;\n    }\n    戻る b;\n}\n表示(\"1つ目\");\n整数 a;\n入力(a);\n表示(\"2つ目\");\n整数 b;\n入力(b);\n整数 result = getMax(a, b);\n続けて表示(\"最大: \");\n表示(result);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    int getMax(int a, int b){\n        if(a > b){\n            return a;\n        }\n        return b;\n    }\n    printf(\"1つ目\\n\");\n    int a;\n    scanf(\"%d\", &a);\n    printf(\"2つ目\\n\");\n    int b;\n    scanf(\"%d\", &b);\n    int result = getMax(a, b);\n    printf(\"最大: \");\n    printf(\"%d\\n\", result);\n}",
        "algorithmSteps": [
            "①2つの整数を比較する関数を作る",
            "②大きい方の値を戻り値として返す",
            "③入力した2つの数で関数を呼び出し、結果を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "3と9",
                "stdin": "3\n9",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "最大: 9"
            ]
        },
        "practice": {
            "prompt": "2つの数の大きい方を返す関数を作ってください。",
            "hints": [
                "2つの整数を比較する関数を作ります。",
                "もし で大きい方を選び、戻る で返します。",
                "入力した2つの数で関数を呼び出します。"
            ],
            "expectedCommands": [
                "戻る",
                "もし",
                "表示",
                "入力"
            ],
            "expectedOutputIncludes": [
                "最大",
                "9"
            ]
        }
    },
    {
        "id": "string-name",
        "title": "名前を入力して表示",
        "description": "文字列の入力と表示",
        "category": "文字列",
        "difficulty": 2,
        "tags": [
            "文字列",
            "入力",
            "表示"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "文字列"
        ],
        "learningGoals": [
            "文字列型の変数を宣言する",
            "キーボードから名前を入力する",
            "入力した文字列をそのまま表示する"
        ],
        "jpCode": "表示(\"名前を入力\");\n文字列 name[50];\n入力(name);\n続けて表示(\"こんにちは、\");\n表示(name);",
        "cCode": "#include <stdio.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"名前を入力\\n\");\n    char name[50];\n    scanf(\"%s\", name);\n    printf(\"こんにちは、\");\n    printf(\"%s\\n\", name);\n\n    return 0;\n}",
        "algorithmSteps": [
            "①文字列を格納する変数を用意する",
            "②キーボードから名前を入力する",
            "③「こんにちは、」と入力した名前を表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "太郎",
                "stdin": "太郎",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "こんにちは、太郎"
            ]
        },
        "practice": {
            "prompt": "名前を入力して「こんにちは、○○」と表示してください。",
            "hints": [
                "文字列 name[50]; で変数を宣言します。",
                "入力(name); で名前を読み込みます。",
                "続けて表示 と 表示 で挨拶を出力します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "文字列"
            ],
            "expectedOutputIncludes": [
                "こんにちは"
            ]
        }
    },
    {
        "id": "string-strlen",
        "title": "文字数を表示",
        "description": "strlenで文字列の長さ",
        "category": "文字列",
        "difficulty": 3,
        "tags": [
            "文字列",
            "入力",
            "計算"
        ],
        "commands": [
            "表示",
            "続けて表示",
            "入力",
            "文字列",
            "整数"
        ],
        "learningGoals": [
            "文字列を入力して受け取る",
            "strlen関数で文字数を数える",
            "文字数を画面に表示する"
        ],
        "jpCode": "表示(\"文字列を入力\");\n文字列 text[100];\n入力(text);\n整数 len = strlen(text);\n続けて表示(\"文字数: \");\n表示(len);",
        "cCode": "#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n    printf(\"文字列を入力\\n\");\n    char text[100];\n    scanf(\"%s\", text);\n    int len = strlen(text);\n    printf(\"文字数: \");\n    printf(\"%d\\n\", len);\n\n    return 0;\n}",
        "algorithmSteps": [
            "①文字列を入力する",
            "②strlenで文字数を数える",
            "③文字数を画面に表示する"
        ],
        "stdinExamples": [
            {
                "label": "入力なし",
                "stdin": "",
                "expectStatus": "input_required"
            },
            {
                "label": "Hello",
                "stdin": "Hello",
                "expectStatus": "success"
            }
        ],
        "expectedOutput": {
            "includes": [
                "文字数: 5"
            ]
        },
        "practice": {
            "prompt": "文字列を入力して、文字数を表示してください。",
            "hints": [
                "文字列型の配列を宣言します。",
                "strlen(文字列) で文字数を数えます。",
                "整数変数に入れて表示します。"
            ],
            "expectedCommands": [
                "表示",
                "入力",
                "文字列"
            ],
            "expectedOutputIncludes": [
                "文字数",
                "5"
            ]
        }
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
