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
  selector: 'page-close-frame',
  templateUrl: 'close-frame.html',
})
export class CloseFramePage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
  workshop: string; //初始化获取的车间
  keyPressed: any;
  canYa: number = 0;//合框数 因为目标料箱可合框数不可能为负数
  partNo: string = '';//零件号
  show: boolean = false;
  parts: any[] = [];   //提交的料箱集合
  isSource: boolean = true; //true显示源料箱，false显示目标料箱。默认为true 
  workshop_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  sourceItem: any = {     //源料箱
    plant: '',
    workshop: '',
    target: '',
    parts: []
  };
  targetItem: any = {     //目标料箱
    plant: '',
    workshop: '',
    target: '',
    parts: []
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
      this.sourceItem.plant = this.api.plant;
      this.workshop = val;
    });
  }


  //扫描
  scan() {
    let err = '';
    if (this.sourceItem.parts.length + this.targetItem.parts.length == 2) {
      err = '只能扫描2个料箱';
    }
    if (this.code == '') {
      err = '请扫描捆包号！';
      this.insertError(err);
    }

    if (this.sourceItem.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
      err = `料箱${this.code}已扫描过，请扫描其他标签`;
    }

    if (this.targetItem.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
      err = `料箱${this.code}已扫描过，请扫描其他标签`;
    }

    if (err.length > 0) {
      this.insertError(err);
      this.resetScan();
      return;
    }
    this.scanSheet();
  }

  //扫描执行的过程
  scanSheet() {
    this.api.get('PP/GetCloseFrame', { plant: this.api.plant, workshop: this.workshop, box_label: this.code }).subscribe((res: any) => {
      if (res.successful) {
        let model = res.data;
        if (this.sourceItem.parts.findIndex(p => p.boxLabel === model.boxLabel) >= 0) {
          this.insertError(`料箱${model.boxLabel}已扫描过，请扫描其他标签`);
          return;
        }
        if (this.targetItem.parts.findIndex(p => p.boxLabel === model.boxLabel) >= 0) {
          this.insertError(`料箱${model.boxLabel}已扫描过，请扫描其他标签`);
          return;
        }
        if (this.partNo.length>0) {
          if (this.partNo != model.partNo) {
            this.insertError('扫描料箱的零件号必须一致');
            return;
          }
        }
        else {
          this.partNo = model.partNo;
        }
        //源料箱
        if (this.sourceItem.parts.length == 0) {
          if (this.canYa != 0) {
            model.currentParts > this.canYa ? model.closeframeParts = this.canYa : model.closeframeParts = model.currentParts;
          }
          else {
            model.closeframeParts = model.currentParts;
          }
          this.partNo = model.partNo;
          model.type = 1;
          this.sourceItem.parts.push(model);
        }
        //目标料箱
        else {
          this.canYa = model.packingQty - model.currentParts;  //可合框数   
          let source = this.sourceItem.parts[0];
          source.closeframeParts == 0 ? source.closeframeParts = source.currentParts : null;
          source.closeframeParts > this.canYa ? source.closeframeParts = this.canYa : null;
          model.closeframeParts = this.canYa;
          model.type = 2;
          this.targetItem.parts.push(model);
        }
      }
      else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('扫描过程出错');
      });
    this.resetScan();
  }

  //非标跳转Modal页
  changeQty(model) {
    if (this.targetItem.parts.length == 0) {
      this.insertError('请扫描目标料箱');
      return;
    }
    const maxNum = model.packingQty > this.canYa ? this.canYa : model.packingQty;
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: maxNum,
      receivePieces: model.closeframeParts
    });
    _m.onDidDismiss(data => {
      if (data) {
        if (data.receive > this.canYa) {
          this.insertError('合框数不能大于' + this.canYa);
          return;
        }
        model.closeframeParts = data.receive;
        this.targetItem.parts[0].closeframeParts = this.targetItem.parts[0].currentParts + data.receive;
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
    this.sourceItem.parts.length = 0;
    this.targetItem.parts.length = 0;
    this.canYa = 0;
    this.parts.length=0;
    this.partNo = '';
    this.insertError("撤销成功", 's');
    this.resetScan();
  }

  //删除
  delete(i) {
    if (i == 0) {
      this.sourceItem.parts.splice(0, 1);
    }
    else {
      this.targetItem.parts.splice(0, 1);
      this.canYa = 0;
      this.sourceItem.parts[0] ? this.sourceItem.parts[0].closeframeParts = this.canYa : null;
    }
    if (this.sourceItem.parts.length == 0 && this.targetItem.parts.length == 0) {
      this.partNo = '';
    }
  }
  //手工调用，重新加载数据模型
  resetScan() {
    this.code = '';
    this.searchbar.setFocus();
  }
  //提交
  save() {
    let err = '';
    if (this.sourceItem.parts.length == 0 || this.targetItem.parts.length == 0) {
      err = '请先扫描料箱号';
    };

    if (new Set(this.sourceItem.parts).size !== this.sourceItem.parts.length) {
      err = "提交的数据中存在重复的数据，请检查！";
    };
    if (new Set(this.targetItem.parts).size !== this.targetItem.parts.length) {
      err = "提交的数据中存在重复的数据，请检查！";
    };

    if (err.length > 0) {
      this.insertError(err);
      this.resetScan();
      return;
    }
    this.targetItem.parts[0].closeframeParts = this.targetItem.parts[0].currentParts + this.sourceItem.parts[0].closeframeParts;
    this.sourceItem.parts[0].closeframeParts = this.sourceItem.parts[0].currentParts - this.sourceItem.parts[0].closeframeParts;
    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.parts.length = 0;
    this.parts.push(this.sourceItem.parts[0]);
    this.parts.push(this.targetItem.parts[0]);
    this.api.post('PP/PostCloseFrame', {
      plant: this.api.plant,
      workshop: this.workshop,
      parts: this.parts
    }).subscribe((res: any) => {
      if (res.successful) {
        this.sourceItem.parts.length = 0;;
        this.targetItem.parts.length = 0;;
        this.canYa = 0;
        this.parts.length = 0;;
        this.partNo = '';
        this.insertError('提交成功', 's');
      }
      else {
        this.insertError(res.message);
      }
      loading.dismiss();
    },
      err => {
        this.insertError('提交失败，' + err);
        loading.dismiss();
      });
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
}
