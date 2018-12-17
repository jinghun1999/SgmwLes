import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  data: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
      this.data = navParams.get('item');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousDetailPage');
  }

  goUnlock(){

  }
  goReturn(){

  }
}
