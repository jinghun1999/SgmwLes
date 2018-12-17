import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';

import {Settings, User} from '../../providers';
import {BaseUI} from "../baseUI";
import {FirstRunPage} from "../index";

/**
 * The Settings page is a simple form that syncs with a Settings provider
 * to enable the user to customize settings for the app.
 *
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage extends BaseUI {
  // Our local settings object
  options: any;

  constructor(
    private app: App,
    public navCtrl: NavController,
    public settings: Settings,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public user: User) {
    super();
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {

  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

  logout() {
    this.user.logout().subscribe((re) => {
      debugger;
      setTimeout(() => {
        this.app.getRootNav().setRoot(FirstRunPage);
        // this.app.getRootNav().setRoot('WelcomePage', {}, {
        //   animate: true,
        //   direction: 'forward'
        // });
      });
    }, (r) => {
      alert('注销失败');
    });
  }
}
