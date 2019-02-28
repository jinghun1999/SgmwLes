import {Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';

import {Api, User} from '../../providers';
import { HomePage, BaseUI } from '../';
import {Storage} from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage extends BaseUI{
  @ViewChild('userName') usernameInput;
  workshops: any[] = [];
  workshop: string;
  account: { name: string, password: string } = {
    name: '',
    password: ''
  };

  constructor(public navCtrl: NavController,
              private storage: Storage,
    public user: User,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
              public api: Api) {
    super();

    document.onkeydown = () => {
      var e = <any>window.event;
      var currKey = e.keyCode || e.which || e.charCode;//支持IE、FF
      switch (currKey) {
        case 13:
          //Enter
          this.doLogin();
          break;
      }
    }
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.usernameInput.setFocus();//为输入框设置焦点
    },150);

    let loading = super.showLoading(this.loadingCtrl, "正在加载数据...");
    setTimeout(() => {
      this.api.get('system/getPlants', {plant: this.api.plant}).subscribe((res: any) => {
          loading.dismiss();
          if (res.successful) {
            this.workshops = res.data;
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
        },
        err => {
          loading.dismiss();
          alert(err.message);
        });
    });
  }

  doLogin() {
    if (!this.workshop) {
      super.showToast(this.toastCtrl, '请选择车间');
      return;
    }
    this.storage.set('WORKSHOP', this.workshop).then((res) => {


      let loading = super.showLoading(this.loadingCtrl, "登录中...");
      this.user.login(this.account).subscribe((resp) => {
        loading.dismiss();
        //this.navCtrl.push(MainPage);
        this.navCtrl.setRoot(HomePage, {}, {
          animate: true,
          direction: 'forward'
        });
      }, (err) => {
        loading.dismiss();
        super.showToast(this.toastCtrl, '登录失败' + err);
      });


    }).catch(() => {
    });
  }
}
