var videoUrl = "http://o8lfqzxlh.bkt.clouddn.com/1.mp4",
    asq = "img/1.mp4",
    posterUrl = "";
    opt = {
        volume : 0.7
    };

var canvas = new BulletPlayer("#mainBlock");
canvas.setVideo(videoUrl,posterUrl,opt);

var danmuku = {
    position : "scroll",
    color : "#A5DEE4",
    content : "ギリギリ愛 キリキリ舞",
    scrollY : 0,
    topY : 0,
    bottomY : 0
};


var video = document.querySelector("#BPlayer-video");

function allPrpos(obj) {  
    // 用来保存所有的属性名称和值  
    var props = [];  
    // 开始遍历  
    for(var p in obj){  
      if(typeof(obj[p]) !=="function"){  
      props.push(obj[p]);  
      }  
     }  
    // 最后显示所有的属性  
    return props;  
} 

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
                        var danmukus = allPrpos(danmukuList[time]);
                        danmukus.forEach(function (item) {
                            canvas.loadDanmuku(item);
                        }); 
                    }
                },100);
            });
            video.addEventListener("pause",function () {
                clearInterval(counter); 
            });
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});