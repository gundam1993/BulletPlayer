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
/*
var xhr = new XMLHttpRequest(),
    danmukuList;
xhr.open("get","danmuku.json",true);
xhr.send();

var counter;

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            danmukuList = JSON.parse(xhr.responseText);
            var video = document.querySelector("#BPlayer-video"),
            time,
            counter,
            danmuku;
            video.addEventListener("play",function () {
                counter = setInterval(function () {
                    time = video.currentTime.toFixed(1) * 10;
                    if (danmukuList[time]) {
                        for (var i = 0,len = danmukuList[time].length; i < len; i++) {
                            danmuku = danmukuList[time][i];
                            ab.addDanmuku(danmuku);
                        }
                    }
                },100);
            });
            video.addEventListener("pause",function () {
                clearInterval(counter); 
            });
        }
    }
};
*/

var ref = new Wilddog("https://bulletplayer.wilddogio.com/"),
    danmukuList;

ref.once("value", function(snapshot) {
    danmukuList = snapshot.val();
    console.log(danmukuList);
    var video = document.querySelector("#BPlayer-video"),
            time,
            counter,
            danmuku;
            video.addEventListener("play",function () {
                counter = setInterval(function () {
                    time = video.currentTime.toFixed(1) * 10;
                    if (danmukuList[time]) {
                        var danmukus = allPrpos(danmukuList[time]);
                        console.log(danmukus);
                        danmukus.forEach(function (item) {
                            ab.addDanmuku(item);
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