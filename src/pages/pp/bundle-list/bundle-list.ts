import { Component,ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,Searchbar } from 'ionic-angular';
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
  bundle_list: any[] = [];
  bundles: any[] = [];
  result: any = {}; //提交后返回的结果
  

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public storage: Storage,
    public api:Api) {
    super();
    this.bundle_list = navParams.get('bundle_list');//捆包号列表
    this.port_no = navParams.get('port_no');//上料口
    this.workshop = navParams.get("workshop").toString();//车间
    this.plant = navParams.get('plant').toString();//工厂
  }

  confirm() {
    if (this.bundle_list.length > 0) { 
      for (let i = 0; i <= this.bundle_list.length - 1; i++) {
        this.bundles.push(this.bundle_list[i]);//把接受的参数的赋值给新的list
        this.bundles[i].productionStatus=3;//提交时状态改为3，表示被替换
       }
    }  
    this.api.post('PP/PostFeedingPort', { plant: this.plant, workshop: this.workshop, portNo: this.port_no, partPanel: this.bundles }).subscribe((res) => { 
      
      this.viewCtrl.dismiss(res);
    });
    //this.viewCtrl.dismiss(this.result);
  }

  ionViewDidEnter() {
    
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BundleListPage');
  }

  cancel() { this.viewCtrl.dismiss(); }
}
