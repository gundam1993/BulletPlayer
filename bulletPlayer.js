(function (window) {

    // 由于是第三方库，我们使用严格模式，尽可能发现潜在问题
    'use strict';



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
        volumeBar.innerHTML = "<div id='BPlayer-volumeBar-inner'><span id='BPlayer-volume-thumb' class='BPlayer-thumb'></span><div>";
        
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

    function _secondToTime(second) {
        var minute = parseInt(second / 60),
        time = "";
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
    };
    
    BulletPlayer.prototype.addVideo = function(videoUrl,posterUrl) {
        if (document.querySelector("#BPlayer")) {
            document.querySelector("#BPlayer").remove();
        }

        var video = document.createElement("VIDEO"),
            videoArea = document.createElement("div"),
            player = document.createElement("div");
        player.id = "BPlayer";
        video.id = "BPlayer-video";
        video.poster = posterUrl;
        video.innerHTML = "<source src='" + videoUrl + "'>";
        video.style.height = this.container.offsetHeigh + "px";
        player.appendChild(video);
        this.container.appendChild(player);
    };

    BulletPlayer.prototype.addControler = function() {
        var controler = document.createElement("div"),
            playBtn = document.createElement("div"),
            fullscreenBtn = document.createElement("div"),
            timer = document.createElement("div"),
            loop = document.createElement("div"),
            volumeControler = _buildVolumeControler(),
            playBar = _buildPlayBar(),
            player = document.querySelector("#BPlayer"),
            video = document.querySelector("#BPlayer-video");

        controler.id = "BPlayer-controler";
        playBtn.id = "BPlayer-playBtn";
        fullscreenBtn.id = "BPlayer-fullscreenBtn";
        timer.id = "BPlayer-timer";
        loop.id = "BPlayer-loopBtn";
        playBtn.className  = "BPlayer-Btn";
        fullscreenBtn.className  = "BPlayer-Btn";
        loop.className = "BPlayer-Btn";

        playBtn.innerHTML = "<i class='iconfont icon-playarrow' id='BPlayer-playMark'></i>";
        fullscreenBtn.innerHTML = "<i class='iconfont icon-fullscreen' id='BPlayer-fullscreenMark'></i>";
        loop.innerHTML = "<i class='iconfont icon-loop' id='BPlayer-loopMark'></i>";
        timer.innerHTML = "<span id='BPlayer-timer-played'>00:00</span>/<span id='BPlayer-timer-length'>00:00</span>";    

        fullscreenBtn.onclick = function () {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement,
                fullscreenMark = document.querySelector("#BPlayer-fullscreenMark");
            if (!fullscreenElement) {
                _launchFullscreen(player);
                fullscreenMark.className = "iconfont icon-fullscreenexit";
            }else{
                _exitFullscreen();
                fullscreenMark.className = "iconfont icon-fullscreen";
            }
        };
        
        controler.appendChild(playBtn);
        controler.appendChild(volumeControler);
        controler.appendChild(timer);
        controler.appendChild(fullscreenBtn);
        controler.appendChild(loop);
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
            timeout;

        /**
         * 获取视频时长，添加到时间栏
         */
        video.addEventListener("canplaythrough",function () {
            var timelength = document.querySelector("#BPlayer-timer-length");
            timelength.innerHTML = _secondToTime(video.duration);
        });

        video.addEventListener("progress",function () {
            var buffered = video.buffered.end(0);
            console.log(buffered / video.duration * 100);
            playBarLoaded.style.width = (buffered / video.duration * 100) + "%";
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
                video.loop = true;
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
    
    /************* 以上是本库提供的公有方法 *************/



    // 实例化
    if (typeof window.BulletPlayer === 'undefined') {
        // 只有当未初始化时才实例化
        window.BulletPlayer = function (id) {
            return new BulletPlayer(id);
        };
    }

}(window));