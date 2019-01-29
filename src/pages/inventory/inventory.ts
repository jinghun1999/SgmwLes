import {Component, ViewChild} from '@angular/core';
import {
  AlertController,
  IonicPage,
  Searchbar,
  LoadingController,
  NavController,
  NavParams,
  ToastController,
} from 'ionic-angular';

import {BaseUI} from "../baseUI";
import {Api} from "../../providers";

@IonicPage()
@Component({
  selector: 'page-inventory',
  templateUrl: 'inventory.html'
})
export class InventoryPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  label: string = '';
  data: any = {
    code: null,
    parts: [],
  };

  part_total:number = 0;
  current_part_index: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              private api: Api) {
    super();
  }

  ionViewDidEnter(){
    setTimeout(() => {
      this.searchbar.setFocus();
    });
  }
  search() {
    let loading = super.showLoading(this.loadingCtrl,"查询中...");
    if (this.label) {
      this.api.get('inventory/getScanCode', {code: this.label}).subscribe((res: any)=>{
        loading.dismissAll();
       if(res.successful){
         this.label = '';
         this.data = res.data;
         this.current_part_index = 0;
         this.part_total = this.data.parts.length;
         //debugger;
         //this.current_part = this.data.parts[this.current_part_index];
       }else{
         super.showToast(this.toastCtrl, res.message);
       }
      }, err=>{alert(err)});
    }
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.popAll();
  }
  close(){
    debugger;
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
            this.api.get('inventory/getClose', {id: this.data.id}).subscribe((res: any)=>{
              if(res.successful){
                //已关闭
              }else{
                super.showToast(this.toastCtrl, res.message);
              }
            });
          }
        }
      ]
    });
    prompt.present();
  }

  get rightCount() {
    let a = 0;
    this.data.parts.forEach((item, i) => {
      if (item.real_qty && item.real_qty > 0) {
        a++;
      }
    });
    return a;
  }
  get noSubmit() {
    let c = this.data.parts.some(p => !p.real_qty);
    return this.part_total === 0 || c;
  }
  prev(){
    this.current_part_index > 0 && this.current_part_index--;
  }
  next() {
    this.current_part_index < this.part_total - 1 && this.current_part_index++;
  }

  changeQ(){
    debugger;
    if(!this.data.parts[this.current_part_index].real_qty){
      alert('没有盘点数量');
      return;
    }
    let o = this.data.parts[this.current_part_index];
    let ds = {
      id: o.id,
      supplier_id: o.supplier_id,
      supplier_name: o.supplier_name,
      part_no: o.part_no,
      part_name: o.part_name,
      part_qty: o.part_qty,
      real_qty: o.real_qty,
    }
    this.api.post('inventory/postRealQty', o).subscribe((res: any)=>{
      if(res.successful){
        super.showToast(this.toastCtrl, '已更新');
      }else{
        super.showToast(this.toastCtrl, res.message);
      }
    }, err=>{
      super.showToast(this.toastCtrl, err.message);
    })
  }
  save(){
    debugger;
    this.api.get('inventory/getSubmit', {id: this.data.id}).subscribe((res: any)=>{
      if(res.successful){
        //已关闭
        super.showToast(this.toastCtrl, '已完成盘点');
      }else{
        super.showToast(this.toastCtrl, res.message);
      }
    });
  }
}
