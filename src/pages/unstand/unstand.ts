import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import {BaseUI} from '../baseUI';

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
export class UnstandPage extends BaseUI {
  boxes: string;      //箱数
  parts: string;      //件数
  max_parts: number = 0;  //最大可操作零件数
  std_qty: number = 0;    //标准包装数
  frags: string = '0';     //散件数
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    super();
    this.boxes = navParams.get('boxes').toString();
    this.parts = navParams.get('parts').toString();
    this.std_qty = navParams.get('std_qty');
    this.max_parts = navParams.get('max_parts');
    //this.frags = (navParams.get('parts') % navParams.get('std_qty')).toString();
  }

  changeBox() {
    let _boxes = parseInt(this.boxes), _frags = parseInt(this.frags);

    if (!isNaN(_boxes) && _boxes >= 0) {
      this.parts = !isNaN(_frags) && _frags > 0 && _frags < this.std_qty ? ((_boxes - 1) * this.std_qty + _frags).toString() : (_boxes * this.std_qty).toString();
      this.err = this.parts != '' && parseInt(this.parts) > this.max_parts ? '件数已超过剩余数量' : '';
    }
  }

  changeFrag() {
    let _boxes = parseInt(this.boxes), _parts = parseInt(this.parts), _frags = parseInt(this.frags);

    if (!isNaN(_parts) && _parts >= 0) {
      this.parts = !isNaN(_frags) && _frags > 0 && _frags <= this.std_qty ? ((_boxes - 1) * this.std_qty + _frags).toString() : (_boxes * this.std_qty).toString();
      this.err = this.parts != '' && parseInt(this.parts) > this.max_parts ? '件数已超过剩余数量' : '';
    }
    else if (this.parts != '' && parseInt(this.parts) <= this.std_qty) {
      this.err = '散件数已超过包装数';
    }
  }

  confirm() {
    if (this.boxes == '') {
      this.err = '提示消息：请输入箱数！';
      return;
    }
    if (this.parts != '' && parseInt(this.parts) > this.max_parts) {
      this.err = '提示消息：件数大于剩余数量';
      return;
    }
    else if (this.frags != '' && parseInt(this.frags) >= this.std_qty) {
      this.err = '提示消息：散件数不能大于等于包装数';
      return;
    }
    let data = {boxes: parseInt(this.boxes), parts: parseInt(this.parts)};
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnstandPage');
  }

  cancel(){this.viewCtrl.dismiss();}
}
