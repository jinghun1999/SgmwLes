import { Component } from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';

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
export class SuspiciousDetailPage {
  data: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public modalCtrl: ModalController,) {
    this.data = navParams.get('item');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousDetailPage');
  }

  goUnlock() {
    let addModal = this.modalCtrl.create('SuspiciousUnlockPage', {dt: this.data});
    addModal.onDidDismiss(v => {
      if (v) {
        this.data.part_qty -= v;
        this.data.status_text_jf = this.data.part_qty > 0 ? '部分解封' : '已解封';
      }
    })
    addModal.present();
  }
}
