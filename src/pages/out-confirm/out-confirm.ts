import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController, ViewController} from 'ionic-angular';
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

/**
 * Generated class for the OutConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-out-confirm',
  templateUrl: 'out-confirm.html',
})
export class OutConfirmPage extends BaseUI{
  parts: any[] = [];
  not_ok_parts: any[] =[];
  msg : string;
  sheet: any;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController,
              public viewCtrl: ViewController,
              public api: Api) {
    super();
    this.msg = navParams.get('msg').toString();
    this.sheet = this.navParams.get('sheet');
    this.parts = navParams.get('parts');
  }

  ionViewDidLoad() {
    this.not_ok_parts = this.parts.filter(item => {
      return item.required_part_count !== item.received_part_count;
    });
  }

  //执行出库
  excOutStock() {
    let loading = super.showLoading(this.loadingCtrl, '正在出库，请稍后...');
    this.api.get('wm/getExcuseOutStock', {id: this.sheet.id}).subscribe((res: any) => {
        if (res.successful && res.data) {
          super.showToast(this.toastCtrl, '出库成功！');
          this.viewCtrl.dismiss({res: true});
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
      },
      err => {
        super.showToast(this.toastCtrl, err);
        loading.dismiss();
      });
  }

  cancel = () =>{
    this.viewCtrl.dismiss();
  }
}
