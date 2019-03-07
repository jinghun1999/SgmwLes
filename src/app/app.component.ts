import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
//import { TranslateService } from '@ngx-translate/core';
import { Nav, Platform } from 'ionic-angular';
//import {Storage} from "@ionic/storage";
import {LoginPage, HomePage} from '../pages';
import {Api} from '../providers';
import {BaseUI} from "../pages/baseUI";
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  template: `
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp extends BaseUI {
  rootPage: any;

  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform,
              private statusBar: StatusBar,
              private api: Api,
              private appUpdate: AppUpdate,
              private appVersion: AppVersion,
              private splashScreen: SplashScreen) {
    super();
    platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (window.localStorage.getItem('TOKEN')) {
        this.rootPage = HomePage;
      } else {
        this.rootPage = LoginPage;
      }
      // this.storage.get('TOKEN').then(token=> { if(token){
      //   console.log(token);
      //   this.rootPage = MainPage;
      // }}).catch(e=> console.error(e.toString()))
    });
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    if (isAndroid == true) {
      const updateUrl = this.api.api_host + '/update_apk.xml';

      //var versionCode = this.appVersion.getVersionCode();

      //alert(versionCode)
      //this.appUpdate.checkAppUpdate(updateUrl);
    }
  }
}
