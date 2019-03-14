import { Component } from '@angular/core';
import {IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseUI} from "../baseUI";
import {Api} from "../../providers";

@IonicPage()
@Component({
  selector: 'page-inventory-list',
  templateUrl: 'inventory-list.html',
})
export class InventoryListPage extends BaseUI {
  item: any;
  list: any = [];
  pageNum: number;
  pageSize = 15;
  total = 0;
  option = [];
  showNoContent: boolean = false;
  loading: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public toastCtrl: ToastController,
              public api: Api) {
    super();
  }

  ionViewDidLoad() {
    this.pageNum = 1;
    this.loading = super.showLoading(this.loadingCtrl, "正在加载...");
    this.loadData();
  }

  detail(o: any) {
    this.navCtrl.push('InventoryPage', {item: o});
  }

  loadData() {
    this.api.get('inventory/getTaskPager', {page: this.pageNum, size: this.pageSize}).subscribe((result: any) => {
        this.loading && this.loading.dismiss();
        if (result.successful && result.data.rows.length == 0) {
          this.showNoContent = true;
        }
        debugger;
        this.pageNum++;
        this.total = result.data.total;
        this.list.splice(this.list.length, 0, ...result.data.rows);
      },
      (error: any) => {
        alert('系统错误，请稍后再试！');
      }
    );
  }

  doInfinite(event) {
    setTimeout(() => {
      event.complete();
      if (this.list.length === this.total) {
        event.disabled = true;
      } else {
        this.loadData();
      }
    }, 1000);
  }
}
