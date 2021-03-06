(function (window) {

    // 由于是第三方库，我们使用严格模式，尽可能发现潜在问题
    'use strict';



    function BulletPlayer(id) {
        this.containerSelector = id;
        this.container = document.querySelector(this.containerSelector);
        this.danmukuList = [];
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

    function Danmuku(opt) {
        this.position = opt.position ||"scroll";
        this.color = opt.color || "#FFF";
        this.content= opt.content || "";
        this.cvs= _preload(opt);
        this.timer = 0;
    }

    var _danmuku = {
        position : "scroll",
        color : "#FFF",
        scrollY : 0,
        topY : 0,
        bottomY :0
    };

    var _animations;

    
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

    function _refreshCanvasSize() {
        var danmukuArea = document.querySelector("#BPlayer-danmukuArea");
        setTimeout(function () {
                danmukuArea.width = danmukuArea.offsetWidth;
                danmukuArea.height = danmukuArea.offsetHeight;
            },100);
    }

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

    function _preload(opt) {
        var cvs = document.createElement('canvas'),
            ctx = cvs.getContext("2d");

        ctx.font="23px Arial bold";
        cvs.width = ctx.measureText(opt.content).width;
        cvs.height = 26;
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#fff";
        ctx.fillStyle = opt.color;
        ctx.font="23px Arial bold";
        ctx.fillText(opt.content, 0, 0);
        return cvs;

    }

    function _setPositons(danmuku) {
        var danmukuArea = document.querySelector("#BPlayer-danmukuArea");
        if (danmuku.position === "scroll") {
            danmuku.positionY = _danmuku.scrollY;
            danmuku.positionX = danmukuArea.width;
            if (_danmuku.scrollY < (danmukuArea.height - danmuku.cvs.height)) {
                    _danmuku.scrollY += danmuku.cvs.height;
            }else{
                _danmuku.scrollY = 0;
            }
        }else if (danmuku.position === "top") {
            danmuku.positionX = (danmukuArea.width - danmuku.cvs.width) / 2;
            danmuku.positionY = _danmuku.topY;
            if (_danmuku.topY < (danmukuArea.height - danmuku.cvs.height)) {
                    _danmuku.topY += danmuku.cvs.height;
            }else{
                _danmuku.topY = 0;
            }
        }else{
            danmuku.positionY = danmukuArea.height -  _danmuku.bottomY - danmuku.cvs.height;
            danmuku.positionX = (danmukuArea.width - danmuku.cvs.width) / 2;
            if (_danmuku.bottomY < (danmukuArea.height - 2 * danmuku.cvs.height)) {
                    _danmuku.bottomY += danmuku.cvs.height;
            }else{
                _danmuku.bottomY = 0;
            }
        }
    }
    /************* 以下是本库提供的公有方法 *************/
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
        this.danmukuControl();
    };
    
    BulletPlayer.prototype.addVideo = function(videoUrl,posterUrl) {
        if (document.querySelector("#BPlayer")) {
            document.querySelector("#BPlayer").remove();
        }

        var video = document.createElement("VIDEO"),
            player = document.createElement("div");

        player.id = "BPlayer";
        video.id = "BPlayer-video";
        var danmukuArea = "<canvas id='BPlayer-danmukuArea' style='opacity: 0.75;'></canvas>";

        //video.poster = posterUrl;
        video.innerHTML = "<source src='" + videoUrl + "'>";
        video.style.height = this.container.offsetHeigh + "px";

        player.appendChild(video);
        player.innerHTML += danmukuArea;
        this.container.appendChild(player);

        danmukuArea = document.querySelector("#BPlayer-danmukuArea");

        video.addEventListener("canplay",function () {
            danmukuArea.width = danmukuArea.offsetWidth;
            danmukuArea.height = video.videoHeight / video.videoWidth * danmukuArea.offsetWidth;
        });
    };

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

        fullscreenBtn.onclick = function () {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (!fullscreenElement) {
                _launchFullscreen(player);
            }else{
                _exitFullscreen();
            }
        };

        //全屏时刷新弹幕canvas大小
        document.addEventListener("fullscreenchange", _refreshCanvasSize);
        document.addEventListener("webkitfullscreenchange", _refreshCanvasSize);
        document.addEventListener("mozfullscreenchange", _refreshCanvasSize);

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
            danmukuArea = document.querySelector("#BPlayer-danmukuArea"),
            timeout;

        /**
         * 获取视频时长，添加到时间栏,设置弹幕canvas大小
         */
        video.addEventListener("canplaythrough",function () {
            var timelength = document.querySelector("#BPlayer-timer-length");
            timelength.innerHTML = _secondToTime(video.duration);
            danmukuArea.width = player.offsetWidth;
            danmukuArea.height = player.offsetHeight;
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

        function controlerHide() {
            clearTimeout(timeout);
            controler.className = "BPlayer-controler-hide";
        }

        function controlerShow() {
            clearTimeout(timeout);
            controler.className = "";
        }

        function controlerShowThenHide() {
            clearTimeout(timeout); 
            controlerShow();
            timeout = setTimeout(controlerHide,4000);
        }

        video.addEventListener("playing", function () {
            setTimeout(controlerHide,4000);

            player.addEventListener("mousemove", controlerShowThenHide);

            player.addEventListener("mouseout", controlerHide);
        });

        video.addEventListener("pause", function () {
            controlerShow();
            player.removeEventListener("mouseout", controlerHide);
        });

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

    BulletPlayer.prototype.addDanmukuControler = function() {
        var danmukuControler = document.createElement("div"),
            danmukuStyleBtn = document.createElement("div"),
            danmukuInput = document.createElement("input"),
            danmukuShooter = document.createElement("div"),
            danmukuStyleMenu = _buildDanmukuStyleMenu(),
            player = document.querySelector("#BPlayer");


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
        player.appendChild(danmukuControler);

        var danmukuOpacityChosen = document.querySelector("#BPlayer-danmuku-opacity-chosen"),
            danmukuOpacity = document.querySelector("#BPlayer-danmuku-opacity"),
            danmukuOpacityThumb = document.querySelector("#BPlayer-danmuku-opacity-thumb");

        function opacityMove() {
            var positionX = event.clientX - 300- player.offsetLeft;
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

    BulletPlayer.prototype.shootDanmuku = function(opt) {
        var video = document.querySelector("#BPlayer-video"),
            canvas = document.querySelector("#BPlayer-danmukuArea"),
            danmukuInput = document.querySelector("#BPlayer-danmuku-input"),
            time = video.currentTime.toFixed(1) * 10,
            timeref = ref.child(time);
        if (danmukuInput.value !== "") {
            opt.content = danmukuInput.value;
            var danmuku = new Danmuku(opt);
            danmukuInput.value = "";
            _setPositons(danmuku);
            danmuku.speed = (canvas.width + danmuku.cvs.width) / 420;
            danmuku.timer = 0;
            this.danmukuList.push(danmuku);
            timeref.push({
                content : opt.content,
                position : opt.position,
                color : opt.color
            });
        }
    };

    BulletPlayer.prototype.loadDanmuku = function(opt) {
        var canvas = document.querySelector("#BPlayer-danmukuArea");
            var danmuku = new Danmuku(opt);
            _setPositons(danmuku);
            danmuku.speed = (canvas.width + danmuku.cvs.width) / 420;
            danmuku.timer = 0;
            this.danmukuList.push(danmuku);
    };

    BulletPlayer.prototype.drawDanmuku = function() {
        var canvas = document.querySelector("#BPlayer-danmukuArea"),
            ctx = canvas.getContext("2d");
            ctx.clearRect(0,0,canvas.width,canvas.height);
        for (var i = 0; i < this.danmukuList.length; i++) {
            ctx.drawImage(this.danmukuList[i].cvs,this.danmukuList[i].positionX,this.danmukuList[i].positionY,this.danmukuList[i].cvs.width,this.danmukuList[i].cvs.height);
            this.danmukuList[i].timer++;
            if (this.danmukuList[i].position === "scroll") {
                this.danmukuList[i].positionX-=this.danmukuList[i].speed;
            }
            
            if (this.danmukuList[i].timer > 420) {
                if (this.danmukuList[i].position === "scroll") {
                    if (_danmuku.scrollY > this.danmukuList[i].positionY) {
                        _danmuku.scrollY = this.danmukuList[i].positionY;
                    }
                }else if (this.danmukuList[i].position === "top") {
                    if (_danmuku.topY > this.danmukuList[i].positionY) {
                        _danmuku.topY = this.danmukuList[i].positionY;
                    }
                }else{
                    if (_danmuku.bottomY > this.danmukuList[i].positionY) {
                        _danmuku.bottomY = this.danmukuList[i].positionY;
                    }
                }
                this.danmukuList.splice(i,1);
                i--;
            }
        }

        _animations = requestAnimationFrame(this.drawDanmuku.bind(this));
    };
    
    BulletPlayer.prototype.danmukuControl = function() {
        var video = document.querySelector("#BPlayer-video");
        video.addEventListener("pause",function () {
            window.cancelAnimationFrame(_animations);
        });

        video.addEventListener("play",function () {
            _animations = requestAnimationFrame(this.drawDanmuku.bind(this));
        }.bind(this));
    };

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