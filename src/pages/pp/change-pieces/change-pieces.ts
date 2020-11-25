import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-change-pieces',
  templateUrl: 'change-pieces.html',
})
export class ChangePiecesPage {

  _parts: number = 0;  //最大可操作数
  receivePieces: number = 0;  //输入的数
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    this._parts = navParams.get('max_parts');
    this.receivePieces = navParams.get('max_parts');
  }

  change() { 
    if (!isNaN(this._parts) && this.receivePieces > 0 && this.receivePieces > this._parts) {      
      this.err = '已超过数量';
      return;
    }
  }

  confirm() {
    if (this.receivePieces == 0) {
      this.err = '提示消息：请输入箱数！';
      return;
    }
    
    let data = { receive: this.receivePieces };
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

  cancel(){this.viewCtrl.dismiss();}
}



