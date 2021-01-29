import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
//import { TranslateService } from '@ngx-translate/core';
import {Nav, Platform} from 'ionic-angular';
//import {Storage} from "@ionic/storage";
import {LoginPage, HomePage} from '../pages';
//import {Api} from '../providers';
import {BaseUI} from "../pages/baseUI";
//import { AppUpdate } from '@ionic-native/app-update/ngx';
//import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  template: `
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp extends BaseUI {
  rootPage: any;

  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform,
              private statusBar: StatusBar,
              //private api: Api,
              // private appUpdate: AppUpdate,
              // private appVersion: AppVersion,
              // private toastCtrl: ToastController,
              private splashScreen: SplashScreen) {
    super();
    platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      //console.log(this.nav.);

      if (window.localStorage.getItem('les_env') && window.localStorage.getItem('TOKEN')) {
        this.rootPage = HomePage;
      } else {
        this.rootPage = LoginPage;
      }
      // this.storage.get('TOKEN').then(token=> { if(token){
      //   console.log(token);
      //   this.rootPage = MainPage;
      // }}).catch(e=> console.error(e.toString()))



      if (platform.is('android')) {
         // this.appVersion.getVersionCode().then(res => {
         //   alert(JSON.stringify(res));
         // }).catch(error => {
         //   alert('错了');
         // });

         //const updateUrl = this.api.api_host + '/update_apk.xml';
         //super.showToast(this.toastCtrl, updateUrl, 'success');
         /*this.appUpdate.checkAppUpdate(updateUrl).then((res)=>{

         }).catch((e)=>{
           alert('配置错误');
         });*/
      }else{
        //super.showToast(this.toastCtrl, 'NOT ANDROID', 'success');
      }
    });

  }
}
