import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, AlertController } from 'ionic-angular';

import { Api, User } from '../../providers';
import { HomePage, BaseUI } from '../';
//import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage extends BaseUI {
  @ViewChild('userName') usernameInput;
  //workshops: any[] = [];
  version: string;
  res: any = {};
  environment: any[] = [];
  workshop: string;
  gender: string = '';
  account: { name: string, password: string } = {
    name: '',
    password: ''
  };

  constructor(public navCtrl: NavController,
    //private storage: Storage,
    public user: User,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public api: Api) {
    super();
    this.version = this.api.version;
  }

  ionViewDidLoad() {
    this.setFocus();
    this.environment = [
      {
        "id":1,
        "text":"开发环境",
        "value":'http://123.23.0.02:49280'
      },
      {
        "id":2,
        "text":"测试环境",
        "value":'http://10.1.126.171/lesapi'
      },
      {
        "id":3,
        "text":"厂外使用",
        "value":'http://192.168.0.1:49280'
      },
      {
        "id":4,
        "text":"厂内环境",
        "value":'http://172.168.0.1:49280'
      }
    ];    
    this.gender = this.environment.find((e) => e.id == 2).value;
    //localStorage.setItem('env', this.gender); 
    // this.api.getRequest().subscribe(data => { 
    //   console.log(data);
    // }, error => { 
    //     console.log(error);
    // });
    /*let loading = super.showLoading(this.loadingCtrl, "正在加载数据...");
    setTimeout(() => {
      this.api.get('system/getPlants', {plant: this.api.plant}).subscribe((res: any) => {
          loading.dismiss();
          if (res.successful) {
            this.workshops = res.data;
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
        },
        (err) => {
          loading.dismiss();
          alert(err.message);
        });
    });*/
  }
  //登录的时候存储
  changWS() {
    localStorage.getItem('env') ? localStorage.removeItem('env') : null;
    localStorage.setItem('env', this.gender);
  }
  doLogin() {
    // if (!this.workshop) {
    //   super.showToast(this.toastCtrl, '请选择车间');
    //   return;
    // }
    // this.storage.set('WORKSHOP', this.workshop).then((res) => {
    if (!this.account.name || !this.account.password) {
      super.showToast(this.toastCtrl, '请输入用户名密码');
      this.setFocus();
      return;
    }    
    setTimeout(this.changWS(),100);
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


    // }).catch(() => {
    // });
  }

  setFocus = () => {
    setTimeout(() => {
      this.usernameInput.setFocus();//为输入框设置焦点
    }, 150);
  }
}