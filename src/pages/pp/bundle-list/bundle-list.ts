import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Searchbar, LoadingController } from 'ionic-angular';
import { BaseUI } from '../../baseUI';
import { Storage } from "@ionic/storage";
import { Api } from '../../../providers';

@IonicPage()
@Component({
  selector: 'page-bundle-list',
  templateUrl: 'bundle-list.html',
})
export class BundleListPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  workshop: string;
  plant: string;
  port_no: string;
  isCancel: boolean = true;// 弹框是否选择"关闭"操作，选择否，返回true
  bundlesCount: number = 0;//个数
  bundle_list: any[] = [];
  result: any = {}; //提交后返回的结果  

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public api: Api) {
    super();
    this.bundle_list = navParams.get('bundle_list');//捆包号列表
    this.port_no = navParams.get('port_no');//上料口
    this.workshop = navParams.get("workshop").toString();//车间
    this.plant = navParams.get('plant').toString();//工厂
  }

    confirm() {
        let res = {"successful":true};
        this.viewCtrl.dismiss(res);
    // let loading = super.showLoading(this.loadingCtrl, '提交中...');
    // this.api.post('PP/PostFeedingPort', { plant: this.plant, workshop: this.workshop, portNo: this.port_no, partPanel: this.bundle_list }).subscribe((res) => {      
    //   this.viewCtrl.dismiss(res);   
    //   loading.dismiss();
    // }, error => { 
    //     this.viewCtrl.dismiss(error); 
    //     loading.dismiss();  
    // }     
    // );
  }
  cancel() {
    let data = { 'isCancel': this.isCancel };
    this.viewCtrl.dismiss(data);
  }
}
