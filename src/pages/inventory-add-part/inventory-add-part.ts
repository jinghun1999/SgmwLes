import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController, ViewController} from 'ionic-angular';
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

/**
 * Generated class for the InventoryAddPartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-inventory-add-part',
  templateUrl: 'inventory-add-part.html',
})
export class InventoryAddPartPage extends BaseUI {
  item: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private toastCtrl: ToastController,
              private viewCtrl: ViewController,
              private api: Api) {
    super();
    this.item = navParams.get('item');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InventoryAddPartPage');
  }

  cancel(){
    this.viewCtrl.dismiss();
  }

  confirm(){
    if(!this.item.real_qty || !this.item.dloc){
      super.showToast(this.toastCtrl, '请完善信息后再添加');
      return;
    }
    this.api.post('inventory/postAddPart', this.item).subscribe((res: any)=>{
      if(res.successful){
        super.showToast(this.toastCtrl, '操作成功');
        this.viewCtrl.dismiss(res);
      }else{
        super.showToast(this.toastCtrl, res.message);
      }
    },(err)=>{
      alert('系统错误');
    });
  }
}
