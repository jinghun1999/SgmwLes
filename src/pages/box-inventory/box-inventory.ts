import { Component, ViewChild, NgZone } from '@angular/core';
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
  real_qty: number = 0;
  show: boolean= false;
  label: string = '';
  errors: any[] = [];
  new_data_list: any[] = [];
  org: any;
  data: any = {
    code: null,
    parts: [],
  };
  item: any = {
    code: '',
    plant: '',
    workshop: '',
    id: '',
    mode: '',
    belong: '',
    status: '',
    remark: '',
    type: '',
    parts: [],
  };
  part_total: number = 0;
  current_part_index: number = 0;
  current_part: any = null;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private zone: NgZone,
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
      this.searchbar.setFocus();
    });
  }
  insertError = (msg: string, t: string = 'e') => {
    this.zone.run(() => {
      this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    });
  }
  ionViewDidLoad() {
    this.searchSheet();
  }
  searchSheet() {
    let loading = super.showLoading(this.loadingCtrl, "查询中...");
    if (this.org && this.org.code) {
      this.api.get('inventory/GetScanBoxCode', { code: this.org.code }).subscribe((res: any) => {
        loading.dismissAll();
        if (res.successful) {
          this.data = res.data;
          this.item.code = this.data.code;
          this.item.plant = this.data.plant;
          this.item.workshop = this.data.workshop;
          this.item.status = this.data.status;
          this.item.type = this.data.type;
          this.item.id = this.data.id;
          this.item.mode = this.data.mode;
          this.item.remark = this.data.remark;
          this.item.belong = this.data.belong;
          this.part_total = this.data.parts.length;
        } else {
          this.insertError(res.message);
        }
      }, err => {
        loading.dismissAll();
        this.insertError('系统错误，请重试');
      });
    }
    loading.dismissAll();
    this.resetScan();
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
      this.real_qty = this.current_part.real_qty;
      this.sum_box_Qty = 0;
      this.sum_box_partQty = 0;
      if (this.current_part.box_status == 1) {   //扫描并提交操作
        this.current_part.box_status = 2;
        this.item.parts.length = 0;
        this.item.parts.push(this.current_part);
        this.api.post('inventory/PostBoxPart', this.item).subscribe((res: any) => {
          if (res.successful) {
          } else {
            super.showToast(this.toastCtrl, res.message, 'error');
          }
        });
      }

      for (let i = 0; i < this.data.parts.length; i++) {
        if (this.data.parts[i].part_no === this.current_part.part_no && this.data.parts[i].box_status == 2) {
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
    if (this.current_part.real_qty > this.current_part.packing_qty) { 
      this.insertError('数量不能大于包装数量');
      return;
    }
    this.item.parts.length = 0;
    this.item.parts.push(this.current_part);
    this.api.post('inventory/postBoxPart', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('已更新','s');
        this.item.parts.length = 0;
        this.sum_box_partQty = 0;
        this.new_data_list = this.data.parts.filter(p => p.id != this.current_part.id);
        for (let i = 0; i < this.new_data_list.length; i++) {
          if (this.new_data_list[i].part_no === this.current_part.part_no && this.new_data_list[i].box_status == 2) {
            this.sum_box_partQty += Number(this.new_data_list[i].real_qty);
          }
        }
        this.sum_box_partQty += Number(this.current_part.real_qty);
        this.data.parts = this.new_data_list.concat(this.current_part);
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
    this.item.parts.length = 0;
    this.api.get('inventory/GetScanBoxCode', { code: this.data.code }).subscribe((res: any) => {
      for (let i = 0; i < res.data.parts.length; i++) {
        res.data.parts[i].part_no == part_no && this.item.parts.push(res.data.parts[i]);
      }
    });
    let _m = this.modalCtrl.create('BoxDetailsPage', {
      parts: this.item
    });
    _m.onDidDismiss(data => {
      if (data && data.length > 0) {
        this.current_part.real_qty = data.find(f => f.box == this.current_part.box).real_qty;
        this.sum_box_partQty = 0;
        this.new_data_list = this.data.parts.filter(p => p.part_no != data[0].part_no);
        this.data.parts = this.new_data_list.concat(data);
        this.sum_box_partQty = 0;
        this.sum_box_Qty = 0;
        for (let i = 0; i < this.data.parts.length; i++) {
          if (this.data.parts[i].part_no === this.current_part.part_no && this.data.parts[i].box_status == 2) {
            this.sum_box_Qty++;
            this.sum_box_partQty += Number(this.data.parts[i].real_qty);
          }
        }
      }
    });
    _m.present();
  }
  doOK() { //零件盘点完成
    let parts = this.data.parts.filter(p => p.part_no == this.current_part.part_no);
    this.item.parts = parts;
    this.api.post('inventory/PostBoxPart', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.sum_box_Qty = 0;
        this.sum_box_partQty = 0;
        this.insertError('盘点成功','s');
        for (let i = 0; i < this.item.parts.length; i++) { 
          this.sum_box_Qty++;
           this.sum_box_partQty += this.item.parts[i].real_qty;
        }
        this.item.parts.length = 0;
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
  showErr() { 
    this.show = !this.show;
  }
  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
}
