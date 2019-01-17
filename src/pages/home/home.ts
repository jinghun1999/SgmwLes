import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';
import { Menus } from '../../providers';
import { Menu } from '../../models/menu';
import {SetProfilePage} from "../set-profile/set-profile";
//import {SettingsPage} from "../settings/settings";

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentItems: Menu[];
  gridList: Menu[];

  constructor(public navCtrl: NavController, public items: Menus,
              public modalCtrl: ModalController) {
    this.currentItems = this.items.query();
    this.gridList = this.currentItems;
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('SetProfilePage',{}, );
    addModal.onDidDismiss(item => {
      if (item) {
        this.items.add(item);
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Menu) {
    if(item.url)
      this.navCtrl.push(item.url, { });
  }

  getRowListByGridList(size) {
    var rowList = []
    for (var i = 0; i < this.gridList.length; i += size) {
      rowList.push(this.gridList.slice(i, i + size));
    }
    return rowList
  }

  goSetting(){
    this.navCtrl.push('SettingsPage', { });
  }
}
