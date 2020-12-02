# HX SgmwLes PDA🎮

## How to start
```Bash
ionic cordova platform add android              // 添加Android Platform （iOS:ionic platform add ios）
ionic build android                             // build项目 (iOS:ionic build ios)  
ionic emulate android                           // 用模拟器运行 (iOS:ionic emulate ios)  
ionic cordova run android -lc                              // 用Android真机运行（与模拟器二选一就好啦~~）
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
