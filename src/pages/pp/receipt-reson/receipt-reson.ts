import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,Searchbar } from 'ionic-angular';
import { BaseUI } from '../../baseUI';

@IonicPage()
@Component({
  selector: 'page-receipt-reson',
  templateUrl: 'receipt-reson.html',
})
export class ReceiptResonPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  placeholderText: string = '退货原因';// 
  receiptReson: string = '';  //输入的文字
  err: string;       //错误提示

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {
    super();
    this.receiptReson = this.navParams.get('reson');
  }

   confirm() {    
    let data = { reson: this.receiptReson };
    this.viewCtrl.dismiss(data);
  }

  ionViewDidEnter() {
   
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

  cancel(){this.viewCtrl.dismiss();}
}

