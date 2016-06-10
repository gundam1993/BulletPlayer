var s = "http://ws.acgvideo.com/c/d1/8004888-1.mp4?wsTime=1465575686&wsSecret2=ef295a8e6bd38bf5017d2704449b42bd&oi=2095617680&player=1&or=993353635",
    opt = {
        volume : 0.3
    };


var a = new BulletPlayer("#mainBlock");
a.setVideo(s,opt);