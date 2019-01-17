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
  BoxNumber:string;      //箱数
  PartNumber:string;     //件数
  MaxPartNumber:number=0;  //最大可操作零件数
  StandPack:number=0;      //标准包装数
  FragNumber:string;     //散件数
  Error:string="";         //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl:ViewController) {
    super();
    this.BoxNumber=navParams.get('BoxNumber').toString();
    this.PartNumber=navParams.get('PartNumber').toString();
    this.StandPack=navParams.get('StandPack');
    this.MaxPartNumber=navParams.get('MaxPartNumber');
    this.FragNumber=(navParams.get('PartNumber') % navParams.get('StandPack')).toString();
  }

  ChangeBox() {
    if (this.BoxNumber!="" && parseInt(this.BoxNumber)>=0) {
      this.PartNumber = this.FragNumber!="" && parseInt(this.FragNumber) > 0 && parseInt(this.FragNumber)<this.StandPack ? ((parseInt(this.BoxNumber) - 1) * this.StandPack + parseInt(this.FragNumber)).toString() : (parseInt(this.BoxNumber) * this.StandPack).toString();
      this.Error = this.PartNumber!="" && parseInt(this.PartNumber) > this.MaxPartNumber ? "提示消息：件数大于剩余数量" : "";
    }
  }

  ChangeFrag() {
    if(this.PartNumber!="" && parseInt(this.PartNumber)>=0) {
      this.PartNumber = this.FragNumber!="" && parseInt(this.FragNumber) > 0 && parseInt(this.FragNumber)<=this.StandPack ? ((parseInt(this.BoxNumber) - 1) * this.StandPack + parseInt(this.FragNumber)).toString() : (parseInt(this.BoxNumber) * this.StandPack).toString();
      this.Error = this.PartNumber!="" && parseInt(this.PartNumber) > this.MaxPartNumber ? "提示消息：件数大于剩余数量" : "";
    }
    else if(this.PartNumber!="" && parseInt(this.PartNumber)<=this.StandPack) {
      this.Error = "提示消息：散件数不能大于包装数";
    }
  }

  Confirm() {
    if(this.BoxNumber=="") {
      this.Error = "提示消息：请输入箱数！";
      return;
    }
    if (this.PartNumber!="" && parseInt(this.PartNumber) > this.MaxPartNumber) {
      this.Error = "提示消息：件数大于剩余数量";
      return;
    }
    else if(this.FragNumber!="" && parseInt(this.FragNumber)>=this.StandPack) {
      this.Error = "提示消息：散件数不能大于等于包装数";
      return;
    }
    let data = { BoxNumber: parseInt(this.BoxNumber),PartNumber:parseInt(this.PartNumber) };
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

}
