# TICK-TACK-TOE

This game was a simple implementation of the classic while popular game - Tick-Tack-Toe, (also known as "San Zi Qi" in Chinese), inspired by <a href="https://www.freecodecamp.cn/challenges/build-a-tic-tac-toe-game">Task on FreeCodeCamp</a>.

Main Functions/Features:

1. When first opening the game, a modal will be poped up, which shows Game Instructions and Settings, you can click the button "Setting" to choose chess color, who first and audio on/off; You can also choose to enter the game directly with default settings which can be changed at any time of course;

2. The program was taught with chess rule and logic mainly by JavaScript and jQuery functions, which can somehow play the game just like a partner with you, as a priority, he(the program) would put the chess in a line if there is no threats(which means your side is about to win by three in line), if threats found, he would otherwise try to block the position and prevent your side from winning in the next step;

3. The program can also judge the situation and results of the game, a modal will pop up showing "You Win" if your side have put three chess in a line at first, in which you can choose: ①. To upgrade the game by choosing "let the program drop the first chess" (if it's your first drop in the last run) or just play again to keep the winner (if it's the program's first drop in the last run); ② Quit the game since it's too easy for you;

4. On the contrary, a modal will pop up showing "You Lose" if it's the program who achieved "three-in-line" at first, in which you can choose: ①. Replay the game for further challenges; ②. To downgrade the game by choosing "let me drop the first chess" (if it's the program's first drop in the last run) or To withdraw my last drop because of thoughtless (if it's the your first drop in the last run); ③ Quit the game since it's too difficult for you;

5. Of course there's another possibility of the results - "TIE", which means neither side achieved "three-in-line" till the last drop. In the popup modal showing tie, there would be also two options for your choice: ①. Replay the game for more times; ②. Quit the game since it's too easy for you;

6. The game was also enabled with the options of "Restart" or "Withdraw" like regular chess games. By clicking the button "Withdraw", the program will judge whether there are chesses on the chessboard, if yes, the last drop of both you and the program will be removed, the win/lose/tie result till the last drop will also be cancelled; Moreover, for a special case, a modal will pop up to remind your drop is invalid when you drop the chess at a postion with chess already;

7. Below the chess board there's records area which shows current settings including "who first", the chess color and left chess quantity of each side, the second line shows the Total Times you have played the game, and also times you have win/lose/tie the game;

8. The demo has been applied with BootStrap and CSS3 media query to achieve responsive designs in most platforms and different size of screens, which have been simulated and tested in Chrome developer tools;

This Demo is very simple since it's one of my practicing projects when learning Front-end Developments from scratch, it can be viewed @ <a href = "https://www.mike652638.com/demo/tick-tack-toe.html">My Website Demo Page-Tick-Tack-Toe</a>. Any issues or bugs report are always welcome, helpful commits will be much appreciated :)

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# 三子连珠棋

这个小游戏是对经典而流行的三子棋的简单实现, 参考了<a href = "https://www.freecodecamp.cn/challenges/build-a-tic-tac-toe-game">FreeCodeCamp上的实践任务OOXX小游戏</a>

主要功能/特色:

1. 初次打开本游戏页面时会弹出游戏简介和设置的模态框, 你可以点击"打开设置看看"来设定"棋子颜色", "谁先走棋"以及"音效开关"; 你也可以选择以默认设定("我方白棋", "我方先走", "音效开")直接进入游戏, 当然, 后续这些设定都是随时可以更改的;

2. 通过JavaScript和jQuery函数, 本程序具备基本的三子棋走子规则和逻辑, 能够像同伴一样陪你下棋; 在落子时, 他(本程序)会优先选择能促成"三子连珠"的位置, 在检测到威胁("你方即将促成三子连珠")时, 则会在你方连珠位落子给你添堵;

3. 本程序还能对棋局和结果进行判定, 当你方率先实现"三子连珠"时, 会弹出"你方获胜"的提示窗口, 该窗口中同时提供以下选项: ①. "挑战, 让电脑先走"(如果上一轮是你方先落子的话)或者"再来一盘, 续写辉煌"(如果上一轮是电脑先落子的话); ②. "太简单, 不玩了" 退出游戏;

4. 相反, 如果电脑方先实现"三子连珠", 则会弹出"你方输了"的提示窗口, 该窗口中同时提供以下选项: ①. "重玩, 继续挑战"; ②. "不服, 我先走棋"(如果上一轮是电脑方先落子的话)或者"疏忽, 我要悔棋"(如果上一轮是你方先落子的话); ③. "不玩了, 太伤人" 退出游戏;

5. 当然, 还有一种可能的结果 - "平局", 意味着直到最后一颗棋子落定, 双方都未能实现"三子连珠"。在弹出的"平局"提示框中, 你可以选择: ①. "继续, 决战到天亮"继续游戏; ②. "不玩儿了, 暴露智商啦" 退出游戏;

6. 和常规的棋类游戏一样, 该游戏同样具备"重玩"和"悔棋"功能。当点击"悔棋"按钮后, 程序会先做判断当前棋盘上是否存在你方棋子, 如存在则会撤销你方及电脑上一步的落子, 同时由上一步落子确定的结果赢/输/平也会被相应撤销; 另外, 在落子时, 程序会判断是否合理, 如果某个位置已经有棋子你再落子的话会提示"此坑已被占, 不能在此处落子哦";

7. 棋盘下方为记录区, 会展示当前设定:"哪方先走棋", "我方及电脑分别还有几颗棋子", 下边则是"历史战绩", 显示"总共玩了几盘", "赢/输/平分别为多少盘";

8. 这个小页面运用了BootStrap框架和CSS的媒体查询, 尽可能做到对不同平台不同尺寸屏幕的兼容(已在Chrome浏览器的开发者模式中模拟测试); 

这个小页面是我自学前端时实践的一个小项目, 实现起来并不难, 您可以进入<a target="_blank" href = "https://www.mike652638.com/demo/tick-tack-toe.html">我的网站DEMO展示页-三子连珠棋</a>查看在线效果, 随时欢迎您提出任何问题, 建议或反馈 :) <br>

<a target="_blank" href = "https://www.mike652638.com/demo/tick-tack-toe.html"><img src="https://www.mike652638.com/demo/tick-tack-toe/scrShts/tickScrSht-pc.png" alt="tick-tack-toe-screenshot" /></a>
