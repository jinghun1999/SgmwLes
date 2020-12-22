import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ToastController,
  ViewController,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { BaseUI } from "../";
import { Api } from "../../providers";

/**
 * Generated class for the SetProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-set-profile",
  templateUrl: "set-profile.html",
})
export class SetProfilePage extends BaseUI {
  list: any[];

  //plant_choose: any[];
  workshop_choose: any[];

  //plantid: string;
  plant: any;
  workshop: any;
  fetching = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public api: Api
  ) {
    super();
  }

  ionViewDidLoad() {
    this.plant = this.api.plant;
    setTimeout(() => {
      this.api
        .get("system/getPlants", { plant: this.plant, type: -1 })
        .subscribe(
          (res: any) => {
            this.fetching = false;
            if (res.successful) {
              this.list = res.data;

              //this.plant_choose = res.data;
              //this.plant = res.data[0].value;

              this.workshop_choose = res.data; 
              //res.data[0].children;
              //this.workshop = res.data[0].children[0].value;

              this.getConfig();
            } else {
              super.showToast(this.toastCtrl, res.message);
            }
          },
          (err) => {
            this.fetching = false;
            super.showToast(this.toastCtrl, "获取车间信息出现错误，请稍后再试");
          }
        );
    });
  }

  getConfig() {
    this.storage
      .get("WORKSHOP")
      .then((res) => {
        if (res) {
          this.workshop = res; //JSON.parse(res);
        }
      })
      .catch((e) => console.error(e.toString()));
  }

  plantSelect() {}

  save() {
    this.storage
      .set("WORKSHOP", this.workshop)
      .then((res) => {
        this.viewCtrl.dismiss(this.workshop);
      })
      .catch(() => {});
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
}
