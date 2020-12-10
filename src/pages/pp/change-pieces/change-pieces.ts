import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,LoadingController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-change-pieces',
  templateUrl: 'change-pieces.html',
})
export class ChangePiecesPage {

  _parts: number = 0;  //最大可操作数
  receivePieces: number = 0;  //输入的数
  pressParts: any[] = [];//退货接收功能的零件列表
  part: string = '';   //选中的零件
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController) {
    this._parts = Number(this.navParams.get('max_parts'));
    this.receivePieces = Number(this.navParams.get('max_parts'));
    this.pressParts = this.navParams.get('pressParts');
  }

  ionViewDidEnter() {
    if(this.pressParts &&this.pressParts.length>0) {
      let model = this.pressParts.find((p) => p.isSelect);
      model ? this.part = model.part_no : this.part = this.pressParts[0].part_no;
    }
  }
  change() {
    this.receivePieces = Number(this.receivePieces);
    if(this.receivePieces > this._parts) {
      this.err = '已超过数量';
      return;
    }
  }

  confirm() {
    // if (!this.receivePieces || this.receivePieces < 0) {
    //   this.err = '提示消息：请输入箱数！';
    //   return;
    // }
    this.receivePieces = Number(this.receivePieces);
    if(this.receivePieces > this._parts) {
      this.err = '已超过数量';
      return;
    }
    const part = this.part ? this.part : "0";
    const data = { receive: this.receivePieces };
    this.viewCtrl.dismiss(data, part);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

  cancel() { this.viewCtrl.dismiss(); }
}



