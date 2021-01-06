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

@IonicPage()
@Component({
  selector: 'page-box-details',
  templateUrl: 'box-details.html',
})
export class BoxDetailsPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  label: string = '';
  part_name: string = ''; //零件名称
  part_no: string = '';//零件号
  part_list: any[] = [];
  data: any = {
  };
  box_Qty: number = 0; //实盘箱数
  box_part_Qty: number = 0; //实盘件数
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private api: Api) {
    super();
    this.data = this.navParams.get('parts');
    this.part_list = this.data.parts;
  }
  ionViewDidEnter() {
    if (this.part_list.length) {
      this.part_name = this.part_list[0].part_name;
      this.part_no = this.part_list[0].part_no;

      for (let i = 0; i < this.part_list.length; i++) {
        this.part_list[i].max = Number(this.part_list[i].real_qty);
        if (this.part_list[i].box_status === 2) {
          this.box_Qty++;
          this.box_part_Qty += Number(this.part_list[i].real_qty);
        }
      }
    }
  }
  //扫描
  searchPart() {
    if (!this.label) {
      return;
    }
    let part = this.data.parts.find(p => p.box === this.label);
    if (part) {
      if (part.box_status == 1) {
        part.box_status = 2;
        this.box_Qty++;
      }
      for (let i = 0; i < this.data.parts.length; i++) {
        if (this.data.parts[i].box_status == 2) {
          this.box_part_Qty += Number(this.data.parts[i].real_qty);
        }
      }
    }
  }
  //提交
  save() {
    this.api.post('inventory/PostBoxPart', this.data).subscribe((res: any) => {
      if (res.successful) {
        super.showToast(this.toastCtrl, '盘点成功', 'success');
        setTimeout(() => {
          if (this.navCtrl.canGoBack()) {
            this.navCtrl.popToRoot();
          }
        }, 1000);
      }
      else {
        super.showToast(this.toastCtrl, res.message, 'error');
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BoxDetailsPage');
  }
  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }

  changeQty(part) {
    const real_qty = Number(part.real_qty);
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: 10000,
      receivePieces: real_qty
    });
    _m.onDidDismiss(data => {
      if (data) {
        if (data.receive == 0) {
          super.showToast(this.toastCtrl, '数量不能为0', 'error');
          return;
        }        
        if (part.box_status == 1) {
          this.box_part_Qty += data.receive;
          part.box_status = 2;
          this.box_Qty++;
        } else { 
          this.box_part_Qty = this.box_part_Qty- real_qty + data.receive;
        }
        part.real_qty = data.receive;
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
  //返回
  cancel() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '是否放弃盘点任务？',
      buttons: [{
        text: '取消',
        handler: () => {

        }
      }, {
        text: '确定',
        handler: () => {
          if (this.navCtrl.canGoBack())
            this.navCtrl.pop();
        }
      }]
    });
    prompt.present();
  }
}
