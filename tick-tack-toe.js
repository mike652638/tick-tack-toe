$(document).ready(function() {
    //在函数开头对所有函数中涉及到的"变量"进行声明及默认赋值
    var step = 0, //表示"走棋的步数", 初始状态为0, 我方和电脑每走一步, 步数分别加一
        clicked, //棋盘单元格"已点击"标记, 每走一步棋都在相应单元格加上这个标记, 防止在该位置"违规"重复落子
        myRole = "whtSide", //表示"我方"棋子的颜色, 默认为"我方白棋"("电脑黒棋"), 可在设置中更改
        whoFirst = "meFirst", //表示"我方先走"(先在棋盘上落第一个棋子), 可在设置中更改
        myNum, //记录我方每一步的落子位置
        pcNum, //记录电脑每一步的落子位置
        pcId, //对应电脑落子位置的单元格
        currentMyArr = [], //记录我方历史落子位置的数组
        currentPcArr = [], //记录电脑历史落子位置的数组
        leftArr = [1, 2, 3, 4, 5, 6, 7, 8, 9], //记录棋盘上的剩余位置(即下一步可供落子的位置), 每落子一次, 这个位置就从剩余位置中减去
        pcAvArr = [], //判断当前电脑落子时应该避免的位置(记为"坑",典型的比如"连线的三个位置中我方及电脑已经各占一子, 那么下一步如果在该连线第三个位置落子则属于废子, 因为这样不可能赢棋")
        isPcAv = "no", //判断当前位置是否为"坑"（默认"不是"）,电脑在每次走子前都会先对剩余位置做一下"坑位"排除
        isPcAvArr = [], //"坑位"记录数组, 方便"悔棋"时撤销对"坑位"的判定
        lstWinArr = [], //最先实现"三子连珠"的位置组合
        lstWinCls, //定义"三子连珠"位的红色背景高亮标记
        judge = "noResult", //定义每次落子前及落子后的棋局判定, 如果输赢已定则返回"hasResult", 此时双方无需继续落子
        resultArr = [], //记录历史战绩信息的数组, 格式如["赢", "平", "输", "赢", "平"]
        totalTimes = 0, //记录共玩过几盘, 比如上方数组表示玩过5盘
        myWinTimes = 0, //记录我方赢了几盘, 比如上方数组表示我方赢了2盘
        myLoseTimes = 0, //记录我方输了几盘, 比如上方数组表示我方输了1盘
        myTieTimes = 0, //记录我方平了几盘, 比如上方数组表示我方平了2盘
        myChesLeft = 5, //表示我方棋子剩余几颗(游戏开始时默认双方各自5颗棋子)
        pcChesLeft = 5; //表示电脑棋子剩余几颗

    //定义三子连珠的可能位置组合, 封装进二维数组
    var winArr = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9],
        [3, 5, 7]
    ];

    //应用Bootstrap响应式布局(宽度自适应)的同时，规定棋盘单元格高度等于宽度
    function tdHeight() {
        $(".bg td").css("height", $(".bg td").css("width"));
    }

    //在页面首次打开时即执行一次
    tdHeight();

    //监听浏览器窗口窗口大小变化，窗口宽度变化时单元格高度也跟着变化
    window.onresize = function() {
        tdHeight();
    };

    //定义攻略(即游戏介绍), 游戏首次开始时自动出现, 后续点击攻略按键时也可调用
    function introGame() {
        $("table button").css({
            "color": "#000",
            "font-size": "26px"
        });
        $(".bg button").removeClass("blk");
        $(".bg button").addClass("wht");
        setTimeout(function() {
            $("#tipModal").modal({
                backdrop: 'static',
                keyboard: false
            });
        }, 1000);
    }

    //点击攻略按键时调用攻略
    $("#tpGame").click(function() {
        introGame();
    });

    //点击“理解”选项可关闭攻略提示框并直接开始游戏
    $("#tip-yes").click(function() {
        $('#tipModal').modal('hide');
        $(".bg button").removeClass("wht");
        $("table button").css({
            "color": "transparent",
        });
        //此处做一个判断，是否为首次玩，再决定调用“首次玩”/“重玩”函数
        if (totalTimes === 0) {
            mainGame();
        } else {
            reGame();
        }
    });

    //点击“设置”选项可关闭攻略提示框并弹出设置选项
    $("#tip-set").click(function() {
        $('#tipModal').modal('hide');
        $(".bg button").removeClass("wht");
        $('#chsClrModal').modal({
            backdrop: 'static',
            keyboard: false
        });
        $("table button").css({
            "color": "transparent",
        });
    });

    //点击“不明白”选项可另外打开一个网页“百度搜索 三子棋”
    $("#tip-more").click(function() {
        window.open("http://dwz.cn/5OGzME"); //小技巧：应用百度短网址
    });

    //定义鼠标滑过棋盘时, 相应单元格背景高亮
    $("td").hover(
        function() {
            //排除三子连珠单元格, 其保持特定高亮不变
            if (!$(this).hasClass("lstWinCls")) {
                $(this).addClass("bg-blue");
            }
        },
        function() {
            if (!$(this).hasClass("lstWinCls")) {
                $(this).removeClass("bg-blue");
            }
        }
    );

    //定义“设置”按键功能，弹出设置窗口
    $("#stGame").click(function() {
        $('#chsClrModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    //选择“我方白棋”后做相应赋值及改变
    $("#chsWht").click(function() {
        myRole = "whtSide";
        $('#chsClrModal').modal('hide');
        //更新信息栏, 我方及电脑黑白棋子对调
        $("#mySide").removeClass("blk");
        $("#mySide").addClass("wht");
        $("#pcSide").removeClass("wht");
        $("#pcSide").addClass("blk");
    });

    //选择“我方黑棋”后做相应赋值及改变
    $("#chsBlk").click(function() {
        myRole = "blkSide";
        $('#chsClrModal').modal('hide');
        //更新信息栏, 我方及电脑黑白棋子对调
        $("#mySide").removeClass("wht");
        $("#mySide").addClass("blk");
        $("#pcSide").removeClass("blk");
        $("#pcSide").addClass("wht");
    });

    //选定我方棋子颜色后继续弹出选择“我方/电脑先走”的弹窗选项
    $('#chsClrModal').on('hidden.bs.modal', function(e) {
        $('#chsFstModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    //选择“我方先走”后做相应赋值及改变
    $("#meFst").click(function() {
        whoFirst = "meFirst";
        //更新下方信息栏为电脑先走
        $("#fstOpt").text("我方");
        $('#chsFstModal').modal('hide');
    });

    //选择“电脑先走”后做相应赋值及改变
    $("#pcFst").click(function() {
        whoFirst = "pcFirst";
        //更新下方信息栏为电脑先走
        $("#fstOpt").text("电脑");
        $('#chsFstModal').modal('hide');
    });

    //设置好“谁先走棋”后接着自动弹出“音效开关”窗口
    $('#chsFstModal').on('hidden.bs.modal', function(e) {
        $('#sndStModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    //设置“开启音效”
    $("#sndSt-yes").click(function() {
        $('#sndStModal').modal('hide');
        //切换音效开关图标为关
        /**
         重点注意：此处不能像下面定义一级“音效开关”那样使用$(this),
         因为这里的$(this)指向最外层的$("#sndSt-no"), 而非下方的$("#snGame")
        $(this).children().removeClass("glyphicon-volume-up");
        $(this).children().addClass("glyphicon-volume-off");
        **/
        if ($("#snGame i").hasClass("glyphicon-volume-off")) {
            $("#snGame").children().removeClass("glyphicon-volume-off");
            $("#snGame").children().addClass("glyphicon-volume-up");
        }

        //切换背景音音量值为1
        var sndArr = $("audio[id$='Snd']");
        for (var k in sndArr) {
            if (sndArr[k].volume === 0) {
                sndArr[k].volume = 1;
            }
        }
        //三个选项均设置完毕，如果是首次游戏，则直接“开始游戏”，否则为“重玩游戏”，区别为后者会保留历史战绩信息
        if (totalTimes === 0) {
            mainGame();
        } else {
            reGame();
        }
    });

    //设置“关闭音效”
    $("#sndSt-no").click(function() {
        $('#sndStModal').modal('hide');
        //切换音效开关图标为关
        /**
         重点注意：此处不能像下面定义一级“音效开关”那样使用$(this),
         因为这里的$(this)指向最外层的$("#sndSt-no"), 而非下方的$("#snGame")
        $(this).children().removeClass("glyphicon-volume-up");
        $(this).children().addClass("glyphicon-volume-off");
        **/
        if ($("#snGame i").hasClass("glyphicon-volume-up")) {
            $("#snGame").children().removeClass("glyphicon-volume-up");
            $("#snGame").children().addClass("glyphicon-volume-off");
        }

        //切换背景音值为0
        var sndArr = $("audio[id$='Snd']");
        for (var k in sndArr) {
            if (sndArr[k].volume === 1) {
                sndArr[k].volume = 0;
            }
        }
        //三个选项均设置完毕，如果是首次游戏，则直接“开始游戏”，否则为“重玩游戏”，区别为后者会保留历史战绩信息
        if (totalTimes === 0) {
            mainGame();
        } else {
            reGame();
        }
    });

    //定义一级“音效开关”，打开音效即设置背景音音量为1，否则为0
    $("#snGame").click(function() {
        //切换音量图标icon
        if ($("#snGame i").hasClass("glyphicon-volume-up")) {
            $(this).children().removeClass("glyphicon-volume-up");
            $(this).children().addClass("glyphicon-volume-off");
        } else {
            $(this).children().removeClass("glyphicon-volume-off");
            $(this).children().addClass("glyphicon-volume-up");
        }

        //特殊的jQ id选择器，将id以Snd结尾的audio标签封装成一个数组再对其内部进行循环操作
        var sndArr = $("audio[id$='Snd']");
        for (var k in sndArr) {
            if (sndArr[k].volume === 1) {
                sndArr[k].volume = 0;
            } else if (sndArr[k].volume === 0) {
                sndArr[k].volume = 1;
            }
        }
    });

    //定义悔棋按键, 绑定最后面函数bkGame()
    $("#bkGame").click(function() {
        bkGame();
    });

    //按了悔棋按键提示"棋盘上已无我方棋子"时关闭提示框
    $("#noBk-ct").click(function() {
        $("#noBkModal").modal("hide");
    });

    //按了悔棋按键提示"棋盘上已无我方棋子"时关闭提示框并重玩游戏
    $("#noBk-re").click(function() {
        $("#noBkModal").modal("hide");
        reGame();
    });

    //定义重玩按键, 绑定最后面函数reGame()
    $("#reGame").click(function() {
        reGame();
    });

    //定义上一盘赢棋后接着重玩, 绑定最后面函数reGame()
    $("#myWin-reGame").click(function() {
        $('#myWinModal').modal('hide');
        reGame();
    });

    //定义上一盘赢棋后接着玩且让电脑先走提高难度
    $("#myWin-upGame").click(function() {
        $('#myWinModal').modal('hide');
        whoFirst = "pcFirst";
        $("#fstOpt").text("电脑");
        reGame();
    });

    //定义上一盘赢棋后不玩了, 回到上一盘结束时状态
    $("#myWin-ndGame").click(function() {
        $('#myWinModal').modal('hide');
    });

    //定义上一盘输棋后不服悔棋, 返回到悔棋状态
    $("#pcWin-bkGame").click(function() {
        $('#pcWinModal').modal('hide');
        resultArr.pop(); //悔棋后撤销本轮输棋结果
        updtRecords(); //悔棋后撤销战绩历史对本轮输棋的记录
        bkGame();
    });

    //定义上一盘(电脑先走)我方输棋后，降低难度让我方先走
    $("#pcWin-dnGame").click(function() {
        $('#pcWinModal').modal('hide');
        whoFirst = "meFirst";
        $("#fstOpt").text("我方");
        reGame();
    });

    //定义上一盘输棋后接着重玩, 绑定最后面函数reGame()
    $("#pcWin-reGame").click(function() {
        $('#pcWinModal').modal('hide');
        reGame();
    });

    //定义上一盘输棋后不玩了, 结束游戏
    $("#pcWin-ndGame").click(function() {
        $('#pcWinModal').modal('hide');
    });

    //定义上一盘和棋后接着重玩, 绑定最后面函数reGame()
    $("#tie-reGame").click(function() {
        $('#tieModal').modal('hide');
        reGame();
    });

    //定义上一盘和棋后不玩了, 结束游戏
    $("#tie-ndGame").click(function() {
        $('#tieModal').modal('hide');
    });

    //定义落子位置已有棋子(且棋盘有其他空位)时弹窗提示, 点击确认后关闭弹窗
    $("#invld-ct").click(function() {
        $("#invldModal").modal('hide');
    });

    //定义落子位置已有棋子时弹窗提示, 点击确认后关闭弹窗且悔棋
    $("#invld-bk").click(function() {
        $("#invldModal").modal('hide');
        bkGame();
    });

    //定义落子位置已有棋子时弹窗提示, 点击确认后关闭弹窗且重玩
    $("#invld-re").click(function() {
        $("#invldModal").modal('hide');
        reGame();
    });

    //定义按浏览器刷新按钮(或F5)后提示"网页刷新后历史战绩信息会被清空"
    window.addEventListener("beforeunload", function(e) {
        var confirmationMessage = "退出网页后历史战绩信息会被清空, 确定要退出么 ?";

        e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
        return confirmationMessage; // Gecko, WebKit, Chrome <34
    });

    /**
    //20170415自创方法, 检测后一个数组是否为前一个数组的子集, 掌声鼓励 :)
    function chkArr(arr, numArr) {
        var i = 0;
        for (i; i < numArr.length;) {
            if (arr.indexOf(numArr[i]) > -1) {
                i++;
            } else {
                return false;
            }
        }
        return i === numArr.length;
    }

    console.log(chkArr([1, 2, 4, 5, 8], [1, 2, 5, 8])); //true
    console.log(chkArr([1, 2, 4, 5], [1, 2, 6])); //false
    **/

    //20170415自创方法加强版, 检测后一个二位数组中是否包含前一个数组的子集, 掌声鼓励 :)
    function chkArr(arr, dyArr) {
        var i = 0,
            j = 0;
        for (i; i < dyArr.length;) {
            for (j; j < dyArr[i].length;) {
                if (arr.indexOf(dyArr[i][j]) > -1) {
                    j++;
                } else {
                    break; //break用于跳出循环, 并继续执行后续代码
                }
            }
            if (j === dyArr[i].length) {
                if (lstWinArr.length === 0) {
                    lstWinArr = dyArr[i];
                }
                return true;
            } else {
                j = 0; //下一次循环开始前必须将二维数组的下标归零
                i++;
            }

        }
        return false;
    }

    /**
    console.log(chkArr([1, 2, 4, 5, 8], [
        [1, 3, 4],
        [5, 8]
    ])); //true
    **/

    //以下是电脑棋手(比如黑子)的走子逻辑
    function mkPcNum(crtPcArr, crtMyArr, lfArr) {
        pcNum = null;
        pcId = null;
        for (var m = 0; m < 8; m++) {
            //如果当前棋局中已经有两个黑子相连且第三个连线位置空着, 则在此处落子即胜;
            if (crtPcArr.indexOf(winArr[m][0]) > -1 && crtPcArr.indexOf(winArr[m][1]) > -1 && lfArr.indexOf(winArr[m][2]) > -1) {
                pcNum = winArr[m][2];
                break;
                //如果当前棋局中已经有两个黑子相隔一子且中间间隔位置空着, 则在此处落子即胜;
            } else if (crtPcArr.indexOf(winArr[m][0]) > -1 && crtPcArr.indexOf(winArr[m][2]) > -1 && lfArr.indexOf(winArr[m][1]) > -1) {
                pcNum = winArr[m][1];
                break;
                //如果当前棋局中已经有两个黑子相连且第三个连线位置空着, 则在此处落子即胜;
            } else if (crtPcArr.indexOf(winArr[m][1]) > -1 && crtPcArr.indexOf(winArr[m][2]) > -1 && lfArr.indexOf(winArr[m][0]) > -1) {
                pcNum = winArr[m][0];
                break;
            }
        }

        //上述为电脑棋手落子第一优先级, 如果以上都不符合, 则进入第二优先级, 给对方棋手(比如白棋)即将连线的第三子位置添堵;
        if (m === 8 && pcNum === null) {
            for (m = 0; m < 8; m++) {
                //如果当前棋局中已经有两个白子相连且第三个连线位置空着, 则在此处落子添堵;
                if (crtMyArr.indexOf(winArr[m][0]) > -1 && crtMyArr.indexOf(winArr[m][1]) > -1 && lfArr.indexOf(winArr[m][2]) > -1) {
                    pcNum = winArr[m][2];
                    break;
                    //如果当前棋局中已经有两个白子相隔一子且中间间隔位置空着, 则在此处落子添堵;
                } else if (crtMyArr.indexOf(winArr[m][0]) > -1 && crtMyArr.indexOf(winArr[m][2]) > -1 && lfArr.indexOf(winArr[m][1]) > -1) {
                    pcNum = winArr[m][1];
                    break;
                    //如果当前棋局中已经有两个白子相连且第三个连线位置空着, 则在此处落子添堵;
                } else if (crtMyArr.indexOf(winArr[m][1]) > -1 && crtMyArr.indexOf(winArr[m][2]) > -1 && lfArr.indexOf(winArr[m][0]) > -1) {
                    pcNum = winArr[m][0];
                    break;
                }
            }
        }

        //上述为电脑棋手落子第二优先级, 如果以上都不符合, 则进入第三优先级, 尽快促成第二子连线且避开同线第三子已经被堵的情况;
        if (m === 8 && pcNum === null) {
            for (m = 0; m < 8; m++) {
                if (crtPcArr.indexOf(winArr[m][0]) > -1 && crtMyArr.indexOf(winArr[m][2]) === -1 && lfArr.indexOf(winArr[m][1]) > -1) {
                    pcNum = winArr[m][1];
                    break;
                } else if (crtPcArr.indexOf(winArr[m][0]) > -1 && crtMyArr.indexOf(winArr[m][1]) === -1 && lfArr.indexOf(winArr[m][2]) > -1) {
                    pcNum = winArr[m][2];
                    break;
                } else if (crtPcArr.indexOf(winArr[m][1]) > -1 && crtMyArr.indexOf(winArr[m][2]) === -1 && lfArr.indexOf(winArr[m][0]) > -1) {
                    pcNum = winArr[m][0];
                    break;
                } else if (crtPcArr.indexOf(winArr[m][1]) > -1 && crtMyArr.indexOf(winArr[m][0]) === -1 && lfArr.indexOf(winArr[m][2]) > -1) {
                    pcNum = winArr[m][2];
                    break;
                } else if (crtPcArr.indexOf(winArr[m][2]) > -1 && crtMyArr.indexOf(winArr[m][0]) === -1 && lfArr.indexOf(winArr[m][1]) > -1) {
                    pcNum = winArr[m][1];
                    break;
                } else if (crtPcArr.indexOf(winArr[m][2]) > -1 && crtMyArr.indexOf(winArr[m][1]) === -1 && lfArr.indexOf(winArr[m][0]) > -1) {
                    pcNum = winArr[m][0];
                    break;
                }
            }
        }

        //上述为电脑棋手落子第三优先级, 如果以上都不符合, 则进入第四优先级, 从剩余位置随机选择但前提是避开同线第三子已经被堵的情况;
        if (m === 8 && pcNum === null) {
            for (m = 0; m < 8; m++) {
                if (crtPcArr.indexOf(winArr[m][0]) > -1 && crtMyArr.indexOf(winArr[m][2]) > -1 && lfArr.indexOf(winArr[m][1]) > -1) {
                    isPcAv = "yes";
                    pcAvArr.push(winArr[m][1]);
                } else if (crtPcArr.indexOf(winArr[m][0]) > -1 && crtMyArr.indexOf(winArr[m][1]) > -1 && lfArr.indexOf(winArr[m][2]) > -1) {
                    isPcAv = "yes";
                    pcAvArr.push(winArr[m][2]);
                } else if (crtPcArr.indexOf(winArr[m][1]) > -1 && crtMyArr.indexOf(winArr[m][2]) > -1 && lfArr.indexOf(winArr[m][0]) > -1) {
                    isPcAv = "yes";
                    pcAvArr.push(winArr[m][0]);
                } else if (crtPcArr.indexOf(winArr[m][1]) > -1 && crtMyArr.indexOf(winArr[m][0]) > -1 && lfArr.indexOf(winArr[m][2]) > -1) {
                    isPcAv = "yes";
                    pcAvArr.push(winArr[m][2]);
                } else if (crtPcArr.indexOf(winArr[m][2]) > -1 && crtMyArr.indexOf(winArr[m][0]) > -1 && lfArr.indexOf(winArr[m][1]) > -1) {
                    isPcAv = "yes";
                    pcAvArr.push(winArr[m][1]);
                } else if (crtPcArr.indexOf(winArr[m][2]) > -1 && crtMyArr.indexOf(winArr[m][1]) > -1 && lfArr.indexOf(winArr[m][0]) > -1) {
                    isPcAv = "yes";
                    pcAvArr.push(winArr[m][0]);
                }
            }
            //以上将同线第三子被堵时应避免的位置封装进一个"避坑数组"

            //如果上面避坑数组长度大于0, 则对剩余位置做一次循环判断
            if (pcAvArr.length > 0) {
                var n;
                //对避坑数组进行去重处理, 避免pcAvArr=[1, 1, 1]这种情况出现导致下方随机取值出问题
                pcAvArr = pcAvArr.filter(function(element, index, self) {
                    return self.indexOf(element) === index;
                });
                //如果剩余位置中, 某个位置不属于"避坑数组", 则优先取该值, 即在此处落子
                for (n in lfArr) {
                    if (pcAvArr.indexOf(lfArr[n]) === -1) {
                        pcNum = lfArr[n];
                        break;
                    }
                } //如果剩余位置中, 所有位置都属于"避坑数组", 没办法, 只能随机踩坑, 当然这是最末优先级
                if (n - 0 === lfArr.length - 1 && pcNum === null) {
                    var x = Math.floor(Math.random() * lfArr.length);
                    pcNum = lfArr[x];
                }
            } else { //如果上面避坑数组长度等于0, 不存在坑, 则直接在余下位置随机取值
                var y = Math.floor(Math.random() * lfArr.length);
                pcNum = lfArr[y];
            }
        }
        pcId = "#" + "btn" + pcNum;
        isPcAvArr.push(isPcAv);
    }
    //定义棋局判定函数, 在每次落子前判断当前棋局是否胜负已定, 落子后判断棋局是否有变化, 是否能判定输赢或平局
    function judgeGame() {
        if (chkArr(currentMyArr, winArr)) {
            //在我方取胜时, 先判断上一盘是否是我方先走, 是的话就给出"提高难度让电脑先走"的选项
            if (whoFirst === "meFirst") {
                $("#myWin-upGame").removeClass('noDisplay'); //显示"升级难度, 让电脑先走"的选项
            } else {
                $("#myWin-upGame").addClass('noDisplay'); //隐藏"升级难度, 让电脑先走"的选项
            }
            $("#winSnd")[0].play(); //播放赢棋音效

            //间隔半秒后弹出"赢棋"提示框
            setTimeout(function() {
                $('#myWinModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }, 500);
            judge = "hasResult";
        } else if (chkArr(currentPcArr, winArr)) {
            //在我方输棋时, 先判断这一盘是否是我方先走, 不是的话就给出"降低难度让我方先走"的选项
            if (whoFirst === "pcFirst") {
                $("#pcWin-bkGame").addClass('noDisplay'); //隐藏"悔棋"的选项
                $("#pcWin-dnGame").css("float", "left"); //加上这条是为了弹窗界面选项更好的分散对齐
                $("#pcWin-dnGame").removeClass('noDisplay'); //显示"我方先来"的选项
            } else {
                $("#pcWin-dnGame").addClass('noDisplay');
                $("#pcWin-bkGame").removeClass('noDisplay');
            }

            $("#loseSnd")[0].play(); //播放输棋音效

            //间隔半秒后弹出"输棋"提示框
            setTimeout(function() {
                $('#pcWinModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }, 500);
            judge = "hasResult";
        } else if (step === 9 && !chkArr(currentMyArr, winArr) && !chkArr(currentPcArr, winArr)) {
            $("#tieSnd")[0].play(); //播放和棋音效

            //间隔半秒后弹出"和棋"提示框
            setTimeout(function() {
                $('#tieModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }, 500);
            judge = "hasResult";
        } else {
            judge = "noResult"; //如果暂时无法判定"输赢平"结果, 则返回"无结果", 双方需继续落子
        }
    }

    //定义电脑棋手先走的情况, 供相关函数调用
    function pcFirst() {
        //电脑棋手在棋盘任意位置落下第一子
        var z = Math.floor(Math.random() * leftArr.length);
        pcNum = leftArr[z];
        pcId = "#" + "btn" + pcNum;
        currentPcArr.push(pcNum);
        leftArr.splice(leftArr.indexOf(pcNum), 1);
        $(pcId).parent().addClass("clicked");
        step += 1;
        if (myRole === "blkSide") {
            $(pcId).addClass('wht');
        } else {
            $(pcId).addClass('blk');
        }
        pcChesLeft -= 1;
        $("#pcChesLeft").text(pcChesLeft);
        $("#pcChsSnd")[0].play();
        //对当前"走了第几步", "电脑棋手和人的棋子分别在哪几个位置", "棋盘剩余哪些位置", 是否有坑, 以及"避坑位置"都做一个记录, 方便找BUG和代码优化
        console.trace("step = " + step + " pcNum = " + pcNum + " currentMyArr= " + currentMyArr + " currentPcArr= " + currentPcArr + " leftArr = " + leftArr + " isPcAv = " + isPcAv + " pcAvArr = " + pcAvArr + " lstWinArr= " + lstWinArr + " resultArr= " + resultArr);
    }

    function mainGame() {
        //如果之前选择的是电脑棋手先走的话, 就执行这一函数, 电脑先落第一子, 否则这个指令不执行
        if (whoFirst === "pcFirst") {
            pcFirst();
        }
        $("td").click(function() {
            //电脑已经先达成三子连珠(赢棋)的情况下, 即使棋盘有空位, 我方也不能落子(否则我方在下一步也可能实现三子连珠)
            //调用二维数组检测函数对当前结果做一个判定, 如果上一步输赢或平局已定, 这一步就无需落子而是直接弹出对弈结果
            judgeGame();
            //console.trace(judge); 如果judgeGame()函数判定上一步棋局胜负平未分才可以继续后续操作
            if (judge === "noResult") {
                //人点击棋盘落子时要先做一个判断, 当前位置是否空着, 空着才能落子, 否则弹框提示"此处已有棋子"
                if ($(this).hasClass("clicked")) {
                    $("#warnSnd")[0].play(); //播放警告音效
                    if (leftArr.length === 0) {
                        $("#invld-ct").addClass('noDisplay'); //如果当前棋盘已无剩余位置, 则隐藏弹窗提示"接着找其他空位"的选项
                    }
                    $('#invldModal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                } else { //当前位置空着的话, 才能执行下面这些动作  在不违反上述所有规则的前提下, 才能正式开始落子
                    //获取本次所点击单元格对应的数字(这个数字在网页中默认隐藏的, 小技巧 color:"transparent")
                    myNum = $(this).children("button").text() - 0;
                    //向我方走子记录的数组添加这个单元格序号
                    currentMyArr.push(myNum);
                    //从棋盘剩余位置中去掉这个单元格
                    leftArr.splice(leftArr.indexOf(myNum), 1);
                    //给这个单元格标记为"已点击", 防止二次点击时("违规")换子
                    $(this).addClass("clicked");
                    //走棋步数加一
                    step += 1;
                    //我方棋子剩余数量减去一个
                    myChesLeft -= 1;
                    //下方信息栏更新我方棋子剩余数量
                    $("#myChesLeft").text(myChesLeft);
                    //落子时播放落子音效
                    $("#myChsSnd")[0].play();
                    //运用上方定义的二维数组检测函数来判定这一步落子以后是否"赢棋"或者"和棋"
                    //因为这一步是我方走的, 所以不可能在这一步出现"输棋", 故无需对"输棋"做判定
                    if (chkArr(currentMyArr, winArr)) {
                        //如果判定"赢棋"
                        markWinChes(); //将赢棋时连珠的三子以红色背景标注出来
                        resultArr.push("win"); //向历史战绩信息中最佳一条"赢棋"记录
                    } else if (step === 9 && !chkArr(currentMyArr, winArr) && !chkArr(currentPcArr, winArr)) {
                        //如果当前是第9次落子, 而且我方与电脑都没有赢, 就判定为"和棋平局"
                        resultArr.push("tie"); //向历史战绩信息中最佳一条"和棋"记录
                    }

                    //对当前"走了第几步", "电脑棋手和人的棋子分别在哪几个位置", "棋盘剩余哪些位置", 是否有坑, 以及"避坑位置"都做一个记录, 方便找BUG和代码优化
                    console.trace("step = " + step + " pcNum = " + pcNum + " currentMyArr= " + currentMyArr + " currentPcArr= " + currentPcArr + " leftArr = " + leftArr + " isPcAv = " + isPcAv + " pcAvArr = " + pcAvArr + " lstWinArr= " + lstWinArr + " resultArr= " + resultArr);

                    //调用上方定义的电脑走子逻辑, 电脑根据落子优先级来决定在何处落子
                    mkPcNum(currentPcArr, currentMyArr, leftArr);
                    //人先走的话, 电脑最后一步(第10步)走的其实是空棋, 所以这一步不能算, 故用if做一个判断(pcNum==="undefined")排除这种情况
                    if (pcNum) {
                        //这部分跟上面大致相同
                        currentPcArr.push(pcNum);
                        leftArr.splice(leftArr.indexOf(pcNum), 1);
                        $(pcId).parent().addClass("clicked");
                        step += 1;
                        pcChesLeft -= 1;
                        $("#pcChesLeft").text(pcChesLeft);
                        $("#pcChsSnd")[0].play();

                        if (chkArr(currentPcArr, winArr)) {
                            markWinChes();
                            resultArr.push("lose");
                        } else if (step === 9 && !chkArr(currentMyArr, winArr) && !chkArr(currentPcArr, winArr)) {
                            resultArr.push("tie");
                        }
                        //对当前"走了第几步", "电脑棋手和人的棋子分别在哪几个位置", "棋盘剩余哪些位置", 是否有坑, 以及"避坑位置"都做一个记录, 方便找BUG和代码优化
                        console.trace("step = " + step + " pcNum = " + pcNum + " currentMyArr= " + currentMyArr + " currentPcArr= " + currentPcArr + " leftArr = " + leftArr + " isPcAv = " + isPcAv + " pcAvArr = " + pcAvArr + " lstWinArr= " + lstWinArr + " resultArr= " + resultArr);
                    }
                    //调用下方定义的战绩更新函数, 更新底部信息栏历史战绩输赢及和棋记录
                    updtRecords();

                    //如果人选的是黒棋, 则电脑为白棋
                    if (myRole === "blkSide") {
                        $(this).children("button").addClass('blk'); //我方落"黑子"
                        $(pcId).addClass('wht'); //电脑落"白子"

                        //如果人选的是白棋, 则电脑为黑棋, 落子颜色刚好相反
                    } else if (myRole === "whtSide") {
                        $(this).children("button").addClass('wht');
                        $(pcId).addClass('blk');
                    }
                    //落子后再次调用函数判断棋局是否发生变化, 如果改变则相应弹窗提示"输/赢/平"
                    judgeGame();
                }
            }
        });
    }

    //首次打开网页时默认调用"游戏攻略"函数, 弹出"游戏攻略"提示框对游戏做简单介绍, 重玩时不会弹出此窗口
    introGame();

    //定义游戏输/赢时, 连珠的三子高亮
    function markWinChes() {
        for (var i in lstWinArr) {
            $("#btn" + lstWinArr[i]).parent().addClass("lstWinCls");
        }
    }

    //定义战绩信息, 并在每盘结束时更新到底部信息栏
    function updtRecords() {
        totalTimes = resultArr.length;
        //注意每次更新胜负次数之前要先将上一次胜负平的统计结果归零, 否则之前的统计结果会一直累加
        myWinTimes = 0;
        myLoseTimes = 0;
        myTieTimes = 0;
        //从resultArr中分别数一遍"win""lose""tie"的个数
        for (var j in resultArr) {
            if (resultArr[j] === "win") {
                myWinTimes += 1;
            } else if (resultArr[j] === "lose") {
                myLoseTimes += 1;
            } else {
                myTieTimes += 1;
            }
        }

        //分别对历史战绩信息栏的"总盘数"/ "赢"/ "输"/ "平"的次数做一次更新
        $("#totalTimes").text(totalTimes);
        $("#myWinTimes").text(myWinTimes);
        $("#myLoseTimes").text(myLoseTimes);
        $("#myTieTimes").text(myTieTimes);
    }

    //定义悔棋逻辑, 即将上一步的操作都撤销
    function bkGame() {
        //只有当电脑和人至少各走一步后才存在悔棋
        if (step >= 2) {

            //找出上一步电脑和人各自的落子位置
            var bkMyNum = currentMyArr[currentMyArr.length - 1],
                bkPcNum = currentPcArr[currentPcArr.length - 1];

            //分别撤销上一步电脑和人各自的落子
            //对两方棋子颜色做下判断, 才能将相应单元格特定颜色的棋子撤销
            if (myRole === "whtSide") {
                $("#btn" + bkMyNum).removeClass("wht");
                $("#btn" + bkPcNum).removeClass("blk");
            } else {
                $("#btn" + bkMyNum).removeClass("blk");
                $("#btn" + bkPcNum).removeClass("wht");
            }

            //判断上一步是否加了"坑", 有的话也撤销, 不判定直接撤销的话可能撤销的是上上步的"坑", 再走棋时会出BUG
            if (isPcAvArr[step - 1] === "yes") {
                pcAvArr.pop();
            }

            //对上一步电脑和人各自落子位置单元格取消"已点击"状态, 避免悔棋后再次落子时提示"此处已经有子"
            $("#btn" + bkMyNum).parent().removeClass("clicked");
            $("#btn" + bkPcNum).parent().removeClass("clicked");
            $("td").removeClass("lstWinCls");

            lstWinArr = []; //清空上一次可能生成的三子连珠位置, 即取消高亮标记
            leftArr.push(currentMyArr.pop()); //清除上一次记录的我方走子位置并追加到棋盘剩余位置
            leftArr.push(currentPcArr.pop()); //清除上一次记录的电脑走子位置并追加到棋盘剩余位置
            pcNum = currentPcArr[currentPcArr.length - 1]; //将电脑棋子恢复到上上步的位置
            step -= 2; //悔棋后走子步数减少两步(我方及电脑各回退一步)

            //我方及电脑剩余棋子数量分别加一并更新到底部信息栏
            myChesLeft += 1;
            pcChesLeft += 1;
            $("#myChesLeft").text(myChesLeft);
            $("#pcChesLeft").text(pcChesLeft);

            //悔棋时也会播放落子音效
            $("#myChsSnd")[0].play();
            $("#pcChsSnd")[0].play();

            //对当前"走了第几步", "电脑棋手和人的棋子分别在哪几个位置", "棋盘剩余哪些位置", 是否有坑, 以及"避坑位置"都做一个记录, 方便找BUG和代码优化
            console.trace("step = " + step + " pcNum = " + pcNum + " currentMyArr= " + currentMyArr + " currentPcArr= " + currentPcArr + " leftArr = " + leftArr + " isPcAv = " + isPcAv + " pcAvArr = " + pcAvArr + " lstWinArr= " + lstWinArr + " resultArr= " + resultArr);
        } else {
            $("#warnSnd")[0].play();
            $("#noBkModal").modal({
                backdrop: 'static',
                keyboard: false
            });
        }
    }

    //定义重玩逻辑, 即将棋盘重置, 所有白子黑子删除, 走棋记录清空, 但历史战绩("总盘数"/"赢"/"输"/"平"记录)以及之前的设置("我方"/"电脑"先走和棋子颜色)要保留
    function reGame() {
        $(".bg button").removeClass("blk");
        $(".bg button").removeClass("wht");
        $("td").removeClass("lstWinCls");
        $("td").removeClass("bg-blue");
        $("td").removeClass("bg-yellow");
        $("td").removeClass("clicked");

        step = 0;
        pcNum = null;
        lstWinArr = [];
        currentMyArr = [];
        currentPcArr = [];
        leftArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        isPcAv = "no";
        isPcAvArr = [];
        pcAvArr = [];
        myChesLeft = 5;
        pcChesLeft = 5;
        $("#myChesLeft").text(myChesLeft);
        $("#pcChesLeft").text(pcChesLeft);

        //如果之前选择的是电脑棋手先走的话, 就执行这一段, 电脑先落第一子, 否则这段不执行
        if (whoFirst === "pcFirst") {
            pcFirst();
            $("#pcChsSnd")[0].play();
        }

        //对当前"走了第几步", "电脑棋手和人的棋子分别在哪几个位置", "棋盘剩余哪些位置", 是否有坑, 以及"避坑位置"都做一个记录, 方便找BUG和代码优化
        console.trace("step = " + step + " pcNum = " + pcNum + " currentMyArr= " + currentMyArr + " currentPcArr= " + currentPcArr + " leftArr = " + leftArr + " isPcAv = " + isPcAv + " pcAvArr = " + pcAvArr + " lstWinArr= " + lstWinArr + " resultArr= " + resultArr);
    }
});
