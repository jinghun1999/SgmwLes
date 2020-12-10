import { Component } from "@angular/core";
import {
  App,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Api, Menus, User } from "../../providers";
import { BaseUI } from "../";
//import { l } from "@angular/core/src/render3";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage extends BaseUI {
  //currentItems: Menu[];
  //gridList: Menu[];
  gridList: any[] = [];
  workshop: string;
  username: string;
  version: string;
  
  constructor(
    public navCtrl: NavController,
    public items: Menus,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private storage: Storage,
    private app: App,
    private user: User,
    public api: Api
  ) {
    super();
    //this.currentItems = this.items.query();
    //this.gridList = this.currentItems;
    this.storage.get("USER_INFO").then((res) => {
      this.username = res;
    });
    //this.username = this.user._user.username;
    this.version = this.api.version;
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {   
    this.getWorkshop();
  }
  getWorkshop = () => {
    this.storage.get("WORKSHOP").then((res) => {
      if (!res) {
        this.setProfile();
      } else {
        //this.workshop = res;
      }
    });
    let loading = super.showLoading(this.loadingCtrl, "加载中...");
    this.api.get("system/getMenus").subscribe(
      (res: any) => {
        if (res.successful) {
          this.gridList = res.data;
        } else {
          super.showToast(this.toastCtrl, res.message, "error");
        }
        loading.dismiss();
      },
      (err) => {
        super.showToast(this.toastCtrl, "系统错误", "error");
        loading.dismiss();
      }
    );
  };
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
    let addModal = this.modalCtrl.create(
      "SetProfilePage",
      {},
      { enableBackdropDismiss: false, showBackdrop: false }
    );
    addModal.onDidDismiss((item) => {
      this.getWorkshop();
      if (item) {
        //this.items.add(item);
      }
    });
    addModal.present();
  }

  openItem(item: any) {
    if (item.link_url) this.navCtrl.push(item.link_url, {});
  }

  getRowListByGridList(size) {
    var rowList = [];
    for (var i = 0; i < this.gridList.length; i += size) {
      rowList.push(this.gridList.slice(i, i + size));
    }
    return rowList;
  }

  goSetting() {
    this.navCtrl.push("SettingsPage", {});
  }

  logout() {
    this.user.logout().subscribe((re) => {
        setTimeout(() => {
          this.app.getRootNav().setRoot(
            "LoginPage", {},
            {
              animate: true,
              direction: "forward",
            }
          );
        });
      },
      (r) => {
        alert("注销失败");
      }
    );
  }
}
