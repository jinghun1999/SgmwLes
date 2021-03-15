import { Component, ViewChild } from "@angular/core";
import {
    IonicPage,
    NavController,
    ToastController,
    LoadingController,
    AlertController,
} from "ionic-angular";

import { HttpErrorResponse } from '@angular/common/http'
import { TimeoutError } from 'rxjs';
import { Api, User } from "../../providers";
import { HomePage, BaseUI } from "../";
// import { NativeAudio } from '@ionic-native/native-audio';
@IonicPage()
@Component({
    selector: "page-login",
    templateUrl: "login.html",
})
export class LoginPage extends BaseUI {
    @ViewChild("userName") usernameInput;
    version: string;
    res: any = {};
    envs: any[] = [];
    workshop: string;
    gender: string = "";
    account: { name: string; password: string } = {
        name: "",
        password: "",
    };
    // private onSuccess: any;
    // private onError: any;
    constructor(
        public navCtrl: NavController,
        public user: User,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        // private nativeAudio: NativeAudio,
        public api: Api
    ) {
        super();
        this.version = this.api.version;
        // //uniqueId1为音频文件的唯一ID
        // //assetPath音频资产的相对路径或绝对URL（包括http：//）
        // //官网还有更多的配置，这里只需要两个参数就行了，后面的回调记得带上
        // this.nativeAudio.preloadSimple('yes', 'assets/audio/yes.wav').then(this.onSuccess, this.onError);
        // this.nativeAudio.preloadSimple('no', 'assets/audio/no.wav').then(this.onSuccess, this.onError);
    }

    ionViewDidLoad() {
        this.setFocus();
        //配置登录环境
        this.envs = [
            //生产环境不显示
            //   {
            //     id: 1,
            //     text: "开发环境",
            //     value: "http://localhost:49280",   
            //   },
            {
                id: 2,
                text: "生产环境",
                value: "https://hxlesapp.sgmw.com.cn:4445",
            },
            {
                id: 3,
                text: "测试环境(仅测试使用)",
                value: "http://10.1.126.171/lesapi",
            }
        ];
        const env = localStorage.getItem('les_env');
        if (env && this.envs.findIndex(e => e.value == env) > -1) {
            this.api.api_host = env;
        }
        else {
            this.api.api_host = this.envs[0].value;
        }
    }
    doLogin() {
        // // play yes audio when suceessed.
        // this.nativeAudio.play('yes').then(this.onSuccess, this.onError);
        // // play no audio when failed.
        // this.nativeAudio.play('no').then(this.onSuccess, this.onError);
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
            }
        );
    }

    setFocus = () => {
        setTimeout(() => {
            this.usernameInput.setFocus(); //为输入框设置焦点
        }, 150);
    };
}
