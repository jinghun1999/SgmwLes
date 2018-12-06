import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';

import { User } from '../../providers';
import { MainPage } from '../';
import {BaseUI} from "../baseUI";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage extends BaseUI{
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { name: string, password: string } = {
    name: '',
    password: ''
  };

  // Our translated text strings
  private loginErrorString: string;

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService) {
    super();

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  // Attempt to login in through our User service
  doLogin() {

    let loading = super.showLoading(this.loadingCtrl,"登录中...");

    this.user.login(this.account).subscribe((resp) => {
      loading.dismiss();
      this.navCtrl.push(MainPage);
    }, (err) => {
      alert(err)
      loading.dismiss();
      super.showToast(this.toastCtrl, this.loginErrorString);
    });
  }
}
