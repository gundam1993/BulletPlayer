var videoUrl = "http://o8lfqzxlh.bkt.clouddn.com/1.mp4",
    asq = "img/1.mp4",
    posterUrl = "";
    opt = {
        volume : 0.7
    };


var ab = new BulletPlayer("#mainBlock");
ab.setVideo(videoUrl,posterUrl,opt);

var danmuku = {
    position : "scroll",
    color : "#A5DEE4",
    content : "ギリギリ愛 キリキリ舞",
    scrollY : 0,
    topY : 0,
    bottomY : 0
};


var video = document.querySelector("#BPlayer-video");

/*
video.addEventListener('play',function () {
        setInterval(function () {
            ab.addDanmukuTop(danmuku);
            ab.addDanmukuScroll(danmuku);
            ab.addDanmukuScroll(danmuku);
            ab.addDanmukuScroll(danmuku);
            ab.addDanmukuScroll(danmuku);
            ab.addDanmukuScroll(danmuku);
            ab.addDanmukuBottom(danmuku);
        },300);
});*/
