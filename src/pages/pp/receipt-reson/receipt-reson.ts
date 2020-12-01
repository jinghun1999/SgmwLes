import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-receipt-reson',
  templateUrl: 'receipt-reson.html',
})
export class ReceiptResonPage {
  
  receiptReson: string = '';  //输入的文字
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    this.receiptReson = navParams.get('reson').toString();
  }

   confirm() {    
    let data = { reson: this.receiptReson };
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

  cancel(){this.viewCtrl.dismiss();}
}

