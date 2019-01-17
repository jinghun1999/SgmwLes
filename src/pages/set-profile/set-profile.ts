import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseUI} from "../baseUI";
import {Api} from "../../providers";

/**
 * Generated class for the SetProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-set-profile',
  templateUrl: 'set-profile.html',
})
export class SetProfilePage extends BaseUI {
  list: any[];

  plant_choose: any[];
  workshop_choose: any[];

  plant: any;
  workshop: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public api: Api) {
    super();
  }

  ionViewDidLoad() {
    let loading = super.showLoading(this.loadingCtrl,"正在初始化...");
    setTimeout(()=> {
      this.api.get('system/getPlants').subscribe((res: any) => {
          loading.dismiss();
          if (res.successful) {
            this.list = res.data;

            this.plant_choose = res.data;
            this.plant = res.data[0].value;

            this.workshop_choose = res.data[0].children;
            this.workshop = res.data[0].children[0].value;
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
        },
        err => {
          loading.dismiss();
          alert(JSON.stringify(err))
        });
    });
  }

  plantSelect(){

  }

  save(){

  }
}
