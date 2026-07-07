// CodeBridge サンプルデータ（フロントエンド・テスト共通）
// jpCode … 日本語→C言語モード用 / cCode … C言語→日本語モード用（実行可能な C プログラム）

const CODEBRIDGE_SAMPLES = [
    {
        id: "hello",
        title: "はじめての表示",
        description: "表示命令の基本",
        learningGoals: ["表示命令で文字列を画面に出す", "プログラムの出力を確認する"],
        jpCode: '表示("Hello, CodeBridge!");',
        cCode: `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("Hello, CodeBridge!\\n");

    return 0;
}`,
        algorithmSteps: ["文字列を画面に表示する"],
    },
    {
        id: "input-echo",
        title: "入力と表示",
        description: "scanf の基本",
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
    },
    {
        id: "janken",
        title: "じゃんけん",
        description: "条件分岐と乱数",
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
    },
    {
        id: "bmi",
        title: "BMI計算",
        description: "小数と計算",
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
    },
    {
        id: "grade",
        title: "成績判定",
        description: "if / else if / else",
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
    },
    {
        id: "omikuji",
        title: "おみくじ",
        description: "乱数と分岐",
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
    },
    {
        id: "quiz",
        title: "四則演算クイズ",
        description: "入力・計算・判定",
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
    },
];

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
