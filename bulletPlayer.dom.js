(function (window) {

    // 由于是第三方库，我们使用严格模式，尽可能发现潜在问题
    'use strict';


    /**
     * 构造函数
     */
    function BulletPlayer(id) {
        this.containerSelector = id;
        this.container = document.querySelector(this.containerSelector);
    }

    // 私有变量和私有方法
    var _options = {
        width : "",
        height : "",
        fullscreenState : "",
        bulletState : "",
        video : "",
        volume : ""
    };

    /**
     * 临时储存当前弹幕的样式
     */
    var _danmuku = {
        position : "scroll",
        color : "#FFF",
        content : "",
        scrollY : 0,
        topY : 0,
        bottomY : 0
    };
    
    /**
     * 启用全屏
     */
    function _launchFullscreen(element) {
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.msRequestFullscreen){ 
            element.msRequestFullscreen();  
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen();
        }}

    /**
     * 退出全屏
     */
    function _exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }}

    /**
     * 构筑音频控制条
     */
    function _buildVolumeControler() {
        var volumeControler = document.createElement("div"),
            volumeBtn = document.createElement("div"),
            volumeBarContainer = document.createElement("div"),
            volumeBar = document.createElement("div");

        volumeControler.id = "BPlayer-volumeControler";
        volumeBtn.id = "BPlayer-volumeBtn";
        volumeBarContainer.id = "BPlayer-volumeBar-container";
        volumeBar.id = "BPlayer-volumeBar";
        volumeBtn.className  = "BPlayer-Btn";

        volumeBtn.innerHTML = "<i class='iconfont icon-volumeup' id='BPlayer-volumeMark'></i>";
        volumeBar.innerHTML = "<div id='BPlayer-volumeBar-inner'>\
                                    <span id='BPlayer-volume-thumb' class='BPlayer-thumb'></span>\
                                <div>";
        
        volumeBarContainer.appendChild(volumeBar);
        volumeControler.appendChild(volumeBtn);
        volumeControler.appendChild(volumeBarContainer);

        return volumeControler;
    }

    /**
     * 构筑播放进度控制条
     */
    function _buildPlayBar() {
        var playBarContainer = document.createElement("div"),
            playBar = document.createElement("div"),
            playBarLoaded = document.createElement("div"),
            playBarPlayed = document.createElement("div");

        playBarContainer.id = "BPlayer-playBar-container";
        playBar.id = "BPlayer-playBar";
        playBarLoaded.id = "BPlayer-playBar-loaded";
        playBarPlayed.id = "BPlayer-playBar-played";

        playBarPlayed.innerHTML = "<span id='BPlayer-play-thumb' class='BPlayer-thumb'></span>";

        playBar.appendChild(playBarLoaded);
        playBar.appendChild(playBarPlayed);
        playBarContainer.appendChild(playBar);

        return playBarContainer;
    }

    /**
     * 构筑弹幕样式控制面板
     */
    function _buildDanmukuStyleMenu() {
        var danmukuStyleMenu = document.createElement("div"),
            danmukuColorMenu = document.createElement("div"),
            danmukuPositionMenu = document.createElement("div"),
            danmukuOpacityMenu = document.createElement("div"),
            colors = ["#FFF","#000","#CB1B45","#A5DEE4","#F05E1C","#86C166","#FFC408","#8F77B5"];


        danmukuStyleMenu.id = "BPlayer-danmuku-styleMenu";
        danmukuColorMenu.id = "BPlayer-danmuku-ColorMenu";
        danmukuPositionMenu.id = "BPlayer-danmuku-PositionMenu";
        danmukuOpacityMenu.id = "BPlayer-danmuku-OpacityMenu";

        danmukuPositionMenu.innerHTML = "<span>弹幕模式</span>\
                                        <label>\
                                            <input type='radio' value='top' name='BPlayer-danmuku-Position' class='hidden-input BPlayer-danmuku-Position' />\
                                            <span>顶端</span>\
                                        </label>\
                                        <label>\
                                            <input type='radio' value='scroll' name='BPlayer-danmuku-Position' checked class='hidden-input BPlayer-danmuku-Position' />\
                                            <span>滚动</span>\
                                        </label>\
                                        <label>\
                                            <input type='radio' value='bottom' name='BPlayer-danmuku-Position' class='hidden-input BPlayer-danmuku-Position' />\
                                            <span>底端</span>\
                                        </label>";
        danmukuColorMenu.innerHTML = "<span>弹幕颜色</span>";
        danmukuColorMenu.innerHTML +=  "<label>\
                                                <input type='radio' value=" + colors[0] + " name='BPlayer-danmuku-Color' class='hidden-input BPlayer-danmuku-Color' checked/>\
                                                <span style='background-color:" + colors[0] + "' ></span>\
                                            </label>";
        for (var i = 0,len=colors.length-1; i < len; i++) {
            danmukuColorMenu.innerHTML +=  "<label>\
                                                <input type='radio' value=" + colors[i + 1] + " name='BPlayer-danmuku-Color' class='hidden-input BPlayer-danmuku-Color'/>\
                                                <span style='background-color:" + colors[i + 1] + "' ></span>\
                                            </label>";
        }

        danmukuOpacityMenu.innerHTML = "<span>弹幕透明度</span>\
                                        <div id='BPlayer-danmuku-opacity'>\
                                            <div id='BPlayer-danmuku-opacity-chosen'>\
                                                <span id='BPlayer-danmuku-opacity-thumb' class='BPlayer-thumb'></span>\
                                            </div>\
                                        </div>";

        danmukuStyleMenu.appendChild(danmukuPositionMenu);
        danmukuStyleMenu.appendChild(danmukuColorMenu);
        danmukuStyleMenu.appendChild(danmukuOpacityMenu);
        return danmukuStyleMenu;
    }

    /**
     * 将秒转化为mm:ss的样式
     * @param  {int} second 秒数
     * @return {str}        mm:ss格式的字符串
     */
    function _secondToTime(second) {
        var minute = parseInt(second / 60);
        second = parseInt(second - minute * 60);
        function add0(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num;
        }
        return add0(minute) + ":" + add0(second);
    }

    /**
     * 播放状态改变时改变播放按钮图标
     */
    function _playStateChange() {
        var btnMark = document.querySelector("#BPlayer-playMark"),
            video = document.querySelector("#BPlayer-video");
            if (video.paused) {
                video.play();
                btnMark.className = 'iconfont icon-pause';
            }else{
                video.pause();
                btnMark.className = 'iconfont icon-playarrow'; 
            }
    }

    /**
     * 预渲染弹幕元素
     */
    function _preload(opt) {
        var danmukuItem = document.createElement('div');
        danmukuItem.className = "BPlayer-danmuku-items";
        danmukuItem.innerHTML = opt.content;
        danmukuItem.style.color = opt.color;
        danmukuItem.height = 26;

        return danmukuItem;
    }
    /************* 以下是本库提供的公有方法 *************/
    /**
     * 初始化，设置视频来源
     * @param {str} videoUrl  视频地址
     * @param {str} posterUrl 视频封面地址
     * @param {obj} opt       初始参数
     */
    BulletPlayer.prototype.setVideo = function(videoUrl,posterUrl,opt) {
        this.container.style.height = "";

        var _opt = opt || {};
        _options.fullscreenState = false;
        _options.bulletState = _opt.bulletState || true;
        _options.volume = _opt.volume || 0.5;
        _options.video = videoUrl;
        _options.poster = posterUrl;

        this.addVideo(videoUrl,posterUrl);
        this.addControler();
        this.initPlayState();
        this.initVolumeState();
        this.addDanmukuControler();
        this.keyBoardEvent();
    };
    
    /**
     * 向目标元素中插入视频和弹幕层
     * @param {str} videoUrl  视频地址
     * @param {str} posterUrl 视频封面地址
     */
    BulletPlayer.prototype.addVideo = function(videoUrl,posterUrl) {
        if (document.querySelector("#BPlayer")) {
            document.querySelector("#BPlayer").remove();
        }

        var video = document.createElement("VIDEO"),
            danmukuArea = document.createElement("div"),
            player = document.createElement("div");

        player.id = "BPlayer";
        video.id = "BPlayer-video";
        danmukuArea.id = "BPlayer-danmukuArea";

        video.poster = posterUrl;
        video.innerHTML = "<source src='" + videoUrl + "'>";
        video.style.height = this.container.offsetHeigh + "px";

        player.appendChild(video);
        player.appendChild(danmukuArea);
        this.container.appendChild(player);

    };

    /**
     * 构筑播放器控制条，并绑定相关事件
     */
    BulletPlayer.prototype.addControler = function() {
        var controler = document.createElement("div"),
            playBtn = document.createElement("div"),
            fullscreenBtn = document.createElement("div"),
            timer = document.createElement("div"),
            loop = document.createElement("div"),
            volumeControler = _buildVolumeControler(),
            playBar = _buildPlayBar(),
            danmukuBtn = document.createElement("div"),
            player = document.querySelector("#BPlayer");

        controler.id = "BPlayer-controler";
        playBtn.id = "BPlayer-playBtn";
        fullscreenBtn.id = "BPlayer-fullscreenBtn";
        timer.id = "BPlayer-timer";
        loop.id = "BPlayer-loopBtn";
        danmukuBtn.id = "BPlayer-danmukuBtn";
        playBtn.className  = "BPlayer-Btn";
        fullscreenBtn.className  = "BPlayer-Btn";
        loop.className = "BPlayer-Btn";
        danmukuBtn.className = "BPlayer-Btn";

        playBtn.innerHTML = "<i class='iconfont icon-playarrow' id='BPlayer-playMark'></i>";
        fullscreenBtn.innerHTML = "<i class='iconfont icon-fullscreen' id='BPlayer-fullscreenMark'></i>";
        loop.innerHTML = "<i class='iconfont icon-loop' id='BPlayer-loopMark'></i>";
        danmukuBtn.innerHTML = "<i class='iconfont icon-icon' id='BPlayer-loopMark'></i>";
        timer.innerHTML = "<span id='BPlayer-timer-played'>00:00</span>/<span id='BPlayer-timer-length'>00:00</span>";    
        //全屏按钮按下时切换全屏状态
        fullscreenBtn.onclick = function () {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (!fullscreenElement) {
                _launchFullscreen(player);
            }else{
                _exitFullscreen();
            }
        };
        //切换弹幕面板显示状态
        danmukuBtn.onclick = function () {
            var danmukuControler = document.querySelector("#BPlayer-danmuku-controler"),
                danmukuStyleMenu = document.querySelector("#BPlayer-danmuku-styleMenu"),
                danmukuInput = document.querySelector("#BPlayer-danmuku-input");
            if (document.querySelector(".BPlayer-danmuku-controler-hide")) {
                danmukuControler.className = "BPlayer-danmuku-controler-show";
                setTimeout(function () {
                    danmukuInput.focus();  
                },300);
            } else{
                danmukuInput.blur();
                danmukuControler.className = "BPlayer-danmuku-controler-hide";
                if (danmukuStyleMenu.className === "BPlayer-danmuku-styleMenu-show") {
                    danmukuStyleMenu.className = "BPlayer-danmuku-styleMenu-hide";
                }
            }
        };
        
        controler.appendChild(playBtn);
        controler.appendChild(volumeControler);
        controler.appendChild(timer);
        controler.appendChild(fullscreenBtn);
        controler.appendChild(loop);
        controler.appendChild(danmukuBtn);
        controler.appendChild(playBar);
        player.appendChild(controler);
    };

    /**
     * 初始化播放状态
     */
    BulletPlayer.prototype.initPlayState = function() {
        var video = document.querySelector("#BPlayer-video"),
            playBtn = document.querySelector("#BPlayer-playBtn"),
            timerPlayed = document.querySelector("#BPlayer-timer-played"),
            playBar = document.querySelector("#BPlayer-playBar"),
            playBarLoaded = document.querySelector("#BPlayer-playBar-loaded"),
            playBarPlayed = document.querySelector("#BPlayer-playBar-played"),
            playThumb = document.querySelector("#BPlayer-play-thumb"),
            controler = document.querySelector("#BPlayer-controler"),
            loopBtn = document.querySelector("#BPlayer-loopBtn"),
            player = document.querySelector("#BPlayer"),
            timeout;

        /**
         * 获取视频时长，添加到时间栏
         */
        video.addEventListener("canplaythrough",function () {
            var timelength = document.querySelector("#BPlayer-timer-length");
            timelength.innerHTML = _secondToTime(video.duration);
        });

        /**
         * 缓冲
         */
        video.addEventListener("progress",function () {
            if (video.readyState === 4) {
                var buffered = video.buffered.end(0);
                playBarLoaded.style.width = (buffered / video.duration * 100) + "%";
            }
        });

        /**
         * 时间栏播放时间，进度条长度，拨钮位置更新
         */
        video.addEventListener("play",function () {
            setInterval(function () {
                timerPlayed.innerHTML = _secondToTime(video.currentTime);
                playBarPlayed.style.width = (video.currentTime / video.duration * 100) + "%";
                playThumb.style.left = playBarPlayed.offsetWidth - 4 + "px";
            },250);
        });

        /**
         * 播放状态切换
         */
        video.addEventListener("click",_playStateChange);
        playBtn.addEventListener("click",_playStateChange);

        function playBarMove() {
            var positionX = event.clientX - 20,
                fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            !fullscreenElement ? positionX = positionX - player.offsetLeft : positionX = positionX;
            if (positionX > playBar.offsetWidth) {
                positionX = playBar.offsetWidth;
            }
            playThumb.style.left = positionX + "px";
            playBarPlayed.style.width = positionX + "px";
            video.currentTime = video.duration * positionX / playBar.offsetWidth;
        }

        /**
         * 进度条拖动
         */
        playBar.addEventListener("click",playBarMove);
        playThumb.addEventListener("mousedown", function () {
            document.addEventListener('mousemove', playBarMove);
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', playBarMove);
            });
        });
        //隐藏控制条
        function controlerHide() {
            clearTimeout(timeout);
            controler.className = "BPlayer-controler-hide";
        }
        //显示控制条
        function controlerShow() {
            clearTimeout(timeout);
            controler.className = "";
        }
        //显示控制条，4秒后自动隐藏
        function controlerShowThenHide() {
            clearTimeout(timeout); 
            controlerShow();
            timeout = setTimeout(controlerHide,4000);
        }
        //设置开始播放后的控制条状态
        video.addEventListener("playing", function () {
            setTimeout(controlerHide,4000);

            player.addEventListener("mousemove", controlerShowThenHide);

            player.addEventListener("mouseout", controlerHide);
        });
        //设置暂停播放后的控制条状态
        video.addEventListener("pause", function () {
            controlerShow();
            player.removeEventListener("mouseout", controlerHide);
        });
        //设置循环播放状态
        loopBtn.addEventListener("click", function () {
            if (video.loop) {
                video.loop = false;
                loopBtn.style.color = "#BBB";
            }else{
                video.loop = "loop";
                loopBtn.style.color = "#AB3B3A";
            }
        });
    };

    /**
     * 设置播放器音量
     */
    BulletPlayer.prototype.initVolumeState = function() {
        var video = document.querySelector("#BPlayer-video"),
            controler = document.querySelector("#BPlayer-controler"),
            player = document.querySelector("#BPlayer"),
            volumeBtn = document.querySelector("#BPlayer-volumeBtn"),
            volumeBar = document.querySelector("#BPlayer-volumeBar"),
            volumeBarInner = document.querySelector("#BPlayer-volumeBar-inner"),
            volumeThumb = document.querySelector("#BPlayer-volume-thumb");

        video.volume = _options.volume;
        volumeBarInner.style.width = _options.volume * 100 + "%";
        volumeThumb.style.left = "100%";

        volumeBtn.addEventListener("click",function () {
            if (video.volume !== 0) {
                video.volume = 0;
                volumeBarInner.style.width = "0%";
                volumeThumb.style.left = 0;
                volumeBtn.children[0].className = "iconfont icon-volumeoff";
            }else{
                video.volume = _options.volume;
                volumeBarInner.style.width = video.volume * 100 + "%";
                volumeThumb.style.left = volumeBar.offsetWidth * video.volume + "px";
                volumeBtn.children[0].className = "iconfont icon-volumeup";
            }
        });

        volumeBar.addEventListener("click",volumeBarMove);

        function volumeBarMove() {
            var positionX = event.clientX - 125,
                fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            !fullscreenElement ? positionX = positionX - player.offsetLeft : positionX = positionX;
            if (positionX > volumeBar.offsetWidth) {
                positionX = volumeBar.offsetWidth;
            }
            volumeThumb.style.left = positionX + "px";
            volumeBarInner.style.width = positionX / volumeBar.offsetWidth * 100 + "%";
            video.volume = positionX / volumeBar.offsetWidth;
            _options.volume = positionX / volumeBar.offsetWidth;
        }

        volumeThumb.addEventListener("mousedown", function () {
            controler.style.transform = "translateY(0%)";
            document.addEventListener('mousemove', volumeBarMove);
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', volumeBarMove);
            });
        });
    };

    /**
     * 构筑弹幕输入条
     */
    BulletPlayer.prototype.addDanmukuControler = function() {
        var danmukuControler = document.createElement("div"),
            danmukuStyleBtn = document.createElement("div"),
            danmukuInput = document.createElement("input"),
            danmukuShooter = document.createElement("div"),
            danmukuStyleMenu = _buildDanmukuStyleMenu(),
            bPlayer = document.querySelector("#BPlayer");

        danmukuControler.id = "BPlayer-danmuku-controler";
        danmukuStyleBtn.id = "BPlayer-danmuku-style";
        danmukuInput.id = "BPlayer-danmuku-input";
        danmukuShooter.id = "BPlayer-danmuku-shooter";
        danmukuControler.className = "BPlayer-danmuku-controler-hide";
        danmukuStyleMenu.className = "BPlayer-danmuku-styleMenu-hide";

        danmukuStyleBtn.innerHTML = "<i class='iconfont icon-settings' id='BPlayer-danmukuStyleMark'></i>";
        danmukuShooter.innerHTML = "<i class='iconfont icon-send' id='BPlayer-danmukuShooterMark'></i>";
        danmukuInput.type = "text";
        danmukuInput.placeholder = "输入弹幕，回车发送";

        danmukuControler.appendChild(danmukuStyleBtn);
        danmukuControler.appendChild(danmukuInput);
        danmukuControler.appendChild(danmukuShooter);
        danmukuControler.appendChild(danmukuStyleMenu);
        bPlayer.appendChild(danmukuControler);

        var danmukuOpacityChosen = document.querySelector("#BPlayer-danmuku-opacity-chosen"),
            danmukuOpacity = document.querySelector("#BPlayer-danmuku-opacity"),
            danmukuOpacityThumb = document.querySelector("#BPlayer-danmuku-opacity-thumb");

        function opacityMove() {
            var positionX = event.clientX - 300- bPlayer.offsetLeft;
            if (positionX > danmukuOpacity.offsetWidth) {
                positionX = danmukuOpacity.offsetWidth;
            }
            danmukuOpacityChosen.style.width = positionX + "px";
        }

        danmukuOpacity.addEventListener("click", opacityMove);

        danmukuOpacityThumb.addEventListener("mousedown", function () {
            document.addEventListener('mousemove', opacityMove);
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', opacityMove);
            });
        });

        danmukuStyleBtn.addEventListener("click",function () {
            if (danmukuStyleMenu.className === "BPlayer-danmuku-styleMenu-hide") {
                danmukuStyleMenu.className = "BPlayer-danmuku-styleMenu-show";
            }else{
                danmukuStyleMenu.className = "BPlayer-danmuku-styleMenu-hide";
            }
        });

        danmukuShooter.addEventListener("click",this.shootDanmuku.bind(this,_danmuku));

        this.setDanmukuStyle();
    };

    /**
     * 设置当前弹幕样式
     */
    BulletPlayer.prototype.setDanmukuStyle = function() {
        var danmukuPositionMenu = document.querySelector("#BPlayer-danmuku-PositionMenu"),
            danmukuColorMenu = document.querySelector("#BPlayer-danmuku-ColorMenu"),
            danmukuStyleBtn = document.querySelector("#BPlayer-danmuku-style"),
            danmukuOpacity = document.querySelector("#BPlayer-danmuku-opacity"),
            danmukuOpacityChosen = document.querySelector("#BPlayer-danmuku-opacity-chosen"),
            danmukuArea = document.querySelector("#BPlayer-danmukuArea");
            danmukuArea.style.opacity = (danmukuOpacityChosen.offsetWidth / danmukuOpacity.offsetWidth);
        danmukuPositionMenu.addEventListener("click",function () {
            if (event.target.value) {
                _danmuku.position = event.target.value;
            }
        });
        danmukuColorMenu.addEventListener("click",function () {
            if (event.target.value) {
                _danmuku.color = event.target.value;
                danmukuStyleBtn.style.color = event.target.value;
            }
        });
        danmukuOpacity.addEventListener("click",function () {
            danmukuArea.style.opacity = (danmukuOpacityChosen.offsetWidth / danmukuOpacity.offsetWidth);
        });      
    };

    /**
     * 输入弹幕并发射
     * @param  {obj} opt 弹幕样式
     * @return {obj}     弹幕样式
     */
    BulletPlayer.prototype.shootDanmuku = function(danmuku) {
        var video = document.querySelector("#BPlayer-video"),
            danmukuInput = document.querySelector("#BPlayer-danmuku-input");
        if (danmukuInput.value !== "") {
            danmuku.content = danmukuInput.value;
            danmukuInput.value = "";
            if (video.paused) {
                var switches=1;
                video.addEventListener("play",function (danmuku) {
                    if (switches === 1) {
                        this.addDanmuku(danmuku);
                        switches = 0;
                        return {
                                        content : danmuku.content,
                                        position : danmuku.position,
                                        color : danmuku.color
                                    };
                    }
                }.bind(this,danmuku));
            }else{
                this.addDanmuku(danmuku);
                return {
                    content : danmuku.content,
                    position : danmuku.position,
                    color : danmuku.color
                };
            }
        }
    };

    /**
     * 插入弹幕，根据样式调用相应的函数
     * @param {obj} danmukuOpt 弹幕样式
     */
    BulletPlayer.prototype.addDanmuku = function(danmuku) {
        if (danmuku.position == "scroll") {
            this.addDanmukuScroll(danmuku);
        }else if (danmuku.position == "top") {
            this.addDanmukuTop(danmuku);
        }else{
            this.addDanmukuBottom(danmuku); 
        }
    };

    /**
     * 添加滚动弹幕
     * @param {obj} danmukuOpt 弹幕样式
     */
    BulletPlayer.prototype.addDanmukuScroll = function(danmukuOpt) {
        var danmukuArea = document.querySelector("#BPlayer-danmukuArea"),
            video = document.querySelector("#BPlayer-video"),
            opt = {};


            opt.content = danmukuOpt.content;
            opt.color = danmukuOpt.color;
            opt.position = danmukuOpt.position;
            opt.scrollY = _danmuku.scrollY;
        
        var danmuku = _preload(opt),
            x = danmukuArea.offsetWidth,
            y = opt.scrollY,
            width,
            height = danmuku.height,
            step = x / 300,
            animations;

        danmukuArea.appendChild(danmuku);
        width = danmuku.offsetWidth;
        danmuku.style.top = y + "px";
        danmuku.style.left = x + "px";

        if (y < (danmukuArea.offsetHeight - height)) {
            _danmuku.scrollY += height;
        }else{
            _danmuku.scrollY = 0;
        }

        function stepScroll() {
            x -= step;
            danmuku.style.left = x + "px";
            if (x > -width) {
                animations = requestAnimationFrame(stepScroll);
            }else{
                window.cancelAnimationFrame(animations);
                if (y < _danmuku.scrollY) {
                    _danmuku.scrollY = y;
                }
                danmuku.remove();
            }
        }
        animations = requestAnimationFrame(stepScroll);

        video.addEventListener("pause",function () {
            window.cancelAnimationFrame(animations);
            danmuku.className = "BPlayer-danmuku-items BPlayer-danmuku-items-scroll BPlayer-danmuku-items-paused"; 
        });

        video.addEventListener("play",function () {
            animations = requestAnimationFrame(stepScroll);
            danmuku.className = "BPlayer-danmuku-items BPlayer-danmuku-items-scroll"; 
        });
    };

    /**
     * 添加顶部弹幕
     * @param {obj} danmukuOpt 弹幕样式
     */
    BulletPlayer.prototype.addDanmukuTop = function(danmukuOpt) {
        var danmukuArea = document.querySelector("#BPlayer-danmukuArea"),
            video = document.querySelector("#BPlayer-video"),
            opt = {};

            opt.content = danmukuOpt.content;
            opt.color = danmukuOpt.color;
            opt.position = danmukuOpt.position;
            opt.topY = _danmuku.topY;
        
        var danmuku = _preload(opt),
            width,
            height = danmuku.height,
            x,
            y = opt.topY,
            animations,
            count = 0;

        danmukuArea.appendChild(danmuku);
        width = danmuku.offsetWidth;
        x = (danmukuArea.offsetWidth - width) / 2;
        danmuku.style.left = x + "px";
        danmuku.style.top = y + "px";

        if (y < (danmukuArea.offsetHeight - height)) {
            _danmuku.topY += height;
        }else{
            _danmuku.topY = 0;
        }

        function stepTop() {
            if (count < 300) {
                count ++;
                animations = requestAnimationFrame(stepTop);
            }else{
                if (y < _danmuku.topY) {
                    _danmuku.topY = y;
                }
                window.cancelAnimationFrame(animations);
                danmuku.remove();
            }
        }
        animations = requestAnimationFrame(stepTop);

        video.addEventListener("pause",function () {
            window.cancelAnimationFrame(animations);
        });

        video.addEventListener("play",function () {
            animations = requestAnimationFrame(stepTop);
        });
    };

    /**
     * 添加底部弹幕
     * @param {obj} danmukuOpt 弹幕样式
     */
    BulletPlayer.prototype.addDanmukuBottom = function(danmukuOpt) {
         var danmukuArea = document.querySelector("#BPlayer-danmukuArea"),
            video = document.querySelector("#BPlayer-video"),
            opt = {};

            opt.content = danmukuOpt.content;
            opt.color = danmukuOpt.color;
            opt.position = danmukuOpt.position;
            opt.bottomY = _danmuku.bottomY;
        
        var danmuku = _preload(opt),
            width,
            height = danmuku.height,
            x,
            y = opt.bottomY,
            animations,
            count = 0;

        danmukuArea.appendChild(danmuku);
        width = danmuku.offsetWidth;
        x = (danmukuArea.offsetWidth - width) / 2;
        danmuku.style.left = x + "px";
        danmuku.style.bottom = y + "px";

        if (y < (danmukuArea.offsetHeight - height)) {
            _danmuku.bottomY += height;
        }else{
            _danmuku.bottomY = 0;
        }

        function stepBottom() {
            if (count < 300) {
                count ++;
                animations = requestAnimationFrame(stepBottom);
            }else{
                if (y < _danmuku.bottomY) {
                    _danmuku.bottomY = y;
                }
                window.cancelAnimationFrame(animations);
                danmuku.remove();
            }
        }
        animations = requestAnimationFrame(stepBottom);

        video.addEventListener("pause",function () {
            window.cancelAnimationFrame(animations);
        });

        video.addEventListener("play",function () {
            animations = requestAnimationFrame(stepTop);
        });
    };
    
    /**
     * 绑定键盘事件
     */
    BulletPlayer.prototype.keyBoardEvent = function() {
        var danmukuInput = document.querySelector("#BPlayer-danmuku-input");
        danmukuInput.addEventListener("keypress", function () {
            if (event.keyCode === 13) {
                this.shootDanmuku(_danmuku);
            }
        }.bind(this));

        document.addEventListener("keydown",function () {
            var video = document.querySelector("#BPlayer-video"),
                volumeBarInner = document.querySelector("#BPlayer-volumeBar-inner");
            switch (event.keyCode) {
                case 9 :
                    event.preventDefault();
                    break;
                case 39 :
                    video.currentTime += 10;
                    break;
                case 37 :
                    video.currentTime -= 10;
                    break;
                case 38 :
                    video.volume += 0.1;
                    volumeBarInner.style.width = video.volume * 100 + "%";
                    break;
                case 40 :
                    video.volume -= 0.1;
                    volumeBarInner.style.width = video.volume * 100 + "%";
                    break;
                case 32 :
                    _playStateChange();
                    break;
            }

        });
    };



    /************* 以上是本库提供的公有方法 *************/



    // 实例化
    if (typeof window.BulletPlayer === 'undefined') {
        // 只有当未初始化时才实例化
        window.BulletPlayer = function (id) {
            return new BulletPlayer(id);
        };
    }

}(window));