import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import {BaseUI} from '../baseUI';
import {p} from "@angular/core/src/render3";

/**
 * Generated class for the UnstandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-OutUnstand',
  templateUrl: 'out-unstand.html',
})
export class OutUnstandPage extends BaseUI {
  //boxes: string;      //箱数
  //parts: string;      //件数
  list: any[];
  max_parts: number = 0;  //最大可操作零件数
  std_qty: number = 0;    //标准包装数
  //frags: string = '0';     //散件数
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    super();
    this.list = navParams.get('list');
    this.std_qty = navParams.get('std_qty');
    this.max_parts = navParams.get('max_parts');
    //this.frags = (navParams.get('parts') % navParams.get('std_qty')).toString();
  }

  changeBox(l: any) {
    l.pack = parseInt(l.pack);

    l.qty = l.pack * this.std_qty;

    let total = 0;
    this.list.forEach((p, i)=>{
      total += p.qty;
    });

    this.err = total > 0 && total > this.max_parts ? '件数已超过剩余数量': '';
  }
  changeQty(l: any) {
    l.qty = parseInt(l.qty);
    l.pack = Math.ceil(l.qty/ this.std_qty);
    let total = 0;
    this.list.forEach((p, i)=>{
      total += p.qty;
    });
    this.err = total > 0 && total > this.max_parts ? '件数已超过剩余数量': '';
  }

  confirm() {
    // if (this.boxes == '') {
    //   this.err = '提示消息：请输入箱数！';
    //   return;
    // }
    // if (this.parts != '' && parseInt(this.parts) > this.max_parts) {
    //   this.err = '提示消息：件数大于剩余数量';
    //   return;
    // }
    // else if (this.frags != '' && parseInt(this.frags) >= this.std_qty) {
    //   this.err = '提示消息：散件数不能大于等于包装数';
    //   return;
    // }
    // let data = {boxes: parseInt(this.boxes), parts: parseInt(this.parts)};
    let data = this.list;
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

  cancel(){this.viewCtrl.dismiss();}
}
