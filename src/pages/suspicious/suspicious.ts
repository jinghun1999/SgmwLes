import { Component } from '@angular/core';
import {IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';

import { SuspiciousProvider } from '../../providers';
import {BaseUI} from "../baseUI";
/**
 * Generated class for the SuspiciousPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-suspicious',
  templateUrl: 'suspicious.html',
})
export class SuspiciousPage extends BaseUI {
  item: any;
  list: any = [];
  pageNum: number;
  pageSize = 5;
  total = 0;
  option = [];
  showNoContent: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public susProvider: SuspiciousProvider,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public toastCtrl: ToastController,) {
    super();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousPage');
    this.pageNum = 1;
    this.loadData();
  }

  //获取数据
  ngOnInit(): void {

  }

  handleSuccess(result: any) {

    if (result.successful && result.data.rows.length == 0) {
      this.showNoContent = true;
    }
    debugger;
    this.pageNum++;
    this.total = result.data.total;
    this.list.splice(this.list.length, 0, ...result.data.rows);
  }

  handleError(err: any) {

    //alert(JSON.stringify(err))
  }

  addItem() {
    //this.navCtrl.push('SuspiciousAddPage');
    let addModal = this.modalCtrl.create('SuspiciousAddPage');
    addModal.onDidDismiss(item => {
      if (item) {
        this.list.unshift(item);
      }
    })
    addModal.present();
  }

  detail(o: any) {
    this.navCtrl.push('SuspiciousDetailPage', {item: o});
  }

  loadData() {
    //let loading = super.showLoading(this.loadingCtrl, "正在加载...");
    this.susProvider.getSuspiciousPager({page: this.pageNum, size: this.pageSize}).subscribe(
      res => this.handleSuccess(res),
      error => this.handleError(error)
    );
  }

  doInfinite(event) {
    setTimeout(() => {
      debugger;
      console.log('Done');
      event.complete();
      if (this.list.length === this.total) {
        event.disabled = true;
      } else {
        this.loadData();
      }
    }, 1000);
  }
}
