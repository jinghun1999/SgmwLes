import { Component } from "@angular/core";
import {
  App,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
  Platform,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Api, Menus, User } from "../../providers";
import { BaseUI } from "../";
import { AppVersion } from '@ionic-native/app-version';

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
  data: any = {
    current_version: 0,
    version: 0,
    url: ''
  };
  constructor(
    public navCtrl: NavController,
    public items: Menus,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private storage: Storage,
    private platform: Platform,
    private app: App,
    private user: User,
    public api: Api,
    private appVersion: AppVersion
  ) {
    super();
    this.storage.get("USER_INFO").then((res) => {
      this.username = res;
    });
    this.version = this.api.version;

  }
  ionViewDidLoad() {
    this.doUpData();
    this.getWorkshop();
  }
  getWorkshop = () => {
    this.storage.get("WORKSHOP").then((res) => {
      if (res === '') {
        super.showToast(this.toastCtrl, "当前车间为空，请选择车间后再操作", "error");
      } else if (!res) {
        this.setProfile();
      }
    });
    let loading = super.showLoading(this.loadingCtrl, "加载中...");
    this.api.get("system/getMenus").subscribe(
      (res: any) => {
        loading.dismiss();
        if (res.successful) {
          this.gridList = res.data;
        } else {
          super.showToast(this.toastCtrl, res.message, "error");
        }
      },
      (err) => {
        loading.dismiss();
        super.showToast(this.toastCtrl, "系统错误", "error");
      }
    );
  };
  // ionViewDidEnter() {
  //   //this.doUpData();
  // }
  setProfile() {
    let addModal = this.modalCtrl.create(
      "SetProfilePage",
      {},
      { enableBackdropDismiss: false, showBackdrop: false }
    );
    addModal.onDidDismiss((item) => {
      this.getWorkshop();
      if (item) {

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
  //校验更新
  doUpData() {
    if (this.platform.is('android')) {
      let t = this;
      this.appVersion.getVersionNumber().then(ver => {       
        t.api.get('system/getApkUpdate').subscribe((res: any) => {
          if (res.data.version>ver) { 
            let dt = {
              current_version: ver,
              version: res.data.version,
              url: res.data.url
            };
            //跳转到升级页面
            t.app.getRootNav().setRoot(
              "UpgradePage", { data: dt },
              {
                animate: true,
                direction: "forward",
              }
            );
          }
        });
      });
    }
  };
}
