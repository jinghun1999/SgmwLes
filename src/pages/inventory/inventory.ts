import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';

import {BaseUI} from "../baseUI";
import {Api} from "../../providers";

@IonicPage()
@Component({
  selector: 'page-inventory',
  templateUrl: 'inventory.html'
})
export class InventoryPage extends BaseUI {

  data: any = {
    code: null,
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              private api: Api) {
    super();
  }

  ionViewDidLoad() {
    //get plant and workshop
  }

  search() {
    let loading = super.showLoading(this.loadingCtrl,"查询中...");
    if (this.data.code) {
      this.api.get('inventory/getScanCode', {code: this.data.code}).subscribe((res: any)=>{
        loading.dismissAll();
       if(res.successful){
         this.data = res.data;
       }else{
         super.showToast(this.toastCtrl, res.message);
       }
      });
    }
  }

  cancel(){

  }
  save(){

  }
}
