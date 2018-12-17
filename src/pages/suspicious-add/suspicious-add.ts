import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, ToastController} from 'ionic-angular';
//import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
  plant_choose: any[];
  issue_choose: any[];
  workshop_choose: any[];
  supplier_choose: any[];

  current_supplier: any = {};

  constructor(public navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public api: Api) {
    super();
  }

  ionViewDidLoad() {
    let loading = super.showLoading(this.loadingCtrl,"正在初始化...");
    setTimeout(()=>{
      this.api.get('system/getPlants').subscribe((res: any) =>{
        loading.dismiss();
          if(res.successful) {
            debugger
            this.plant_choose = res.data;
            this.item.plant = res.data[0].value;

            this.workshop_choose = res.data[0].children;
            this.item.workshop = res.data[0].children[0].value;
          }else{

          }
        },
        err=>{
          loading.dismiss();alert(JSON.stringify(err))
      });

      this.api.get('system/getEnums', {code: 'wm_suspicious_issuesclass'}).subscribe((res: any) =>{
          if(res.successful) {
            this.issue_choose = res.data;
          }
        },
        err=>{
          loading.dismiss();alert(JSON.stringify(err))
        });
    });
  }

  changePlant(event){
    const list = this.plant_choose.find(x => x.value === this.item.plant);
    this.workshop_choose = list.children;
    this.item.workshop= this.workshop_choose[0].value;
  }

  search(){
    let loading = super.showLoading(this.loadingCtrl,"查询中...");
    this.api.get('suspicious/GetPart', {plant: this.item.plant, workshop: this.item.workshop, part_no: this.item.part_no}).subscribe((res: any) =>{
        loading.dismiss();
        if(res.successful) {
          this.supplier_choose = res.data
          //this.current_supplier = res.data[0];
          //this.item.supplier = this.current_supplier.supplier_name;
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
      }, err=>{
      loading.dismiss();
      alert(JSON.stringify(err))
    });
  }

  changeSupplier(event){
    this.current_supplier = this.supplier_choose.find(x => x.supplier_id === this.item.supplier);
  }
  get part_count(){
    const c = this.item.pack_qty * this.current_supplier.pack_std_qty + parseFloat(this.item.frag_qty);
    if(c > this.current_supplier.parts){
      return this.current_supplier.parts;
    }else{
      return c;
    }
  }

  save() {
    this.item.part_qty = this.part_count;

    let loading = super.showLoading(this.loadingCtrl,"提交中...");
    this.api.get('suspicious/post', this.item).subscribe((res: any) =>{
      loading.dismiss();
      if(res.successful) {
        this.supplier_choose = res.data
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    }, err=>{
      loading.dismiss();
      super.showToast(this.toastCtrl, err)
    });
  }
}
