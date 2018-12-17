import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {FirstRunPage, MainPage} from '../pages';
import { Settings } from '../providers';
import {BaseUI} from "../pages/baseUI";

@Component({
  template: `
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp extends BaseUI {
  rootPage = FirstRunPage;

  @ViewChild(Nav) nav: Nav;

  constructor(private translate: TranslateService, platform: Platform, settings: Settings,
              private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen,
              private storage: Storage) {
    super();
    platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.storage.get('TOKEN').then(token=> { if(token){
        console.log(token);
        this.rootPage = MainPage;
      }}).catch(e=> console.error(e.toString()))
    });
  }
}
