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
  selector: 'page-box-inventory',
  templateUrl: 'box-inventory.html',
})
export class BoxInventoryPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  sum_box_Qty: number = 0;//累计实盘箱数
  sum_box_partQty: number = 0;//累计实盘件数
  label: string = '';
  org: any;
  data: any = {
    code: null,
    parts: [],
  };

  part_total: number = 0;
  current_part_index: number = 0;
  current_part: any = null;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private api: Api) {
    super();
    this.org = navParams.get('item');
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchSheet();
      this.searchbar.setFocus();
    });
  }

  searchSheet() {
    let loading = super.showLoading(this.loadingCtrl, "查询中...");
    if (this.org && this.org.code) {
      this.api.get('inventory/GetScanBoxCode', { code: this.org.code }).subscribe((res: any) => {
        loading.dismissAll();
        if (res.successful) {
          this.data = res.data;
          this.part_total = this.data.parts.length;
        } else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
        this.resetScan();
      }, err => {
        super.showToast(this.toastCtrl, '系统错误，请重试', 'error');
      });
    }
  }

  searchPart() {
    let err = '';
    if (!this.label.length) {
      err = '请扫描正确的零件标签';
    }
    if (err.length) {
      super.showToast(this.toastCtrl, err, 'error');
      this.resetScan
        ();
      return;
    }
    this.current_part = this.data.parts.find(p => p.box === this.label);

    if (this.current_part) {
      if (this.current_part.box_status == 1) {   //扫描并提交操作
        this.current_part.box_status = 2;
        let part = this.data;
        part.parts.length = 0;
        part.parts.push(this.current_part);
        this.api.post('inventory/PostBoxPart', part).subscribe((res: any) => {
          if (res.successful) {
            this.api.get('inventory/GetScanBoxCode', { code: this.org.code }).subscribe((result: any) => {
              if (result.successful) {
                this.data = result.data;
              }
              else {
                super.showToast(this.toastCtrl, result.message, 'error');
              }
            });
          } else {
            super.showToast(this.toastCtrl, res.message, 'error');
          }
        });
      }
      this.sum_box_Qty = 0;
      this.sum_box_partQty = 0;
      for (let i = 0; i < this.data.parts.length; i++) {
        if (this.data.parts[i].part_no == this.current_part.part_no&&this.data.parts[i].box_status==2) {
          this.sum_box_Qty++;
          this.sum_box_partQty += Number(this.data.parts[i].real_qty);
        }
      }
      this.resetScan();
    }
    else {
      super.showToast(this.toastCtrl, '该零件不在盘点单列表中', 'error');
    }
  }
  get ok_count() {
    let c = 0;
    this.data.parts.forEach((item, index) => {
      if (item.real_qty || item.real_qty === 0) {
        c++;
      }
    });
    return c;
  }

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

  close() {
    const prompt = this.alertCtrl.create({
      title: '关闭盘点单',
      message: "关闭后该盘点单将不能再继续盘点，您确定要关闭吗?",
      buttons: [
        {
          text: '不要',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: '确认关闭',
          handler: () => {
            this.api.get('inventory/getClose', { id: this.data.id }).subscribe((res: any) => {
              if (res.successful) {
                //已关闭
                super.showToast(this.toastCtrl, '已关闭该盘点单', 'success');
                this.resetScan();
                this.data = {
                  code: null,
                  parts: [],
                };
                this.part_total = 0;
              } else {
                super.showToast(this.toastCtrl, res.message, 'error');
              }
            });
          }
        }
      ]
    });
    prompt.present();
  }

  get noSubmit() {
    return this.part_total === 0 || this.ok_count < this.part_total;
  }
  prev() {
    this.current_part_index > 0 && this.current_part_index--;
  }
  next() {
    this.current_part_index < this.part_total - 1 && this.current_part_index++;
  }

  changeQ() {
    if (!this.current_part.real_qty) {
      super.showToast(this.toastCtrl, '没有盘点数量', 'error');
      return;
    }
    this.data.parts.length = 0;
    this.data.parts.push(this.current_part);
    this.api.post('inventory/postBoxPart', this.data).subscribe((res: any) => {
      if (res.successful) {
        super.showToast(this.toastCtrl, '已更新', 'success');
        this.api.get('inventory/GetScanBoxCode', { code: this.org.code }).subscribe((result: any) => {
          if (result.successful) {
            this.data = result.data;
            this.sum_box_Qty = 0;
            this.sum_box_partQty = 0;
            for (let i = 0; i < this.data.parts.length; i++) {
              if (this.data.parts[i].part_no === this.current_part.part_no && this.data.parts[i].box_status==2) {
                this.sum_box_Qty ++;
                this.sum_box_partQty += Number(this.data.parts[i].real_qty);
              }
            }
          }
          else {
            super.showToast(this.toastCtrl, result.message, 'error');
          }
        });
      } else {
        super.showToast(this.toastCtrl, res.message, 'error');
      }
    }, err => {
      super.showToast(this.toastCtrl, err.message, 'error');
    })
  }

  //确认提交
  showConfirm(type) {
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
          if (type == 1) {
            this.doOK();
          }
          else if (type == 2) {
            this.save();
          }
        }
      }]
    });
    prompt.present();
  }

  //提交
  save() {
    this.api.get('inventory/getBoxSubmit', { id: this.data.id }).subscribe((res: any) => {
      if (res.successful) {
        super.showToast(this.toastCtrl, '已完成盘点', 'success');
        setTimeout(() => {
          if (this.navCtrl.canGoBack()) {
            this.navCtrl.popToRoot();
          }
        }, 1000);
      } else {
        super.showToast(this.toastCtrl, res.message, 'error');
      }
    });
  }
  //查询箱明细
  doDetailed(part_no) {
    let parts = [];
    this.api.get('inventory/GetScanBoxCode', { code: this.data.code }).subscribe((res: any) => {
      for (let i = 0; i < res.data.parts.length; i++) {
        res.data.parts[i].part_no == part_no && parts.push(res.data.parts[i]);
      }
    });
    let part = this.data;
    part.parts = [];
    part.parts = parts;
    this.navCtrl.push('BoxDetailsPage', { parts: part });
  }
  doOK() { //零件盘点完成
    for (let i = 0; i < this.data.parts.length; i++) {
      this.data.parts[i].box_status = 2;
    }
    this.api.post('inventory/PostBoxPart', this.data).subscribe((res: any) => {
      if (res.successful) {
        this.current_part_index = 0;
        this.current_part = null;
        super.showToast(this.toastCtrl, '盘点成功', 'success');
      }
      else {
        super.showToast(this.toastCtrl, res.message, 'error');
      }
    });
  }
  resetScan() {
    setTimeout(() => {
      this.label = '';
      this.searchbar.setFocus();
    }, 500);
  }
  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
}
