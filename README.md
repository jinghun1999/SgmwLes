# HX SgmwLes PDA🎮😊
## 上汽通用五菱河西基地物流项目PDA前端源码库
本工程采用Ionic 3脚手架和控件库开发，内容包含河西基地物流项目pda操作功能。
如需要参与开发，请先clone代码，具体命令详情请参考
[Ionic3命令集合](https://ionicframework.com/docs/v3/cli/commands.html)
## How to start
```Bash
ionic cordova platform add android              // 添加Android Platform （iOS:ionic platform add ios）
ionic build android                             // build项目 (iOS:ionic build ios)  
ionic emulate android                           // 用模拟器运行 (iOS:ionic emulate ios)  
ionic cordova run android -lc                   // 用Android真机运行（与模拟器二选一就好啦~~）
```
查看已经添加的插件：
```Bash
cordova plugin ls
cordova plugin add <要添加的插件>
```
### Package APK
```Bash
ionic cordova build android --release
```
### Apk签名

```Bash
jarsigner -verbose -keystore sgmwles.keystore -signedjar D:\Work\GitHub\SgmwLes\platforms\android\app\build\outputs\apk\release\smgwles.release.apk D:\Work\GitHub\SgmwLes\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk sgmwles.keystore
```

### DEV Preview
```Bash
ionic serve
```
### Publish Prod Web
```Bash
ionic build --prod -- --base-href=/lesapp/
```
