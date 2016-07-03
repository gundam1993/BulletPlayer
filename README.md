# Bullet Player

一个使用原生JS编写的HTML5弹幕播放器

[Demo](http://gundam1993.github.io/BulletPlayer/demo/)



## Usage 使用方法
1. 包含bulletPlayer.min.css和bulletPlayer.canvas.min.css（使用canvas元素实现弹幕）或bulletPlayer.min.css和bulletPlayer.dom.min.css(使用dom方法实现弹幕)
```html
<link rel="stylesheet" href="./css/bulletPlayer.min.css" />
<script src="./js/bulletPlayer.canvas.min.js"></script>
```
2. 定义一个div容器，并指定id。
```html
<div id="player"></div>
```
3. 使用div容器的id构造播放器对象,注意输入的ID需要使用CSS选择器写法。
```javascript
var obj = new BulletPlayer("#player");
```
4. 调用初始化函数初始化类库，并传入初始化参数。
```javascript
obj.setVideo("", "",{
        volume : 0.7
    };);
```
* 第一个参数为一个字符串，传入视频的地址。
* 第二个参数为一个字符串，传入视频封面图的地址。
* 第三个参数为一个对象，用于配置类库。

|配置项|说明|可选项|含义|默认值|
|:---:|:---:|:---:|:---:|:---:|
|volume|初始音量|0&gt;<br />Number<br />&lt;1|音量值|0.5|
|bulletState|是否启用弹幕|true<br />false|启用弹幕<br />禁止弹幕|true|

5. 关于后端
DEMO中使用了野狗®的云后台来实现弹幕储存，后端接口暂时没有完成

## Todo

- [ ] 后端接口

- [ ] 记录播放位置 记录透明度

- [ ] icon 动画

- [ ] 字体

- [ ] 高级弹幕

##License
[MIT](https://opensource.org/licenses/MIT)
