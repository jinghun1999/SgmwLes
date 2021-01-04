import { Component, ViewChild } from '@angular/core';
import {
  AlertController,
  IonicPage,
  Searchbar,
  LoadingController,
  NavController,
  NavParams,
  ToastController, ModalController,
} from 'ionic-angular';

import { BaseUI } from "../baseUI";
import { Api } from "../../providers";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-box-details',
  templateUrl: 'box-details.html',
})
export class BoxDetailsPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  label: string = '';
  item: any = {
    plant: '',
    workshop:''
  };
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private api: Api,
  private storage :Storage) {
    super();
  }
  ionViewDidEnter(){
    this.storage.get('WORKSHOP').then((val) => {
      //console.log(val);
      this.item.plant = this.api.plant;
      this.item.workshop = val;
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BoxDetailsPage');
  }
}
