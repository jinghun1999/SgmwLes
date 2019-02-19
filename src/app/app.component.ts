import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
//import { TranslateService } from '@ngx-translate/core';
import { Nav, Platform } from 'ionic-angular';
//import {Storage} from "@ionic/storage";
import {FirstRunPage, MainPage} from '../pages';
import {Api} from '../providers';
import {BaseUI} from "../pages/baseUI";
//import {AppUpdate} from "@ionic-native/app-update";

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
              //private appUpdate: AppUpdate,
              private splashScreen: SplashScreen) {
    super();
    platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (window.localStorage.getItem('TOKEN')) {
        this.rootPage = MainPage;
      } else {
        this.rootPage = FirstRunPage;
      }
      // this.storage.get('TOKEN').then(token=> { if(token){
      //   console.log(token);
      //   this.rootPage = MainPage;
      // }}).catch(e=> console.error(e.toString()))
    });

    // const updateUrl = this.api.api_host + '/update.xml';
    // this.appUpdate.checkAppUpdate(updateUrl).then(() => {
    //   console.log('Update available')
    // });
  }
}
