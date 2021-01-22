import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  ToastController,
  LoadingController,
  AlertController,
} from "ionic-angular";

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
    this.environment = [
      {
        id: 1,
        text: "开发环境",
        value: "http://localhost:49280",
      },
      {
        id: 2,
        text: "测试环境",
        value: "http://10.1.126.171/lesapi",
      },
      {
        id: 3,
        text: "冲压测试环境",
        value: "http://10.1.126.171/CYWEBAPI",
      },
      {
        id: 4,
        text: "厂内使用",
        value: "http://172.168.0.1:49280",
      },
    ];
    const env = localStorage.getItem('les_env');
    this.api.api_host = env ? env : this.environment[1].value;
  }
  doLogin() {
    if (!this.account.name || !this.account.password) {
      super.showToast(this.toastCtrl, "请输入用户名密码");
      this.setFocus();
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, "登录中...");
    this.user.login(this.account).subscribe(
      (resp) => {
        loading.dismiss();
        localStorage.setItem('les_env', this.api.api_host);
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
        super.showToast(this.toastCtrl, "登录失败" + err);
      }
    );
  }

  setFocus = () => {
    setTimeout(() => {
      this.usernameInput.setFocus(); //为输入框设置焦点
    }, 150);
  };
}
