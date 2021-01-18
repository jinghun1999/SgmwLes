///<reference path="../components/components.module.ts"/>
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
// import {AppUpdate} from "@ionic-native/app-update/ngx";
 import { AppVersion } from '@ionic-native/app-version/ngx';
// import { NativeAudio } from '@ionic-native/native-audio/ngx';
// import { Vibration } from '@ionic-native/vibration/ngx';
import { Menus } from '../mocks/menus';
import { Settings, User, Api, InterceptorService } from '../providers';
import { MyApp } from './app.component';
import { SuspiciousProvider } from '../providers/suspicious';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}

@NgModule({
  // declarations: 数组类型的选项, 用来声明属于这个模块的指令,管道等等.
  //               然后我们就可以在这个模块中使用它们了.
  declarations: [
    MyApp,
  ],
  // imports: 数组类型的选项,我们的模块需要依赖的一些其他的模块,这样做的目的使我们这个模块
  //          可以直接使用别的模块提供的一些指令,组件等等.
  // exports: 数组类型的选项,我们这个模块需要导出的一些组件,指令,模块等;
  //          如果别的模块导入了我们这个模块,
  //          那么别的模块就可以直接使用我们在这里导出的组件,指令模块等.
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  // bootstrap: 数组类型选项, 指定了这个模块启动的时候应该启动的组件.当然这些组件会被自动的加入到entryComponents中去
  bootstrap: [IonicApp],
  // entryComponents: 数组类型的选项,指定一系列的组件,这些组件将会在这个模块定义的时候进行编译
  //                  Angular会为每一个组件创建一个ComponentFactory然后把它存储在ComponentFactoryResolver
  entryComponents: [
    MyApp
  ],
  // providers: 这个选项是一个数组,需要我们列出我们这个模块的一些需要共用的服务
  //            然后我们就可以在这个模块的各个组件中通过依赖注入使用了.
  providers: [
    Api,
    Menus,
    User,
    Camera,
    SplashScreen,
    StatusBar,
    // AppUpdate,
     AppVersion,
    // NativeAudio,
    // Vibration,
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    InterceptorService,
    SuspiciousProvider
  ]
})
export class AppModule { }
