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
  isSource: boolean = true; //true显示源料箱，false显示目标料箱。默认为true 
  workshop_list:any[]=[];//加载获取的的车间列表
  errors: any[] = [];
  sourceItem: any = {     //源料箱
    plant: '',
    workshop: '',
    target:'',
    parts:[]
  };
  targetItem: any = {     //目标料箱
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
        this.outStock();
        break;
    }
  }
  ionViewDidEnter() {
    this.addkey();
    this.searchbar.setFocus();//为输入框设置焦点
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
      this.sourceItem.plant = this.api.plant;
      this.workshop = val;
      this.getWorkshops();
    });
  }
  private getWorkshops() {
    this.api.get('system/getPlants', { plant: this.api.plant }).subscribe((res: any) => {
      if (res.successful) {
        this.workshop_list = res.data;
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
    

    if (this.sourceItem.parts.length+this.targetItem.length>2) { 
      err = '只能扫描2个料箱';
      return;
    }
  if (this.code == '') {
    err = '请扫描捆包号！';
    this.insertError(err);
  }

  if (this.sourceItem.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
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
        this.scanSheet();      
    }
    else {
      this.resetScan();
    }
  }  
  //扫描执行的过程
  scanSheet() {
    this.errors = [];
    this.api.get('PP/GetDefectiveProduct', { plant: this.api.plant, workshop: this.workshop, box_label: this.code }).subscribe((res: any) => {
      if (res.successful) {
          if (this.sourceItem.parts.findIndex(p => p.boxLabel === this.code) >= 0) {            
            this.insertError(`料箱${this.code}已扫描过，请扫描其他标签`);
            return;
        }        
        if (this.isSource) {  //添加源料箱
          this.sourceItem.parts.splice(0, 0, res.data); 
          this.isSource =false;
        } else {        //添加目标料箱
          this.targetItem.parts.splice(0, 0, res.data);
          this.isSource = true;
        }        
      }
      else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('扫描过程出错，请重新扫描');
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
        model.packingQty = model.packingQty - data.receive
        this.targetItem.pasrt.packingQty += data.receive;
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
    this.insertError('正在撤销...', 2);
    this.code = '';
    this.errors = [];
    this.sourceItem.parts = [];
    this.insertError("撤销成功");
    this.resetScan();
  }

  //删除
  delete(i) {
    this.sourceItem.parts.splice(i, 1);
  }
  //手工调用，重新加载数据模型
  resetScan() {
    this.code = '';
    this.searchbar.setFocus();
  }
  //提交
  outStock() {
    if (!this.sourceItem.parts) {
      this.insertError('请先扫描料箱号');
      return;
    };

    if(new Set(this.sourceItem.parts).size !== this.sourceItem.parts.length){
      this.insertError("提交的数据中存在重复的数据，请检查！");
      return;
    };

    // if (this.sourceItem.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
    //   err = `料箱${this.code}已扫描过，请扫描其他标签`;
    //   this.insertError(err);
    // }

    this.api.post('PP/PostDefectiveProduct', {
      plant: this.api.plant,
      workshop: this.workshop,
      parts: this.sourceItem.parts
    }).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('提交成功');
      }
      else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('系统级别错误');
        this.resetScan();
      });    
    this.sourceItem.parts = [];    
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
