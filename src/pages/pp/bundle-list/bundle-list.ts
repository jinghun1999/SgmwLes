import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { BaseUI } from '../../baseUI';
import { Storage } from "@ionic/storage";
import { Api } from '../../../providers';

@IonicPage()
@Component({
  selector: 'page-bundle-list',
  templateUrl: 'bundle-list.html',
})
export class BundleListPage extends BaseUI {
  workshop: string;
  port_no: string;
  bundle_list: any[] = [];
  bundles: any[] = [];
  result: any = {};
  err: string;       //错误提示

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public storage: Storage,
    public api:Api) {
    super();
    this.bundle_list = navParams.get('bundle_list');
    this.port_no = navParams.get('port_no');
  }

  confirm() {
    if (this.bundle_list.length > 0) { 
      for (let i = 0; i <= this.bundle_list.length - 1; i++) {
        this.bundles.push(this.bundle_list[i]);//把接受的参数的赋值给新的list
        this.bundles[i].productionStatus=3;//提交时状态改为3，表示被替换
       }
    }  
    this.api.post('PP/PostFeedingPort', { plant: this.api.plant, workshop: this.workshop, port_no: this.port_no, partPanel: this.bundles }).subscribe((res) => { 
      this.result = res;
    });

    let data = this.result;
    this.viewCtrl.dismiss(data);
  }

  ionViewDidEnter() {
    this.storage.get('WORKSHOP').then((val) => {
      this.workshop = val;
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BundleListPage');
  }

  cancel() { this.viewCtrl.dismiss(); }
}
