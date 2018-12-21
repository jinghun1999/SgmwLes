import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';

import { SuspiciousProvider } from '../../providers';
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
export class SuspiciousPage {
  item : any;
  list : any[] = [];
  pageNum: number;
  pageSize = 5;
  total: number;
  option=[];
  showNoContent: boolean =false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public susProvider: SuspiciousProvider,
              public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuspiciousPage');
  }

  //获取数据
  ngOnInit(): void {
    this.pageNum = 1;
    this.loadData();
  }
  handleSuccess(result: any){
    if(result.successful && result.data.rows.length==0){
      this.showNoContent=true;
    }
    debugger;
    this.pageNum++;
    this.total=result.data.total;
    this.list.splice(this.list.length, 0, ...result.data.rows);
  }
  handleError(err: any){
    alert('err')
  }

  addItem(){
    //this.navCtrl.push('SuspiciousAddPage');
    let addModal = this.modalCtrl.create('SuspiciousAddPage');
    addModal.onDidDismiss(item => {
      if (item) {
        this.list.unshift(item);
      }
    })
    addModal.present();
  }
  detail(o: any){
    this.navCtrl.push('SuspiciousDetailPage', {item: o });
  }
  loadData(){
    this.susProvider.getSuspiciousPager({page: this.pageNum, size: this.pageSize}
    ).subscribe(
      res=> this.handleSuccess(res),
      error => this.handleError(error)
    );
  }

  doInfinite(event){
    setTimeout(() => {
      console.log('Done');
      event.complete();
      if(this.list.length === this.total){
        event.disabled = true;
      }else {
        this.loadData();
      }
    }, 1000);
  }
}
