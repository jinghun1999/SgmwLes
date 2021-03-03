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
  selector: 'page-suspicious',
  templateUrl: 'suspicious.html',
})
export class SuspiciousPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
  keyPressed: any;
  show: boolean = false;
  workshop_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  item: any = {
    InOut: 1,
    plant: '',
    workshop: '',
    target: '',
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
    this.api.get('system/getPlants', {InOut:this.item.InOut, plant: this.api.plant }).subscribe((res: any) => {
      if (res.successful) {
        this.workshop_list = res.data;
      } else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('获取车间列表失败');
      });
  }
 //确认提交
 showConfirm() { 
  let prompt = this.alertCtrl.create({
    title: '操作提醒',
    message: '是否确定要提交？',
    buttons: [{
      text: '取消',
      handler: () => {
        
       }
    }, {
      text: '确定',
      handler: () => {
        this.save();
      }
    }]
  });
  prompt.present();
}
showErr() { 
  this.show = !this.show;
}
  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.code == '') {
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
    this.api.get('PP/GetSuspiciousInOut', { plant: this.api.plant, workshop: this.item.workshop, box_label: this.code,InOut:this.item.InOut }).subscribe((res: any) => {
      if (res.successful) {
        if (this.item.parts.findIndex(p => p.boxLabel === res.data.boxLabel) >= 0) {
          this.insertError(`料箱${res.data.boxLabel}已扫描过，请扫描其他标签`);
          return;
        }
        let model = res.data;
        this.item.parts.splice(0, 0, model); 
      }
      else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('扫描失败,'+err);
      });
    this.resetScan();
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
    this.item.parts.length=0;
    this.insertError("撤销成功");
    this.resetScan();
  }

  //删除
  delete(i) {
    this.item.parts.splice(i, 1);
  }
  //手工调用，重新加载数据模型
  resetScan() {
    this.code = '';
    this.searchbar.setFocus();
  }
  //提交
  save() {
    if (this.item.parts.length==0) {
      this.insertError('请先扫描料箱号');
      return;
    };

    if (new Set(this.item.parts).size !== this.item.parts.length) {
      this.insertError("提交的数据中存在重复的料箱号，请检查！");
      return;
    };

    let loading = super.showLoading(this.loadingCtrl,'提交中...');
    this.api.post('PP/PostSuspiciousInOut', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('提交成功', 's');
        this.item.parts.length=0;
      }
      else {
        this.insertError(res.message);
      }
      loading.dismiss()
    },
      err => {
      loading.dismiss()
      this.insertError('提交失败');
      });
    this.resetScan();
  }
  //移入或者移出返修区，value=1移入，value=0移出
  inOrOutRepair(value) { 
    this.item.InOut = value;
     this.item.parts.length = 0;
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