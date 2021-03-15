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

### APK在线升级插件

```Bash
cordova plugin add cordova-plugin-app-version@0.1.9
npm install --save @ionic-native/app-version@4.0.0

cordova plugin add cordova-plugin-file
npm install --save @ionic-native/file@4.1.0

cordova plugin add cordova-plugin-file-opener2@2.2.0
npm install --save @ionic-native/file-opener@4.20.0

cordova plugin add cordova-plugin-file-transfer@1.7.1
npm install --save @ionic-native/transfer@4
(或者:ionic cordova plugin add cordova-plugin-file-transfer
 npm install @ionic-native/file-transfer )

```

### 调试常见问题

下载安装依赖包时安装不了，提示错误如下：

error An unexpected error occurred: "EPERM: operation not permitted, folder 'D:\\work\\sgmwLes\\node_modules\\@****************'".

可以试试清理缓存
两种清除缓存的方法

```Bash
npm cache clean -f  和 yarn cache clean
```

#冲压功能模板

## bundle
