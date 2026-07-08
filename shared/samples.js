// CodeBridge サンプルデータ（フロントエンド・テスト共通）
// jpCode … 日本語→C言語モード用 / cCode … C言語→日本語モード用（実行可能な C プログラム）

import { attachPracticeToSamples } from "./samplePractice.js";

const CODEBRIDGE_SAMPLES = [
    {
        id: "hello",
        title: "はじめての表示",
        description: "表示命令の基本",
        category: "基本",
        difficulty: 1,
        tags: ["入門", "表示"],
        commands: ["表示"],
        learningGoals: ["表示命令で文字列を画面に出す", "プログラムの出力を確認する"],
        jpCode: '表示("Hello, CodeBridge!");',
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("Hello, CodeBridge!\\n");

    return 0;
}`,
        algorithmSteps: ["文字列を画面に表示する"],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["Hello, CodeBridge!"] },
    },
    {
        id: "input-echo",
        title: "入力と表示",
        description: "scanf の基本",
        category: "基本",
        difficulty: 1,
        tags: ["入門", "入力", "表示"],
        commands: ["表示", "入力", "整数"],
        learningGoals: ["キーボード入力を読み込む", "入力した値をそのまま表示する"],
        jpCode: `表示("数字を入力");
整数 player;
入力(player);
表示(player);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("数字を入力\\n");
    int player;
    scanf("%d", &player);
    printf("%d\\n", player);

    return 0;
}`,
        algorithmSteps: [
            "入力のお願いを画面に表示する",
            "キーボードから整数を読み込む",
            "読み込んだ値を画面に表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "42を入力", stdin: "42", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["42"] },
    },
    {
        id: "janken",
        title: "じゃんけん",
        description: "条件分岐と乱数",
        category: "条件分岐",
        difficulty: 3,
        tags: ["分岐", "乱数", "入力"],
        commands: [
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
            "または",
        ],
        learningGoals: [
            "乱数で CPU の手を決める",
            "if / else if / else で分岐する",
            "複数条件（かつ・または）で勝敗を判定する",
        ],
        jpCode: `乱数初期化();

表示("じゃんけんゲーム");
表示("0:グー 1:チョキ 2:パー");
表示("あなたの手を入力してください");

整数 player;
入力(player);

整数 CPU = 乱数() % 3;

続けて表示("あなたの手: ");
もし(playerが0と等しい){
    表示("グー");
}
そうでなくもし(playerが1と等しい){
    表示("チョキ");
}
そうでなければ{
    表示("パー");
}

続けて表示("CPUの手: ");
もし(CPUが0と等しい){
    表示("グー");
}
そうでなくもし(CPUが1と等しい){
    表示("チョキ");
}
そうでなければ{
    表示("パー");
}

続けて表示("結果: ");
もし(playerがCPUと等しい){
    表示("あいこ");
}
そうでなくもし(
    (playerが0と等しい かつ CPUが1と等しい)
    または
    (playerが1と等しい かつ CPUが2と等しい)
    または
    (playerが2と等しい かつ CPUが0と等しい)
){
    表示("勝ち");
}
そうでなければ{
    表示("負け");
}`,
        cCode: `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void) {
    setbuf(stdout, NULL);

    srand((unsigned int)time(NULL));

    printf("じゃんけんゲーム\\n");
    printf("0:グー 1:チョキ 2:パー\\n");
    printf("あなたの手を入力してください\\n");

    int player;
    scanf("%d", &player);

    int CPU = rand() % 3;

    printf("あなたの手: ");
    if(player == 0){
        printf("グー\\n");
    }
    else if(player == 1){
        printf("チョキ\\n");
    }
    else{
        printf("パー\\n");
    }

    printf("CPUの手: ");
    if(CPU == 0){
        printf("グー\\n");
    }
    else if(CPU == 1){
        printf("チョキ\\n");
    }
    else{
        printf("パー\\n");
    }

    printf("結果: ");
    if(player == CPU){
        printf("あいこ\\n");
    }
    else if(
    (player == 0 && CPU == 1)
    ||
    (player == 1 && CPU == 2)
    ||
    (player == 2 && CPU == 0)
    ){
        printf("勝ち\\n");
    }
    else{
        printf("負け\\n");
    }

    return 0;
}`,
        algorithmSteps: [
            "乱数の種を初期化する",
            "プレイヤーが 0/1/2 を入力する",
            "CPUの手を乱数で決める",
            "プレイヤーの手を文字で表示する",
            "CPUの手を文字で表示する",
            "同じ手なら「あいこ」",
            "勝ち条件に当てはまれば「勝ち」",
            "それ以外は「負け」",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "チョキ(1)", stdin: "1", expectStatus: "success" },
        ],
        expectedOutput: {
            includes: ["じゃんけんゲーム", "あなたの手:", "CPUの手:", "結果:"],
        },
    },
    {
        id: "bmi",
        title: "BMI計算",
        description: "小数と計算",
        category: "計算",
        difficulty: 3,
        tags: ["計算", "小数", "分岐", "入力"],
        commands: [
            "表示",
            "続けて表示",
            "入力",
            "小数",
            "もし",
            "そうでなくもし",
            "そうでなければ",
        ],
        learningGoals: [
            "小数型で身長・体重を扱う",
            "BMI の計算式を組み立てる",
            "計算した BMI 値を画面に表示する",
            "条件分岐で判定結果を表示する",
        ],
        jpCode: `表示("身長(cm)を入力");
小数 height;
入力(height);
表示("体重(kg)を入力");
小数 weight;
入力(weight);
小数 bmi = weight / ((height / 100) * (height / 100));

続けて表示("BMI：");
表示(bmi);

もし(bmiが18.5より小さい){
    表示("判定：低体重");
}
そうでなくもし(bmiが25より小さい){
    表示("判定：普通体重");
}
そうでなければ{
    表示("判定：肥満");
}

表示("");
表示("BMIの目安");
表示("18.5未満：低体重");
表示("18.5～24.9：普通体重");
表示("25以上：肥満");`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("身長(cm)を入力\\n");
    double height;
    scanf("%lf", &height);
    printf("体重(kg)を入力\\n");
    double weight;
    scanf("%lf", &weight);
    double bmi = weight / ((height / 100) * (height / 100));

    printf("BMI：");
    printf("%.2f\\n", bmi);

    if(bmi < 18.5){
        printf("判定：低体重\\n");
    }
    else if(bmi < 25){
        printf("判定：普通体重\\n");
    }
    else{
        printf("判定：肥満\\n");
    }

    printf("\\n");
    printf("BMIの目安\\n");
    printf("18.5未満：低体重\\n");
    printf("18.5～24.9：普通体重\\n");
    printf("25以上：肥満\\n");

    return 0;
}`,
        algorithmSteps: [
            "身長を入力する",
            "体重を入力する",
            "BMI を計算する（体重 ÷ 身長m の2乗）",
            "計算した BMI の数値を表示する",
            "BMI の値に応じて判定を表示する",
            "BMI の目安一覧を表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "1行のみ", stdin: "160", expectStatus: "input_required" },
            { label: "標準例(160cm/58.6kg)", stdin: "160\n58.6", expectStatus: "success" },
        ],
        expectedOutput: {
            includes: ["BMI：", "22.89", "判定：普通体重", "BMIの目安"],
        },
    },
    {
        id: "grade",
        title: "成績判定",
        description: "if / else if / else",
        category: "条件分岐",
        difficulty: 2,
        tags: ["分岐", "入力"],
        commands: ["表示", "入力", "整数", "もし", "そうでなくもし", "そうでなければ"],
        learningGoals: ["点数を入力して受け取る", "else if で段階的に評価を分ける"],
        jpCode: `表示("点数を入力");
整数 score;
入力(score);
もし(scoreが90以上){
    表示("評価: A");
}
そうでなくもし(scoreが70以上){
    表示("評価: B");
}
そうでなくもし(scoreが60以上){
    表示("評価: C");
}
そうでなければ{
    表示("評価: 不可");
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("点数を入力\\n");
    int score;
    scanf("%d", &score);
    if(score >= 90){
        printf("評価: A\\n");
    }
    else if(score >= 70){
        printf("評価: B\\n");
    }
    else if(score >= 60){
        printf("評価: C\\n");
    }
    else{
        printf("評価: 不可\\n");
    }

    return 0;
}`,
        algorithmSteps: [
            "点数を入力する",
            "90点以上なら評価 A",
            "70点以上なら評価 B",
            "60点以上なら評価 C",
            "それ以外は評価 不可",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "80点", stdin: "80", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["評価: B"] },
    },
    {
        id: "omikuji",
        title: "おみくじ",
        description: "乱数と分岐",
        category: "乱数",
        difficulty: 2,
        tags: ["乱数", "分岐"],
        commands: ["乱数初期化", "乱数", "整数", "もし", "そうでなくもし", "そうでなければ", "表示"],
        learningGoals: ["乱数で結果を決める", "複数の else if で結果を分岐する"],
        jpCode: `乱数初期化();

整数 result = 乱数() % 4;
もし(resultが0と等しい){
    表示("大吉");
}
そうでなくもし(resultが1と等しい){
    表示("中吉");
}
そうでなくもし(resultが2と等しい){
    表示("小吉");
}
そうでなければ{
    表示("凶");
}`,
        cCode: `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void) {
    setbuf(stdout, NULL);

    srand((unsigned int)time(NULL));

    int result = rand() % 4;
    if(result == 0){
        printf("大吉\\n");
    }
    else if(result == 1){
        printf("中吉\\n");
    }
    else if(result == 2){
        printf("小吉\\n");
    }
    else{
        printf("凶\\n");
    }

    return 0;
}`,
        algorithmSteps: [
            "乱数の種を初期化する",
            "0〜3 の乱数を得る",
            "0 なら「大吉」、1 なら「中吉」、2 なら「小吉」",
            "それ以外は「凶」",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: [], oneOf: ["大吉", "中吉", "小吉", "凶"] },
    },
    {
        id: "quiz",
        title: "四則演算クイズ",
        description: "入力・計算・判定",
        category: "計算",
        difficulty: 3,
        tags: ["入力", "分岐", "計算"],
        commands: ["表示", "入力", "整数", "もし", "そうでなければ"],
        learningGoals: ["複数回の入力を行う", "式の結果と入力値を比較する"],
        jpCode: `表示("1つ目の数");
整数 a;
入力(a);
表示("2つ目の数");
整数 b;
入力(b);
表示("答え");
整数 ans;
入力(ans);
もし(ansが(a + b)と等しい){
    表示("正解!");
}
そうでなければ{
    表示("不正解");
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("1つ目の数\\n");
    int a;
    scanf("%d", &a);
    printf("2つ目の数\\n");
    int b;
    scanf("%d", &b);
    printf("答え\\n");
    int ans;
    scanf("%d", &ans);
    if(ans == (a + b)){
        printf("正解!\\n");
    }
    else{
        printf("不正解\\n");
    }

    return 0;
}`,
        algorithmSteps: [
            "1つ目の数を入力する",
            "2つ目の数を入力する",
            "答えを入力する",
            "答えが a + b と等しければ「正解!」",
            "それ以外は「不正解」",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            {
                label: "正解(3+4=7)",
                stdin: "3\n4\n7",
                expectStatus: "success",
                expectedOutput: { includes: ["正解!"] },
            },
            {
                label: "不正解(3+4=8)",
                stdin: "3\n4\n8",
                expectStatus: "success",
                expectedOutput: { includes: ["不正解"] },
            },
        ],
        expectedOutput: { includes: [] },
    },
    {
        id: "even-odd",
        title: "偶数・奇数判定",
        description: "剰余と条件分岐",
        category: "条件分岐",
        difficulty: 2,
        tags: ["分岐", "入力", "計算"],
        commands: ["表示", "入力", "整数", "もし", "そうでなければ"],
        learningGoals: [
            "整数を入力して受け取る",
            "剰余（%）で偶数・奇数を判定する",
            "if / else で結果を分岐表示する",
        ],
        jpCode: `表示("整数を入力");
整数 n;
入力(n);
もし(n % 2が0と等しい){
    表示("偶数");
}
そうでなければ{
    表示("奇数");
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("整数を入力\\n");
    int n;
    scanf("%d", &n);
    if(n % 2 == 0){
        printf("偶数\\n");
    }
    else{
        printf("奇数\\n");
    }

    return 0;
}`,
        algorithmSteps: [
            "整数を入力する",
            "2で割った余りが0なら偶数",
            "それ以外は奇数",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "偶数(4)", stdin: "4", expectStatus: "success", expectedOutput: { includes: ["偶数"] } },
            { label: "奇数(7)", stdin: "7", expectStatus: "success", expectedOutput: { includes: ["奇数"] } },
        ],
        expectedOutput: { includes: [], oneOf: ["偶数", "奇数"] },
    },
    {
        id: "max-value",
        title: "最大値を求める",
        description: "3つの数の比較",
        category: "計算",
        difficulty: 2,
        tags: ["入力", "比較", "変数"],
        commands: ["表示", "入力", "整数", "もし"],
        learningGoals: [
            "複数の値を入力する",
            "変数に最大値を保持する",
            "比較してより大きい値に更新する",
        ],
        jpCode: `表示("1つ目");
整数 a;
入力(a);
表示("2つ目");
整数 b;
入力(b);
表示("3つ目");
整数 c;
入力(c);
整数 max = a;
もし(bがmaxより大きい){
    max = b;
}
もし(cがmaxより大きい){
    max = c;
}
表示(max);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("1つ目\\n");
    int a;
    scanf("%d", &a);
    printf("2つ目\\n");
    int b;
    scanf("%d", &b);
    printf("3つ目\\n");
    int c;
    scanf("%d", &c);
    int max = a;
    if(b > max){
        max = b;
    }
    if(c > max){
        max = c;
    }
    printf("%d\\n", max);

    return 0;
}`,
        algorithmSteps: [
            "3つの整数を入力する",
            "最初の値を最大値とする",
            "2つ目が大きければ最大値を更新する",
            "3つ目が大きければ最大値を更新する",
            "最大値を表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "3,9,5", stdin: "3\n9\n5", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["9"] },
    },
    {
        id: "sum-average",
        title: "合計と平均",
        description: "3つの数の合計と平均",
        category: "計算",
        difficulty: 2,
        tags: ["入力", "計算", "小数"],
        commands: ["表示", "続けて表示", "入力", "整数", "小数"],
        learningGoals: [
            "複数の値を入力する",
            "合計を計算する",
            "平均を小数で計算して表示する",
        ],
        jpCode: `表示("1つ目");
整数 a;
入力(a);
表示("2つ目");
整数 b;
入力(b);
表示("3つ目");
整数 c;
入力(c);
整数 sum = a + b + c;
小数 avg = (小数)sum / 3;
続けて表示("合計: ");
表示(sum);
続けて表示("平均: ");
表示(avg);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("1つ目\\n");
    int a;
    scanf("%d", &a);
    printf("2つ目\\n");
    int b;
    scanf("%d", &b);
    printf("3つ目\\n");
    int c;
    scanf("%d", &c);
    int sum = a + b + c;
    double avg = (double)sum / 3;
    printf("合計: ");
    printf("%d\\n", sum);
    printf("平均: ");
    printf("%.2f\\n", avg);

    return 0;
}`,
        algorithmSteps: [
            "3つの整数を入力する",
            "3つの値を足して合計を求める",
            "合計を3で割って平均を計算する",
            "合計と平均を表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "10,20,30", stdin: "10\n20\n30", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["合計: 60", "平均: 20.00"] },
    },
    {
        id: "for-one-to-ten",
        title: "for文で1〜10を表示",
        description: "繰り返しの基本",
        category: "繰り返し",
        difficulty: 2,
        tags: ["繰り返し", "表示"],
        commands: ["表示", "整数", "繰り返し"],
        learningGoals: [
            "for 文（繰り返し）の書き方を学ぶ",
            "1から10まで順に表示する",
        ],
        jpCode: `整数 i;
繰り返し(i = 1; i <= 10; i++){
    表示(i);
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int i;
    for(i = 1; i <= 10; i++){
        printf("%d\\n", i);
    }

    return 0;
}`,
        algorithmSteps: [
            "カウンタ変数 i を用意する",
            "i が 1 から 10 まで1ずつ増えるループを回す",
            "ループのたびに i の値を表示する",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["1", "10"] },
    },
    {
        id: "array-sum",
        title: "配列の合計",
        description: "配列と繰り返し",
        category: "配列",
        difficulty: 3,
        tags: ["配列", "繰り返し", "計算"],
        commands: ["表示", "続けて表示", "整数", "繰り返し"],
        learningGoals: [
            "整数配列を宣言して初期値を入れる",
            "ループで配列の各要素にアクセスする",
            "要素の合計を求めて表示する",
        ],
        jpCode: `整数 data[5] = {10, 20, 30, 40, 50};
整数 sum = 0;
整数 i;
繰り返し(i = 0; i < 5; i++){
    sum = sum + data[i];
}
続けて表示("合計: ");
表示(sum);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int data[5] = {10, 20, 30, 40, 50};
    int sum = 0;
    int i;
    for(i = 0; i < 5; i++){
        sum = sum + data[i];
    }
    printf("合計: ");
    printf("%d\\n", sum);

    return 0;
}`,
        algorithmSteps: [
            "5要素の配列に値を入れる",
            "合計用の変数を0で用意する",
            "配列の各要素を順に足し込む",
            "合計を表示する",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["合計: 150"] },
    },
    {
        id: "for-kuku",
        title: "九九（9×9）",
        description: "二重ループで掛け算表",
        category: "繰り返し",
        difficulty: 3,
        tags: ["繰り返し", "計算"],
        commands: ["表示", "続けて表示", "整数", "繰り返し"],
        learningGoals: [
            "二重のfor文（繰り返し）で表形式の出力を作る",
            "変数 i と j を使って掛け算の結果を求める",
            "繰り返しの中にさらに繰り返しを入れ子にする",
        ],
        jpCode: `整数 i;
整数 j;
繰り返し(i = 1; i <= 9; i++){
    繰り返し(j = 1; j <= 9; j++){
        続けて表示(i);
        続けて表示(" x ");
        続けて表示(j);
        続けて表示(" = ");
        表示(i * j);
    }
}
`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int i;
    int j;
    for(i = 1; i <= 9; i++){
        for(j = 1; j <= 9; j++){
            printf("%d", i);
            printf(" x ");
            printf("%d", j);
            printf(" = ");
            printf("%d\\n", i * j);
        }
    }

    return 0;
}`,
        algorithmSteps: [
            "①外側のループで行（1〜9）を決める",
            "②内側のループで列（1〜9）を決める",
            "③i × j の結果を「i x j = 答え」の形で表示する",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["1 x 1 = 1", "9 x 9 = 81"] },
    },
    {
        id: "for-reverse",
        title: "逆順表示（10〜1）",
        description: "for文でカウントダウン",
        category: "繰り返し",
        difficulty: 2,
        tags: ["繰り返し", "表示"],
        commands: ["表示", "整数", "繰り返し"],
        learningGoals: [
            "for文の初期値・条件・更新を自分で設定する",
            "10から1まで逆順に表示する",
            "i-- で変数を1ずつ減らす",
        ],
        jpCode: `整数 i;
繰り返し(i = 10; i >= 1; i--){
    表示(i);
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int i;
    for(i = 10; i >= 1; i--){
        printf("%d\\n", i);
    }

    return 0;
}`,
        algorithmSteps: [
            "①カウンタ i を10から始める",
            "②i が1以上の間、ループを繰り返す",
            "③i の値を表示し、i を1減らす",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["10", "1"] },
    },
    {
        id: "for-triangle",
        title: "＊の三角形",
        description: "二重ループで図形表示",
        category: "繰り返し",
        difficulty: 3,
        tags: ["繰り返し", "表示"],
        commands: ["表示", "続けて表示", "整数", "繰り返し"],
        learningGoals: [
            "行ごとに表示する＊の数を変える",
            "二重ループで三角形の形を作る",
            "続けて表示で改行なしの出力を使う",
        ],
        jpCode: `整数 row;
繰り返し(row = 1; row <= 5; row++){
    整数 col;
    繰り返し(col = 1; col <= row; col++){
        続けて表示("*");
    }
    表示("");
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int row;
    for(row = 1; row <= 5; row++){
        int col;
        for(col = 1; col <= row; col++){
            printf("*");
        }
        printf("\\n");
    }

    return 0;
}`,
        algorithmSteps: [
            "①1行目から5行目まで繰り返す",
            "②その行の番号と同じ回数だけ＊を表示する",
            "③1行終わったら改行して次の行へ進む",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["*", "*****"] },
    },
    {
        id: "while-one-to-hundred",
        title: "1〜100まで表示",
        description: "while文の基本",
        category: "繰り返し",
        difficulty: 2,
        tags: ["繰り返し", "表示"],
        commands: ["表示", "整数", "間"],
        learningGoals: [
            "while文（間）で条件が満たされる間ループする",
            "1から100まで順に表示する",
            "ループの中で変数を更新する",
        ],
        jpCode: `整数 n = 1;
間(nが100以下){
    表示(n);
    n = n + 1;
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int n = 1;
    while(n <= 100){
        printf("%d\\n", n);
        n = n + 1;
    }

    return 0;
}`,
        algorithmSteps: [
            "①変数 n を1で初期化する",
            "②n が100以下の間、表示と加算を繰り返す",
            "③n を1増やして次のループへ進む",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["1", "100"] },
    },
    {
        id: "while-until-zero",
        title: "0が入力されるまで繰り返す",
        description: "while文と入力",
        category: "繰り返し",
        difficulty: 3,
        tags: ["繰り返し", "入力"],
        commands: ["表示", "入力", "整数", "間"],
        learningGoals: [
            "入力した値が0になるまで繰り返す",
            "while文で終了条件を設定する",
            "ループの中で何度も入力を受け取る",
        ],
        jpCode: `表示("数字を入力してください(0で終了)");
整数 n;
入力(n);
間(nが0と等しくない){
    表示(n);
    入力(n);
}`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("数字を入力してください(0で終了)\\n");
    int n;
    scanf("%d", &n);
    while(n != 0){
        printf("%d\\n", n);
        scanf("%d", &n);
    }

    return 0;
}`,
        algorithmSteps: [
            "①最初の数字を入力する",
            "②0以外が入力されている間、ループを続ける",
            "③入力した数字を表示し、次の数字を入力する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "5と0", stdin: "5\n0", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["5"] },
    },
    {
        id: "array-max",
        title: "配列の最大値",
        description: "配列を走査して最大値を求める",
        category: "配列",
        difficulty: 3,
        tags: ["配列", "繰り返し", "比較"],
        commands: ["表示", "続けて表示", "整数", "繰り返し", "もし"],
        learningGoals: [
            "配列の各要素を順に調べる",
            "これまでの最大値と比較して更新する",
            "ループで配列全体を処理する",
        ],
        jpCode: `整数 data[5] = {3, 9, 1, 7, 4};
整数 max = data[0];
整数 i;
繰り返し(i = 1; i < 5; i++){
    整数 temp = data[i];
    もし(tempがmaxより大きい){
        max = temp;
    }
}
続けて表示("最大値: ");
表示(max);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int data[5] = {3, 9, 1, 7, 4};
    int max = data[0];
    int i;
    for(i = 1; i < 5; i++){
        int temp = data[i];
        if(temp > max){
            max = temp;
        }
    }
    printf("最大値: ");
    printf("%d\\n", max);

    return 0;
}`,
        algorithmSteps: [
            "①配列の先頭を最大値の初期値とする",
            "②2番目以降の要素を1つずつ調べる",
            "③より大きい値があれば最大値を更新し、最後に表示する",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["最大値: 9"] },
    },
    {
        id: "array-min",
        title: "配列の最小値",
        description: "配列を走査して最小値を求める",
        category: "配列",
        difficulty: 3,
        tags: ["配列", "繰り返し", "比較"],
        commands: ["表示", "続けて表示", "整数", "繰り返し", "もし"],
        learningGoals: [
            "配列の各要素を順に調べる",
            "これまでの最小値と比較して更新する",
            "最大値を求める処理と同じ考え方を使う",
        ],
        jpCode: `整数 data[5] = {3, 9, 1, 7, 4};
整数 min = data[0];
整数 i;
繰り返し(i = 1; i < 5; i++){
    整数 temp = data[i];
    もし(tempがminより小さい){
        min = temp;
    }
}
続けて表示("最小値: ");
表示(min);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int data[5] = {3, 9, 1, 7, 4};
    int min = data[0];
    int i;
    for(i = 1; i < 5; i++){
        int temp = data[i];
        if(temp < min){
            min = temp;
        }
    }
    printf("最小値: ");
    printf("%d\\n", min);

    return 0;
}`,
        algorithmSteps: [
            "①配列の先頭を最小値の初期値とする",
            "②2番目以降の要素を1つずつ調べる",
            "③より小さい値があれば最小値を更新し、最後に表示する",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["最小値: 1"] },
    },
    {
        id: "array-average",
        title: "配列の平均",
        description: "配列の合計と平均を求める",
        category: "配列",
        difficulty: 3,
        tags: ["配列", "繰り返し", "計算", "小数"],
        commands: ["表示", "続けて表示", "整数", "小数", "繰り返し"],
        learningGoals: [
            "配列の全要素を足し合わせて合計を求める",
            "合計を要素数で割って平均を計算する",
            "整数から小数への型変換を使う",
        ],
        jpCode: `整数 data[5] = {10, 20, 30, 40, 50};
整数 sum = 0;
整数 i;
繰り返し(i = 0; i < 5; i++){
    sum = sum + data[i];
}
小数 avg = (小数)sum / 5;
続けて表示("平均: ");
表示(avg);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int data[5] = {10, 20, 30, 40, 50};
    int sum = 0;
    int i;
    for(i = 0; i < 5; i++){
        sum = sum + data[i];
    }
    double avg = (double)sum / 5;
    printf("平均: ");
    printf("%.2f\\n", avg);

    return 0;
}`,
        algorithmSteps: [
            "①配列の各要素を順に足して合計を求める",
            "②合計を要素数（5）で割る",
            "③平均を小数で表示する",
        ],
        stdinExamples: [{ label: "入力なし", stdin: "", expectStatus: "success" }],
        expectedOutput: { includes: ["平均: 30.00"] },
    },
    {
        id: "func-add",
        title: "足し算関数",
        description: "2つの数を足す関数",
        category: "関数",
        difficulty: 3,
        tags: ["関数", "入力", "計算"],
        commands: ["表示", "続けて表示", "入力", "整数", "戻る"],
        learningGoals: [
            "引数を受け取る関数を定義する",
            "関数の戻り値を使って計算結果を得る",
            "入力した2つの数を関数に渡す",
        ],
        jpCode: `整数 add(整数 a, 整数 b){
    戻る a + b;
}
表示("1つ目");
整数 a;
入力(a);
表示("2つ目");
整数 b;
入力(b);
整数 result = add(a, b);
続けて表示("合計: ");
表示(result);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int add(int a, int b){
        return a + b;
    }
    printf("1つ目\\n");
    int a;
    scanf("%d", &a);
    printf("2つ目\\n");
    int b;
    scanf("%d", &b);
    int result = add(a, b);
    printf("合計: ");
    printf("%d\\n", result);
}`,
        algorithmSteps: [
            "①2つの整数を受け取り、足した結果を返す関数を作る",
            "②キーボードから2つの数を入力する",
            "③関数を呼び出して合計を表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "3と4", stdin: "3\n4", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["合計: 7"] },
    },
    {
        id: "func-max",
        title: "最大値を返す関数",
        description: "2つの数の大きい方を返す",
        category: "関数",
        difficulty: 3,
        tags: ["関数", "入力", "分岐"],
        commands: ["表示", "続けて表示", "入力", "整数", "もし", "戻る"],
        learningGoals: [
            "条件分岐を使って大きい方の値を選ぶ",
            "関数から結果を返す（戻る）",
            "関数の戻り値を変数に代入する",
        ],
        jpCode: `整数 getMax(整数 a, 整数 b){
    もし(aがbより大きい){
        戻る a;
    }
    戻る b;
}
表示("1つ目");
整数 a;
入力(a);
表示("2つ目");
整数 b;
入力(b);
整数 result = getMax(a, b);
続けて表示("最大: ");
表示(result);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    int getMax(int a, int b){
        if(a > b){
            return a;
        }
        return b;
    }
    printf("1つ目\\n");
    int a;
    scanf("%d", &a);
    printf("2つ目\\n");
    int b;
    scanf("%d", &b);
    int result = getMax(a, b);
    printf("最大: ");
    printf("%d\\n", result);
}`,
        algorithmSteps: [
            "①2つの整数を比較する関数を作る",
            "②大きい方の値を戻り値として返す",
            "③入力した2つの数で関数を呼び出し、結果を表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "3と9", stdin: "3\n9", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["最大: 9"] },
    },
    {
        id: "string-name",
        title: "名前を入力して表示",
        description: "文字列の入力と表示",
        category: "文字列",
        difficulty: 2,
        tags: ["文字列", "入力", "表示"],
        commands: ["表示", "続けて表示", "入力", "文字列"],
        learningGoals: [
            "文字列型の変数を宣言する",
            "キーボードから名前を入力する",
            "入力した文字列をそのまま表示する",
        ],
        jpCode: `表示("名前を入力");
文字列 name[50];
入力(name);
続けて表示("こんにちは、");
表示(name);`,
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("名前を入力\\n");
    char name[50];
    scanf("%s", name);
    printf("こんにちは、");
    printf("%s\\n", name);

    return 0;
}`,
        algorithmSteps: [
            "①文字列を格納する変数を用意する",
            "②キーボードから名前を入力する",
            "③「こんにちは、」と入力した名前を表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "太郎", stdin: "太郎", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["こんにちは、太郎"] },
    },
    {
        id: "string-strlen",
        title: "文字数を表示",
        description: "strlenで文字列の長さ",
        category: "文字列",
        difficulty: 3,
        tags: ["文字列", "入力", "計算"],
        commands: ["表示", "続けて表示", "入力", "文字列", "整数"],
        learningGoals: [
            "文字列を入力して受け取る",
            "strlen関数で文字数を数える",
            "文字数を画面に表示する",
        ],
        jpCode: `表示("文字列を入力");
文字列 text[100];
入力(text);
整数 len = strlen(text);
続けて表示("文字数: ");
表示(len);`,
        cCode: `#include <stdio.h>
#include <string.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("文字列を入力\\n");
    char text[100];
    scanf("%s", text);
    int len = strlen(text);
    printf("文字数: ");
    printf("%d\\n", len);

    return 0;
}`,
        algorithmSteps: [
            "①文字列を入力する",
            "②strlenで文字数を数える",
            "③文字数を画面に表示する",
        ],
        stdinExamples: [
            { label: "入力なし", stdin: "", expectStatus: "input_required" },
            { label: "Hello", stdin: "Hello", expectStatus: "success" },
        ],
        expectedOutput: { includes: ["文字数: 5"] },
    },
];

attachPracticeToSamples(CODEBRIDGE_SAMPLES);

const HOME_FEATURED_SAMPLE_IDS = ["janken", "bmi", "grade", "omikuji"];

const NEW_PROJECT_JP_CODE = `表示("Hello, CodeBridge!");

`;

const NEW_PROJECT_C_CODE = `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("Hello, CodeBridge!\\n");

    return 0;
}`;

/** @deprecated NEW_PROJECT_JP_CODE を使用 */
const NEW_PROJECT_TEMPLATE = NEW_PROJECT_JP_CODE;

/** モードに応じたサンプルコードを返す */
function getSampleEditorCode(sample, mode = "jp2c") {
    if (!sample) return "";
    if (mode === "c2jp") return sample.cCode ?? "";
    return sample.jpCode ?? sample.code ?? "";
}

export {
    CODEBRIDGE_SAMPLES,
    HOME_FEATURED_SAMPLE_IDS,
    NEW_PROJECT_JP_CODE,
    NEW_PROJECT_C_CODE,
    NEW_PROJECT_TEMPLATE,
    getSampleEditorCode,
};
