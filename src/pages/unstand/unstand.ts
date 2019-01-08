import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import {BaseUI} from "../baseUI";

/**
 * Generated class for the UnstandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-unstand',
  templateUrl: 'unstand.html',
})
export class UnstandPage extends BaseUI{
  BoxNumber:number=0;      //箱数
  PartNumber:number=0;     //件数
  MaxPartNumber:number=0;  //最大可操作零件数
  StandPack:number=0;      //标准包装数
  FragNumber:number=0;     //散件数
  Error:string="";         //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl:ViewController) {
    super();
    this.BoxNumber=navParams.get('BoxNumber');
    this.PartNumber=navParams.get('PartNumber');
    this.StandPack=navParams.get('StandPack');
    this.MaxPartNumber=navParams.get('MaxPartNumber');
    this.FragNumber=this.PartNumber % this.StandPack;
  }

  ChangeBox() {
    this.PartNumber = this.FragNumber > 0 ? (this.BoxNumber - 1) * this.StandPack + this.FragNumber : this.BoxNumber * this.StandPack;
    if (this.PartNumber > this.MaxPartNumber) {
      this.Error = "提示消息：件数大于剩余数量";
    }
  }


  ChangeFrag(){
    if(this.FragNumber>0){
      this.PartNumber=(this.BoxNumber-1)*this.StandPack+this.FragNumber;
      this.BoxNumber=this.PartNumber / this.StandPack;
    }
    else{
      this.PartNumber=this.BoxNumber*this.StandPack;
    }
    if (this.PartNumber > this.MaxPartNumber) {
      this.Error = "提示消息：件数大于剩余数量";
    }
  }

  Close(){
    this.viewCtrl.dismiss();
  }

  Confirm() {
    if (this.PartNumber > this.MaxPartNumber) {
      this.Error = "提示消息：件数大于剩余数量";
      return;
    }
    let data = { 'BoxNumber': this.BoxNumber,'PartNumber':this.PartNumber };
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

}
