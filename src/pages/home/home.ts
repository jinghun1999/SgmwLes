import {Component} from '@angular/core';
import {App, IonicPage, LoadingController, ModalController, NavController, ToastController} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {Api, Menus, User} from '../../providers';
import { Menu } from '../../models/menu';
import {BaseUI} from "../";
//import {SetProfilePage} from "../set-profile/set-profile";
//import {SettingsPage} from "../settings/settings";

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends BaseUI{
  currentItems: Menu[];
  gridList: Menu[];

  workshop: string;
  username: string;

  constructor(public navCtrl: NavController,
              public items: Menus,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              private storage: Storage,
              private app: App,
              private user: User,
              public api: Api) {
    super();
    this.currentItems = this.items.query();
    this.gridList = this.currentItems;
    this.storage.get('USER_INFO').then(res => {
      this.username = res;
    });
    //this.username = this.user._user.username;
  }

  // keydown (event) {
  //   switch (event.keyCode) {
  //     case 112:
  //       this.goSetting();
  //       break;
  //     case 49:
  //     case 50:
  //     case 51:
  //     case 52:
  //     case 53:
  //     case 54:
  //     case 55:
  //       let i = event.keyCode - 48;
  //       let index = this.gridList.findIndex(p => p.key === i);
  //       if (index > -1) {
  //         this.openItem(this.gridList[index]);
  //       } else {
  //         //alert('无效的按键')
  //       }
  //       break;
  //   }
  //   alert("currKey:" + event.keyCode);
  // }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((res) => {
      if (!res) {
        this.setProfile();
      } else {
        this.workshop = res;
      }
    });
  }
  // ionViewDidEnter(){
  //   document.addEventListener("keydown", this.keydown);
  // }
  // ionViewWillUnload(){
  //   document.removeEventListener("keydown", this.keydown);
  //   alert('remove home')
  // }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  setProfile() {
    let addModal = this.modalCtrl.create('SetProfilePage',{}, );
    addModal.onDidDismiss(item => {
      if (item) {
        //this.items.add(item);
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.

  deleteItem(item) {
    this.items.delete(item);
  }
   */
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

  logout(){
    this.user.logout().subscribe((re) => {
      debugger;
      setTimeout(() => {
        this.app.getRootNav().setRoot('LoginPage', {}, {
          animate: true,
          direction: 'forward'
        });
      });
    }, (r) => {
      alert('注销失败');
    });
  }
}
