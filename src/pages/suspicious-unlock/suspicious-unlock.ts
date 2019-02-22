import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ToastController,
  ViewController
} from 'ionic-angular';
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

/**
 * Generated class for the SuspiciousUnlockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-suspicious-unlock',
  templateUrl: 'suspicious-unlock.html',
})
export class SuspiciousUnlockPage extends BaseUI {
  data: any = {};
  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private api: Api,
              public navParams: NavParams) {
    super();
    this.data = this.navParams.get('dt');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousUnlockPage');
  }

  unlock(){
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '确认要解封该零件吗？',
      buttons: [{
        text: '取消',
        handler: () => {}
      }, {
        text: '确认解封',
        handler: () => {
          this.unlock_do();
        }
      }]
    });
    prompt.present();
  }
  unlock_do(){
    if(!this.data.unlock_count) {
      super.showToast(this.toastCtrl, '请输入解封数量');
      return;
    }
    let json = {
      code: this.data.code,
      unlock_count: this.data.unlock_count,
      why: this.data.why,
    };
    let loading = super.showLoading(this.loadingCtrl,"提交中...");
    this.api.post('suspicious/postUnlock', json).subscribe((res: any)=>{
      loading.dismissAll();
      if(res.successful) {
        if(!res.data){
          this.viewCtrl.dismiss(json.unlock_count);
        }else{
          super.showToast(this.toastCtrl, res.data);
        }
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    }, ()=>{
      loading.dismissAll();
    });
  }
  cancel(){
    this.viewCtrl.dismiss();
  }
}
