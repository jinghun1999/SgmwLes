import { Component, ViewChild, NgZone } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  AlertController,
  NavParams, Searchbar,
  ToastController
} from 'ionic-angular';
import { BaseUI } from '../../baseUI';
import { Api } from '../../../providers';
import { Storage } from "@ionic/storage";
import { fromEvent } from "rxjs/observable/fromEvent";
import { BundlePage } from '../bundle/bundle';

@IonicPage()
@Component({
  selector: 'page-panel-feed',
  templateUrl: 'panel-feed.html',
})
export class PanelFeedPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  barTextHolderText: string = '扫描上料口/产线，光标在此处';   //扫描文本框placeholder属性
  feedPort_list: any[] = [];  //上料口选项
  bundles: any[] = []; //提交时的临时表，bundles.push(item.partPanel),为了修改productionStatus的值
  isScan: boolean = true;//是否可扫描
  isSave: boolean = true;    //是否可提交
  code: string = '';                    //扫描的上料口或捆包号
  item: any = {
    plant: '',                            //工厂
    workshop: '',                         //车间
    portNo: '',                         //选择的上料口
    partPanel: []                          //提交的捆包号列表
  };
  keyPressed: any;
  errors: any[] = [];
  constructor(public navParams: NavParams,
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private zone: NgZone,
    public alertCtrl: AlertController,
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
    // this.zone.run(() => {
    //   this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    // });
    this.errors.splice(0, 1, { message: msg, type: t, time: new Date() });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getWorkshops();
    });
  }


  private getWorkshops() {
    this.api.get('PP/GetPortNo', { plant: this.api.plant, workshop: this.item.workshop }).subscribe((res: any) => {
      console.log(res);
      if (res.successful) { //start if
        this.feedPort_list = res.data;
        this.storage.get('PortNo').then((val) => {//从缓存中获取数据，
          if (val) {
            this.item.portNo = this.feedPort_list.find((f) => f.portNo = val).portNo;
          } else {
            if (this.feedPort_list.find((f) => f.isSelect)) {
              this.item.portNo = this.feedPort_list.find((f) => f.isSelect).portNo;
            }
            else { 
              this.item.portNo = this.feedPort_list[0].portNo;
            }            
          }
        });
      } else { //end if
        this.insertError(res.message);
      }
    }), err => {
      this.insertError("系统级别错误");
    };
    this.setFocus();
  }

  //扫描
  scan() {
    let err = '';
    if (!this.code) {
      err = '无效的上料口/产线，请重新扫描';
    }
    if (this.item.partPanel.findIndex(p => p.bundleNo === this.code) >= 0) {
      err = this.code + '已在扫描列表，不能重复扫描';
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    if (!this.isScan) {
      this.insertError("正在扫描，请耐心等待...");
      return;
    }
    this.isScan = !this.isScan;
    //扫描的过程
    this.api.get('PP/GetFeedingPort', {
      plant: this.item.plant,
      workshop: this.item.workshop,
      port_no: this.code
    }).subscribe((res: any) => {
      if (res.successful) {
        let bundle = res.data;
        if (bundle.part && bundle.part.length > 0) {  //part有值，说明扫描的是上料口
          this.item.portNo = this.code;
          let _m = this.modalCtrl.create('BundleListPage', {
            plant: this.api.plant,
            workshop: this.item.workshop,
            bundle_list: bundle.part,
            port_no: this.item.portNo
          });
          _m.onDidDismiss(data => {
            this.toastCtrl.create({
              message: '提交成功',
              duration: 1500,
              position: 'buttom'
            }).present();
          });
          _m.present();

          this.storage.set('PortNo', this.feedPort_list.find((f) => f.portNo == this.code).portNo);
        }
        else {  //上料口没有捆包号，说明是扫描的是捆包号
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
        this.insertError(this.code + res.message);
      };
      this.isScan = true;
    },
      (error) => {
        this.insertError('系统级别错误');
      });
    this.setFocus();
  }
  //显示错误信息列表
  openErrList(e) {
    console.log(e.target);
  }

  //提交
  panelSubmit() {
    let err = '';
    if (!this.item.portNo) {
      err = '请先选择冲压线';
      this.insertError(err);
    }
    if (this.item.partPanel.length == 0) {
      err = '请先扫描上料口或捆包号';
      this.insertError(err);
    }
    if (err.length) {
      this.setFocus();
      return;
    }
    if (!this.isSave) {
      this.insertError('正在提交，请耐心等待，不要重复提交...', 1);
      return;
    }
    this.isSave = false;

    for (let i = 0; i <= this.item.partPanel.length - 1; i++) {
      this.bundles.push(this.item.partPanel[i]);//赋值给新的容器
      this.bundles[i].productionStatus = 3;//提交把状态改为3，表示被替换
    }

    this.api.post('PP/PostFeedingPort', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.item.partPanel = [];
        this.errors = [];
        this.toastCtrl.create({
          message: '提交成功',
          duration: 1500,
          position: 'buttom'
        }).present();
        //把选中的冲压线写入缓存，下次默认选中
        this.storage.set('PortNo', this.feedPort_list.find((f) => f.portNo == this.item.portNo).portNo);

      } else {
        this.insertError(res.message);
      }
    },
      (error) => {
        this.insertError('系统级别错误');
      });
    this.isSave = true;//提交完成，设置可重新扫描
    this.setFocus();
  }
  //撤销操作
  cancel() {
    //if (this.item.partPanel.length > 0) {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销本次的操作记录,您确认要执行撤销操作吗？',
      buttons: [{
        text: '不撤销',
        handler: () => { }
      }, {
        text: '确认撤销',
        handler: () => {
          this.cancel_do();
        }
      }]
    });
    prompt.present();
    //}
    // else { 
    //   this.navCtrl.popToRoot();
    // }
  }
  //撤销
  cancel_do() {
    this.insertError('正在撤销...', 2);
    this.bundles = [];
    this.item.partPanel = [];
    this.storage.set('PortNo', null);
    this.insertError("撤销成功");
    this.errors = [];
    this.setFocus();
  }
  setFocus() {
    this.code = '';
    this.searchbar.setFocus();
  }
}
