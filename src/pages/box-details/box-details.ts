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
  parts: any[] = [];
  data: any = {};
  box_Qty: number = 0; //累计盘点箱数
  box_part_Qty: number = 0; //累计实盘件数
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private api: Api,
    private storage: Storage) {
    super();
    this.data = this.navParams.get('parts');
    console.log(this.data);
    this.parts = this.data.parts;
  }
  ionViewDidEnter() {
    if (this.parts.length > 0) {
      for (let i = 0; i < this.parts.length; i++) {
        this.parts[i].max = this.parts[i].real_qty;
        this.box_Qty += this.parts[i].box_Qty;
        if (this.parts[i].box_status == 2) {
          this.box_part_Qty += this.parts[i].real_qty;
        }
      }
    }
  }
  //扫描
  searchPart() {
    if (!this.label) {
      return;
    }
    let part = this.parts.find(p => p.box === this.label);
    if (part) {
      if (part.box_status == 1) {
        part.box_status = 2;
        this.box_Qty++;
      }
      for (let i = 0; i < this.parts.length; i++) {
        if (this.parts[i].box_status == 2) {
          this.box_part_Qty += this.parts[i].real_qty;
        }
      }
    }
  }
  //提交
  save() {
    //this.api.post('inventory/PostBoxPart',);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BoxDetailsPage');
  }
  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }

  changeQty(part) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: part.max,
      receivePieces: part.real_qty
    });
    _m.onDidDismiss(data => {
      if (data) {
        if (data.receive == 0) {
          super.showToast(this.toastCtrl, '数量不能为0', 'error');
          return;
        }
        part.real_qty = data.receive;
        this.box_part_Qty += part.real_qty;
        part.box_status = 2;
        this.box_Qty++;
      }
    });
    _m.present();
  }
  //确认提交
  showConfirm() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '是否确定要提交？',
      buttons: [{
        text: '取消',
        handler: () => {

        }
      }, {
        text: '确定',
        handler: () => {
          this.save();
        }
      }]
    });
    prompt.present();
  }
}
