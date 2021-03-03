import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  ToastController,
  LoadingController,
  AlertController,
} from "ionic-angular";

import { HttpErrorResponse  } from '@angular/common/http'
import { TimeoutError } from 'rxjs';
import { Api, User } from "../../providers";
import { HomePage, BaseUI } from "../";

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html",
})
export class LoginPage extends BaseUI {
  @ViewChild("userName") usernameInput;
  version: string;
  res: any = {};
  environment: any[] = [];
  workshop: string;
  gender: string = "";
  account: { name: string; password: string } = {
    name: "",
    password: "",
  };
  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public api: Api
  ) {
    super();
    this.version = this.api.version;
  }

  ionViewDidLoad() {
    this.setFocus();
    //配置登录环境
    this.environment = [
      {
        id: 1,
        text: "开发环境",
        value: "http://127.0.0.1:49280", 
      },      
      {
        id: 2,
        text: "冲压测试环境",
        value: "http://10.1.126.171/CYWEBAPI",
      },
      {
        id: 3,
        text: "厂内环境",
        value: "http://10.1.126.171/lesapi",
      },
      {
        id: 4,
        text: "厂外环境",
        value: "http://222.84.126.54:8081",
      }
    ];
    const env = localStorage.getItem('les_env');
    if (this.environment.findIndex(e => e.value == env) === -1) {
      this.api.api_host = this.environment[3].value;
    }
    else { 
      this.api.api_host = env ;
    }    
  }
  doLogin() {
    if (!this.account.name || !this.account.password) {
      super.showToast(this.toastCtrl, "请输入用户名密码");
      this.setFocus();
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, "登录中...");
    localStorage.setItem('les_env', this.api.api_host);
    this.user.login(this.account).subscribe(
      (resp) => {
        loading.dismiss();
        this.navCtrl.setRoot(
          HomePage,
          {},
          {
            animate: true,
            direction: "forward",
          }
        );
      },
      (err) => {
        loading.dismiss();        
        let errMsg = '';
        if (err instanceof TimeoutError) {
          errMsg = '服务器连接超时';          
        } else if (err instanceof HttpErrorResponse) {
          errMsg = '网络连接异常';
        } else {
          errMsg = '未知原因，请求失败';
        }
        super.showToast(this.toastCtrl, errMsg, "error");
        //super.showToast(this.toastCtrl, '登录失败', 'error');
      }
    );
  }

  setFocus = () => {
    setTimeout(() => {
      this.usernameInput.setFocus(); //为输入框设置焦点
    }, 150);
  };
}
