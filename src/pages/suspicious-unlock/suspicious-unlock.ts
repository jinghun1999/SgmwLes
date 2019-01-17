import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

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
export class SuspiciousUnlockPage {
  data: any;
  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
              public navParams: NavParams) {
    this.data = this.navParams.get('dt');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousUnlockPage');
  }

  unlock(){
    alert('unlocked');
  }
  cancel(){
    this.viewCtrl.dismiss();
  }
}
