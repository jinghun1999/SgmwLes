import { Component, NgZone, ViewChild } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavParams,
  ToastController,
  NavController,
  AlertController,
  ModalController,
  Searchbar
} from 'ionic-angular';
import { Api } from '../../../providers';
import { BaseUI } from '../../baseUI';
import { fromEvent } from "rxjs/observable/fromEvent";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-parts-storage-in',
  templateUrl: 'parts-storage-in.html',
})
export class PartsStorageInPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
  keyPressed: any;
  isSave: boolean = true; //防止重复提交，true禁用提交
  workshop_list: any[] = [];//加载获取的的车间列表
  scanCount: number = 0;//记录扫描总数
  errors: any[] = [];
  item: any = {
    plant: '',
    workshop: '',  //源车间
    target: '', //目标仓库
    parts: [],
  };
  constructor(public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public api: Api,
    private zone: NgZone,
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
    this.api.get('system/getPlants', { plant: this.api.plant }).subscribe((res: any) => {
      if (res.successful) {
        this.workshop_list = res.data;
        this.item.target = this.item.workshop;
      } else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('系统级别错误，请返回重试');
      });
  }

  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.code=='') {
      err = '请扫描料箱号！';
      this.insertError(err);
    }

    if (this.item.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
      err = `料箱${this.code}已扫描过，请扫描其他标签`;
      this.insertError(err);
    }

    if (err.length > 0) {
      this.searchbar.setFocus();
      return false;
    }
    return true;
  }


  //开始扫描
  scan() {
    if (this.checkScanCode()) {
      //扫料箱号
      this.scanSheet();
    }
    else {
      this.resetScan();
    }
  }
  //扫描执行的过程
  scanSheet() {
    this.api.get('PP/GetPartsStorageIn', { plant: this.api.plant, workshop: this.item.workshop, box_label: this.code }).subscribe((res: any) => {
      if (res.successful) {
        if (this.item.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
          this.insertError(`料箱${this.code}已扫描过，请扫描其他标签`);
          return;
        }
        let model = res.data;
        this.item.parts.splice(0, 0, model);
        this.scanCount = this.item.parts.length;
        this.scanCount > 0 ? this.isSave = false :null;
      }
      else {
        this.insertError(res.message,'i');
      }
    },
      err => {
        this.insertError('扫描失败');
      });
    this.resetScan();
  }

  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.packingQty,
    });
    _m.onDidDismiss(data => {
      if (data) {
        model.packingQty = data.receive
      }
    });
    _m.present();
  }

  cancel() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销刚才本次的操作记录，不可恢复。您确认要执行全单撤销操作吗？',
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

  //撤销
  cancel_do() {
    this.insertError('正在撤销...');
    this.code = '';
    this.errors = [];
    this.item.parts = [];
    this.insertError("撤销成功");
    this.resetScan();
  }

  //删除
  delete(i) {
    this.item.parts.splice(i, 1);
  }
  //手工调用，重新加载数据模型
  resetScan() { 
    setTimeout(() => {
      this.code = '';
      this.searchbar.setFocus();
     });           
  }
  //提交
  save() {
    if (!this.item.parts) {
      this.insertError('请先扫描料箱号');
      return;
    };

    if (new Set(this.item.parts).size !== this.item.parts.length) {
      this.insertError("提交的数据中存在重复的料箱号，请检查！");
      return;
    };

    // if (this.item.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
    //   err = `料箱${this.code}已扫描过，请扫描其他标签`;
    //   this.insertError(err);
    // }
    this.isSave = true;
    this.api.post('PP/PostPartsStorageIn', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('提交成功');
        this.item.parts = [];        
      }
      else {
        this.insertError(res.message); 
        this.scanCount > 0 ? this.isSave = false : null;//抛异常没有清空明细，所以仍可继续提交，
      }
    },
      err => {
        this.insertError('提交失败');
        this.scanCount > 0 ? this.isSave = false : null;
      });
    this.resetScan();
  }
  //下拉框改变
  changWS(target: string) {    
    this.item.parts = [];
    this.resetScan();
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
