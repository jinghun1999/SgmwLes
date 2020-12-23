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
  selector: 'page-receipt-return',
  templateUrl: 'receipt-return.html',
})
export class ReceiptReturnPage  extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
  keyPressed: any;
  reson: string = '';//退货原因
  workshop_list:any[]=[];//加载获取的的车间列表
  errors: any[] = [];
  partsCount: number = 0; 
  item: any = {    
    plant: '',
    workshop: '',
    target:'',
    parts:[]
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
    });
  }
//校验扫描
checkScanCode() {
  let err = '';
  if (this.code == '') {
    err = '请扫描料箱号！';
    this.insertError(err);
  }
  if (this.item.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
    err = `料箱${this.code}已扫描过，请扫描其他料箱`;
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
        this.scanSheet();      
    }
    else {
      this.resetScan();
    }
  }  
  //扫描执行的过程
  scanSheet() {
    this.api.get('PP/GetReceiptReturns', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.code }).subscribe((res: any) => {
      if (res.successful) {
          if (this.item.parts.findIndex(p => p.boxLabel === res.data.boxLabel) >= 0) {            
            this.insertError(`料箱${res.data.boxLabel}已扫描过，请扫描其他料箱`);
            return;
          }
        this.item.parts.splice(0,0,res.data);  
      }
      else {
        this.insertError(res.message);
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
      max_parts: model.currentParts,
      pressParts: model.pressParts,  //零件列表
      part:model.partNo //当前料箱的零件号
    });
    _m.onDidDismiss((data: any, part: string) => {
      if (data) {
        model.currentParts = data.receive
      }
      if (part != "0") {
        const entity = model.pressParts.find((p) => p.part_no == part);
        if (entity) {
          model.partNo = entity.part_no;
          model.partName = entity.part_name;
          model.packingQty = entity.packing_qty;
          model.boxModel = entity.box_mode;
          model.carModel = entity.car_model;
          // model.pressParts = [];
          // model.pressParts.push(entity);          
        }
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
    this.item.parts = [];
    this.insertError("撤销成功",'s');
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

    if(new Set(this.item.parts).size !== this.item.parts.length){
      this.insertError("提交的数据中存在重复的数据，请检查！");
      return;
    };
    //不选零件不允许提交
    for (let i = 0; i < this.item.parts.length; i++) { 
      if (this.item.parts[i].partNo.length == 0) { 
        this.insertError('请先选择零件');
        return;
      }
      //有多个零件，只能提交一个
      if (this.item.parts[i].pressParts.length > 1) { 
        const part = this.item.parts[i].pressParts.find((p) => p.part_no == this.item.parts[i].partNo);
        if (part) {
          this.item.parts[i].pressParts.length = 0;
          this.item.parts[i].pressParts.push(part);
        }
        else { 
          this.insertError('请先选择零件');
          return;
        }
      }
    }

    let loading = super.showLoading(this.loadingCtrl,'提交中...');
    this.api.post('PP/PostReceiptReturns', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.item.parts = [];
        this.insertError('提交成功','s');
      }
      else {
        this.insertError(res.message);
      }
      loading.dismiss();
    },
      err => {
      loading.dismiss();
      this.insertError('提交失败,'+err);
      });
    this.resetScan();
  }
  //修改收货原因
  receiptReson() { 
    let _m = this.modalCtrl.create('ReceiptResonPage', {reson:this.reson});
    _m.onDidDismiss(data => {
      if (data) {
        this.reson = data.reson;
      }
    });
    _m.present();
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


