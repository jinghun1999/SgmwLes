import { Component, NgZone, ViewChild } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavParams,
  ToastController,
  NavController,
  AlertController,
  ActionSheetController,
  ModalController,
  Searchbar
} from 'ionic-angular';
import { Api } from '../../../providers';
import { BaseUI } from '../../baseUI';
import { fromEvent } from "rxjs/observable/fromEvent";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-sheet-panel',
  templateUrl: 'sheet-panel.html',
})
export class SheetPanelPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  bundle_no: string;  //扫描的上料口或者捆包号
  scanCount: number;//总共扫描的数量
  isSave: boolean = true;//禁止提交按钮多次提交，true禁止，false显示
  barTextHolderText: string = '扫描捆包号，光标在此处';
  workshop: string;
  item: any = {  //提交对象
    plant: '',
    source: '',
    target: '',
    bundles: [],
  };
  workshop_list: any[] = []; //页面加载时获取车间列表，选中的就是item的target
  keyPressed: any;
  errors: any[] = [];
  constructor(public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public api: Api,
    public zone: NgZone,
    public actionSheet: ActionSheetController,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public storage: Storage
  ) {
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
        this.save();
        break;
    }
  }
  ionViewDidEnter() {
    setTimeout(() => {
      this.addkey();
      this.searchbar.setFocus();
    });
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
  insertError = (msg: string, t: string = 'e') => {
    this.zone.run(() => {
      this.errors.splice(0, 1, { message: msg, type: t, time: new Date() });
    });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.workshop = val;
      this.getWorkshops();
    });
  }
  private getWorkshops() {
    this.api.get('system/GetSheetPlants', { plant: this.api.plant }).subscribe((res: any) => {
      if (res.successful) {
        this.workshop_list = res.data;
        let model = this.workshop_list.find((w) => w.isSelect);
        model ? this.item.target = model.value : this.item.target = this.workshop_list[0].value;
      }
    },
      err => {
        this.insertError('获取车间失败');
      });
  }
  //开始扫描
  scan() {
    if (this.checkScanCode()) {
      //扫捆包号
      this.scanSheet();
    }
    else {
      this.resetScan();
    }
  }
  //显示错误信息列表
  openErrList(e) {
    console.log(e.target);
  }
  //校验扫描
  checkScanCode() {
    let err = '';
    if (!this.bundle_no) {
      err = '请扫描捆包号！';
      this.insertError(err);
    }
    if (this.item.bundles.findIndex(p => p.bundleNo === this.bundle_no) >= 0) {
      err = `${this.bundle_no}已扫描，请扫描其他捆包号`;
      this.insertError(err);
    }

    if (err.length) {
      this.searchbar.setFocus();
      return false;
    }
    return true;
  }
  //扫描执行的过程
  scanSheet() {
    this.errors = [];
    this.api.get('PP/GetSheetPanelMaterial', { plant: this.api.plant, workshop: this.workshop, bundle_no: this.bundle_no }).subscribe((res: any) => {
      if (res.successful) {
        let model = res.data;
        if (this.item.bundles.findIndex(p => p.bundleNo === model.bundle_no) >= 0) {
          err = `${model.bundle_no}已扫描，请扫描其他捆包号`;
          this.insertError(err);
          return;
        }

        this.item.bundles.splice(0, 0, model);
      }
      else {
        this.insertError(res.message);        
        this.item.bundles.length > 0 ? this.isSave = false : null;
      }
    },
      err => {
        this.insertError('系统级别错误');        
        this.item.bundles.length > 0 ? this.isSave = false : null;
      });
    this.resetScan();
  }

  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.actualReceivePieces,
    });
    _m.onDidDismiss(data => {
      if (data) {
        model.actualReceivePieces = data.receive
      }
    });
    _m.present();
  }

  //撤销操作
  cancel() {
    if (this.item.bundles.length > 0) {
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
    }
    else {

    }
  }
  //撤销
  cancel_do() {
    this.insertError('正在撤销...');
    this.bundle_no = '';
    this.item.bundles = [];
    this.insertError("撤销成功");
    //this.errors = [];
    this.resetScan();
  }
  //删除
  delete(i) {
    this.item.bundles.splice(i, 1);
    this.resetScan();
  }
  //手工调用，重新加载数据模型
  resetScan() {
    this.bundle_no = '';
    this.searchbar.setFocus();
  }
  //提交
  save() {
    if (!this.item.bundles.length) {
      this.insertError('请先扫描捆包号');
      return;
    };
    this.isSave = true;
    this.api.post('PP/PostSheetPanelMaterial', {
      plant: this.api.plant,
      workshop: this.workshop,
      target: this.item.target,
      partPanel: this.item.bundles
    }).subscribe((res: any) => {
      if (res.successful) {
        this.item.bundles = [];

        this.insertError('提交成功', 's')
      }
      else {
        this.insertError(res.message);
        this.item.bundles.length > 0 ? this.isSave = false : this.isSave = true;
      }
    },
      err => {
        this.insertError('提交失败');
        this.item.bundles.length > 0 ? this.isSave = false : this.isSave = true;
      });
    this.resetScan();
  }
  //修改带T的时间格式
  dateFunction(time:string) {
    // var zoneDate = new Date(time).toJSON();
    // var date = new Date(+new Date(zoneDate) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
    let date = time.replace(/T/g, " ");    
    return date;
  }
  focusInput = () => {
    this.searchbar.setElementClass('bg-red', false);
    this.searchbar.setElementClass('bg-green', true);
  };
  blurInput = () => {
    this.searchbar.setElementClass('bg-green', false);
    this.searchbar.setElementClass('bg-red', true);
  };
}
