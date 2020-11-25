import { Component, ViewChild, NgZone } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams, Searchbar,
  ToastController
} from 'ionic-angular';
import { BaseUI } from '../../baseUI';
import { Api } from '../../../providers';
import { Storage } from "@ionic/storage";
import { fromEvent } from "rxjs/observable/fromEvent";

@IonicPage()
@Component({
  selector: 'page-panel-feed',
  templateUrl: 'panel-feed.html',
})
export class PanelFeedPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  fetching: boolean = false;                 //记录扫描编号
  barTextHolderText: string = '扫描上料口/产线，光标在此处';   //扫描文本框placeholder属性
  feedPort_list: any[] = [];
  workshop_list: any[] = [];
  target: any;                    //上料口选项
  code: string='';                    //扫描的号码
  isPanelFeed: boolean = false; //判断扫描的是否为上料口，
  item: any = {
    plant: '',                            //工厂
    workshop: '',                         //车间
    port_no: '',                         //选择的上料口
    partPanel: []                          //提交的捆包号列表
  };
  keyPressed: any;
  errors: any[] = [];
  constructor(public navParams: NavParams,
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private zone: NgZone,
    public api: Api,
    public modalCtrl: ModalController,
    public storage: Storage) {
    super();
  }

  keyDown(event) {
    switch (event.keyCode) {
      case 112:
        //f1
        this.cancel();
        break;
      case 113:
        //f2
        this.panelSubmit();
        break;
    }
  }
  ionViewDidEnter() {
    this.addkey();
  }
  ionViewWillUnload() {
    this.removekey();
  }
  addkey = () => {
    this.keyPressed = fromEvent(document, 'keydown').subscribe(event => {
      this.keyDown(event);
    });
  }
  removekey = () => {
    this.keyPressed.unsubscribe();
  }
  insertError = (msg: string, t: number = 0) => {
    this.zone.run(() => {
      this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getWorkshops();
    });
  }

  private getWorkshops() {
    this.target = this.storage.get('port_no');
    if (!this.target) { 
      this.item.port_no = this.target;
    }
    let no = '3425253'; ///模拟数据
    this.api.get('PP/GetFeedingPort', { plant: this.api.plant, workshop: this.item.workshop, port_no: no }).subscribe((res: any) => {
      if (res.successful) {
        this.feedPort_list.push(res.data);
        this.target = this.feedPort_list[0].portNo;
      } else {
        this.insertError(res.message);
      }
      this.setFocus();
    },
      err => {
        this.insertError('系统级别错误');
        this.setFocus();
      });
  }

  //扫描
  scan() {
    let err = '';
    if (!this.code || this.code.length == 0) {
      err = '无效的上料口/产线，请重新扫描';
    }

    if (this.item.partPanel.findIndex(p => p.bundleNo===this.code) >= 0) {
      err = this.code +'已在扫描列表，不能重复扫描';
    }

    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }

    //扫描的过程
    this.api.get('PP/GetFeedingPort', {
      plant: this.item.plant,
      workshop: this.item.workshop,
      port_no: this.code
    }).subscribe((res: any) => {
      if (res.successful) {
        let bundle = res.data;
        if (bundle.part) {  //上料口包含捆包号，弹框显示关联的捆包号列表
          this.item.port_no = this.target;
          let _m = this.modalCtrl.create('BundleListPage', {
            bundle_list: bundle.part,
            port_no: this.item.port_no
          });
          _m.onDidDismiss(data => {
            console.log(data);            
          });
          _m.present();
        }
        else {  //上料口没有捆包号       
          this.item.partPanel.splice(0, 0, {
            type: bundle.type,
            plant: bundle.plant,
            workshop: bundle.workshop,
            portNo: bundle.portNo,
            portName: bundle.portName,
            productionStatus: bundle.productionStatus,
            bundleNo: bundle.bundleNo,
            weight: bundle.weight,
            pieces: bundle.pieces,
            actualReceivePieces: bundle.actualReceivePieces,
            sapNo: bundle.sapNo,
            sapOrderNo: bundle.sapOrderNo
          });          
        };
      } else {
        this.insertError(res.message);
      }
    },
      (error) => {
        this.insertError('系统级别错误');
      });
      this.setFocus();
  }

  //index是当前元素下标，tindex是拖动到的位置下标。
  moveItem = (arr, index, tindex) => {
    //如果当前元素在拖动目标位置的下方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素，
    //我们再把数组之前的那个拖动的元素删除掉，所以要len+1
    if (index > tindex) {
      arr.splice(tindex, 0, arr[index]);
      arr.splice(index + 1, 1)
    }
    else {
      //如果当前元素在拖动目标位置的上方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置+1的地方新增一个和当前元素值一样的元素，
      //这时，数组len不变，我们再把数组之前的那个拖动的元素删除掉，下标还是index
      arr.splice(tindex + 1, 0, arr[index]);
      arr.splice(index, 1)
    }
  }
 

  //提交
  panelSubmit() {
    if (this.fetching) {
      this.insertError('正在提交，请耐心等待，不要重复提交...', 1);
      return;
    }
    let err = '';
    if (!this.target) {
      err = '请先选择冲压线';
      this.insertError(err);
    }
    else { 
      this.storage.set('port_no',this.target);
    }
    if (!this.item.partPanel.length) {
      err = '请先扫描上料数据';
      this.insertError(err);
    }
    if (err.length) {
      this.setFocus();
      return;
    }
    
    this.item.port_no = this.target;
    this.insertError('正在提交，请稍后...', 1);
    this.fetching = true;
    this.api.post('PP/PostFeedingPort', this.item).subscribe((res: any) => {
      this.fetching = false;
      if (res.successful) {
        this.item.partPanel = [];
        this.errors = [];
        if (res.message) {
          this.insertError(res.message);
        } else {
          this.insertError('提交成功', 1);
        }
      } else {
        this.insertError(res.message);
      }      
    },
      (error) => {
        this.fetching = false;
        this.insertError('系统级别错误');
      });
    this.setFocus();
  }
  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }

  setFocus() {
    this.code = '';
    this.searchbar.setFocus();
  }
}
