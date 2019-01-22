import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, ViewController, ToastController} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

@IonicPage()
@Component({
  selector: 'page-suspicious-add',
  templateUrl: 'suspicious-add.html',
})

export class SuspiciousAddPage extends BaseUI{
  item: any = {
    pack_qty: 1,
    part_qty: 0,
    frag_qty: 0,
  };
  label: string = '';
  issue_choose: any[];
  scan_result: any = {};

  constructor(public navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public viewCtrl: ViewController,
              public storage: Storage,
              public api: Api) {
    super();
  }

  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val)=>{
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getIssue();
    });
  }

  getIssue = () => {
    this.api.get('system/getEnums', {code: 'wm_suspicious_issuesclass'}).subscribe((res: any) => {
      if (res.successful) {
        this.issue_choose = res.data;
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    });
  }


  search(){
    let loading = super.showLoading(this.loadingCtrl,"查询中...");
    this.api.get('suspicious/getScanPart', {plant: this.item.plant, workshop: this.item.workshop,label: this.label}).subscribe((res: any) =>{
      loading.dismiss();
      if(res.successful) {
        this.scan_result = res.data;
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    }, err=>{
      loading.dismiss();
      alert(JSON.stringify(err))
    });
  }

  get part_count() {
    const frag = parseFloat(this.item.frag_qty);
    const c = (frag ? this.item.pack_qty - 1 : this.item.pack_qty) * this.scan_result.packing_qty + frag;
    if (c > this.scan_result.current_parts) {
      return this.scan_result.current_parts;
    } else {
      return c;
    }
  }

  save() {
    this.item.part_qty = this.part_count;
    let err = '';
    if (!this.scan_result.part_no) {
      err += '请先扫描或输入箱标签查询对应零件';
    } else if (!this.part_count) {
      err += '封存总数量不能小于1';
    } else if (!this.item.issue_class){
      err += '请选择问题分类';
    }
    if (err.length) {
      super.showToast(this.toastCtrl, err);
      return;
    }

    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.post('suspicious/post', {
      code: null,
      plant: this.scan_result.plant,
      workshop: this.scan_result.workshop,
      dloc: this.scan_result.dloc,

      supplier: this.scan_result.supplier_id,
      supplier_name: this.scan_result.supplier_name,

      part_no: this.scan_result.part_no,
      part_name: this.scan_result.part_name,
      confirmed: 0,
      pack_std_qty: this.scan_result.packing_qty,
      pack_qty: this.item.pack_qty,
      part_qty: this.item.part_qty,
      frag_qty: this.item.frag_qty,

      status_text_jf: 0,
      status_text_th: 0,

      issue_class: this.item.issue_class,
    }).subscribe((res: any) => {
      loading.dismiss();
      if (res.successful) {
        this.viewCtrl.dismiss(res.data);
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    }, err => {
      loading.dismiss();
      super.showToast(this.toastCtrl, err)
    });
  }

  cancel(){
    this.viewCtrl.dismiss();
  }
}
