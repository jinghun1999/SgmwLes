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
  pressParts: any[] = [];//退货接收功能的零件列表
  part: any={ };   //选中的零件
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    this._parts = parseInt(this.navParams.get('max_parts'));
    this.receivePieces = parseInt(this.navParams.get('max_parts'));
    this.pressParts = this.navParams.get('pressParts');
  }

  ionViewDidEnter(){
    // if(this.pressParts != 0) {
    //   let model = this.pressParts.find((p) => p.isSelect);
    //   model ?this.part = model.part_no:this.part=this.pressParts[0].part_no;
    // }
  }
  change() { 
    if(this.receivePieces > this._parts) {      
      this.err = '已超过数量';
      return;
    }
  }

  confirm() {
    //console.log(this.part);
    // this.part.part_no ? console.log('有只') : console.log("吾知");
     //return;
    if(!this.receivePieces || this.receivePieces < 0) {
      this.err = '提示消息：请输入箱数！';
      return;
    }

    if ( this.receivePieces > this._parts) {      
      this.err = '已超过数量';
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



