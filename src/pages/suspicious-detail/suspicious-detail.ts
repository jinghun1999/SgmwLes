import { Component } from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams, ToastController, ViewController} from 'ionic-angular';
import {BaseUI} from "../baseUI";

/**
 * Generated class for the SuspiciousDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-suspicious-detail',
  templateUrl: 'suspicious-detail.html',
})
export class SuspiciousDetailPage extends BaseUI {
  data: any = {};

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private toastCtrl: ToastController,
              public modalCtrl: ModalController,) {
    super();
    this.data = navParams.get('data');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousDetailPage');
  }

  doPrint() {
    // let addModal = this.modalCtrl.create('SuspiciousUnlockPage', {dt: this.data});
    // addModal.onDidDismiss(v => {
    //   if (v) {
    //     this.data.part_qty -= v;
    //     this.data.status_text_jf = this.data.part_qty > 0 ? '部分解封' : '已解封';
    //   }
    // })
    // addModal.present();

    //变更单据状态，执行打印
    super.showToast(this.toastCtrl, '已提交打印状态');
    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, 1000);
  }

  cancel(){
    this.viewCtrl.dismiss();
  }
}
