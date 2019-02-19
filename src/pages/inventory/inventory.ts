import {Component, ViewChild} from '@angular/core';
import {
  AlertController,
  IonicPage,
  Searchbar,
  LoadingController,
  NavController,
  NavParams,
  ToastController, ModalController,
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
  org: any;
  data: any = {
    code: null,
    parts: [],
  };

  part_total: number = 0;
  current_part_index: number = -1;

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

  ionViewDidEnter(){
    setTimeout(() => {
      this.searchSheet();
      this.searchbar.setFocus();
    });
  }

  searchSheet() {
    let loading = super.showLoading(this.loadingCtrl,"查询中...");
    if (this.org && this.org.code) {
      this.api.get('inventory/getScanCode', {code: this.org.code}).subscribe((res: any)=>{
        loading.dismissAll();
        debugger;
       if(res.successful){
         this.data = res.data;
         //this.current_part_index = 0;
         this.part_total = this.data.parts.length;
         //debugger;
         //this.current_part = this.data.parts[this.current_part_index];
       }else{
         super.showToast(this.toastCtrl, res.message);
       }
        this.searchbar.setFocus();
      }, err=>{
        alert(err)
        this.searchbar.setFocus();
      });
    }
  }

  searchPart() {
    let err = null;
    if (this.label.length != 19) {
      err = '请扫描正确的零件箱标签';
    } else {
      let prefix = this.label.substr(0, 2).toUpperCase();
      if (prefix != 'LN') {
        err = '无效的扫描，请重试！';
      }else {
        let supplier_num = this.label.substr(2, 9).replace(/(^0*)/, '');
        let part_num = this.label.substr(11, 8).replace(/(^0*)/, '');

        this.current_part_index = this.data.parts.findIndex(p=>p.part_no === part_num && p.supplier_id === supplier_num);

        if(this.current_part_index===-1){
          const prompt = this.alertCtrl.create({
            title: '零件不存在',
            message: "该零件不在盘点单列表中，您确定要添加该零件吗?",
            buttons: [
              {
                text: '忽略',
                handler: () => {}
              },
              {
                text: '我要新增',
                handler: () => {
                  let addModal = this.modalCtrl.create('InventoryAddPartPage', {
                    item: {
                      inventory_id: this.data.id,
                      //plant: this.data.plant,
                      //workshop: this.data.workshop,
                      dloc: null,
                      supplier_id: supplier_num,
                      supplier_name: null,
                      part_no: part_num,
                      part_name: null,
                      part_qty: null,
                      real_qty: null,
                    }
                  });
                  addModal.onDidDismiss(item => {
                    if (item) {
                      this.data.parts.push(item);
                    }
                  });
                  addModal.present();
                }
              }
            ]
          });
          prompt.present();
        }
      }
    }
  }
  get ok_count(){
    let c = 0;
    this.data.parts.forEach((item, index)=>{
      if(item.real_qty || item.real_qty === 0){
        c++;
      }
    });
    return c;
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }
  close(){
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

  get noSubmit() {
    return this.part_total === 0 || this.ok_count < this.part_total;
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
    this.api.get('inventory/getSubmit', {id: this.data.id}).subscribe((res: any)=>{
      if(res.successful){
        super.showToast(this.toastCtrl, '已完成盘点');
        setTimeout(()=>{
          if(this.navCtrl.canGoBack()){
            this.navCtrl.popToRoot();
          }
        }, 1000);
      }else{
        super.showToast(this.toastCtrl, res.message);
      }
    });
  }
}
