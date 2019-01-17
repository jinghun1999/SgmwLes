import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';

import {BaseUI} from "../baseUI";

@IonicPage()
@Component({
  selector: 'page-inventory',
  templateUrl: 'inventory.html'
})
export class InventoryPage extends BaseUI {

  currentItem: any = {
    plant: 8000,
    workshop: 'loc1',
    type: '动态盘点',
    mode: '明盘'
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,) {
    super();
  }

  /**
   * Perform a service for the proper items.
   */
  getItems(ev) {
    let val = ev.target.value;
    if (!val || !val.trim()) {
      //this.currentItem = [];
      return;
    }
    // this.currentItems = this.items.query({
    //   name: val
    // });
  }

  /**
   * Navigate to the detail page for this item.
   */
  scan() {
    super.showToast(this.toastCtrl, '暂未实现');
  }

}
