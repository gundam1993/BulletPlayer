var videoUrl = "http://o8lfqzxlh.bkt.clouddn.com/1.mp4",
    posterUrl = "";
    opt = {
        volume : 0.7
    };

var canvas = new BulletPlayer("#mainBlock");
canvas.setVideo(videoUrl,posterUrl,opt);

var video = document.querySelector("#BPlayer-video");

//载入后端弹幕
var ref = new Wilddog("https://bulletplayer.wilddogio.com/"),
    danmukuList;

ref.once("value", function(snapshot) {
    danmukuList = snapshot.val();
    var video = document.querySelector("#BPlayer-video"),
            time,
            counter,
            danmuku;
            video.addEventListener("play",function () {
                counter = setInterval(function () {
                    time = video.currentTime.toFixed(1) * 10;
                    if (danmukuList[time]) {
                        for (danmuku in danmukuList[time]) {
                            canvas.loadDanmuku(danmukuList[time][danmuku]);
                        }
                    }
                },100);
            });
            video.addEventListener("pause",function () {
                clearInterval(counter); 
            });
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});