class BulletPlayer {
  constructor(id) {
    this.containerSelector = id;
    this.container = document.querySelector(this.containerSelector);
    var _options = {
        width : "",
        height : "",
        fullscreenState : "",
        bulletState : "",
        video : "",
        volume : ""
      },
    _danmuku = {
        position : "scroll",
        color : "#FFF",
        content : "",
        scrollY : 0,
        topY : 0,
        bottomY : 0
      },
    _shoot;
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
        var danmukuItem = document.createElement('div');
        danmukuItem.className = "BPlayer-danmuku-items";
        danmukuItem.innerHTML = opt.content;
        danmukuItem.style.color = opt.color;
        danmukuItem.height = 26;

        return danmukuItem;
    }
  }

  setVideo(videoUrl,posterUrl,opt) {
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
    }


}
module.exports = BulletPlayer;