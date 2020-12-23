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
import { Storage } from "@ionic/storage";
@IonicPage()
@Component({
  selector: 'page-bundle',
  templateUrl: 'bundle.html',
})
export class BundlePage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描捆包号,光标在此处';   //扫描文本框placeholder属性
  workshop: string; //初始化获取的车间
  keyPressed: any;
  errors: any[] = [];
  item: any = {
    bundles: [],
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
  public errSound() {
  }
  public okSound() {
  }
  
  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
    });
  }
  insertError = (msg: string, t: string = 'e') => {
    this.zone.run(() => {
      this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.workshop = val;
    });
  }

  //修改带T的时间格式
  dateFunction(time){
    let data = time.replace(/T/g," ");
    return data;
  }
  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.code == '') {
      err = '请扫描捆包号！';
      this.insertError(err);
    }

    if (this.item.bundles.findIndex(p => p.bundleNo === this.code) >= 0) {
      err = `捆包${this.code}已扫描过，请扫描其他捆包`;
      this.insertError(err);
    }

    if (err.length > 0) {
      this.searchbar.setFocus();
      this.errSound();
      return false;
    }
    return true;
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
  //扫描执行的过程
  scanSheet() {
    this.api.get('PP/GetPanelMaterial', { plant: this.api.plant, workshop: this.workshop, bundle_no: this.code }).subscribe((res: any) => {
      if (res.successful) {
        let model = res.data;
        if (this.item.bundles.findIndex(p => p.bundleNo === model.bundleNo) >= 0) {
          this.insertError(`捆包${model.bundleNo}已扫描过，请扫描其他捆包`);
          this.errSound();
        } else {
          if (model.weight < 0|| model.weight.length==0) { 
            model.weight = 0;
          }
          this.item.bundles.push(model);
          this.okSound();
        }
      }
      else {
        this.insertError(res.message);
        this.errSound();
      }
    },
    err => {
      this.insertError('扫描出错','e');
      this.errSound();
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
          this.navCtrl.popToRoot();
        }
      }]
    });
    prompt.present();
  }

  //删除
  delete(i) {
    this.item.bundles.splice(i, 1);
  }
  //手工调用，重新加载数据模型
  resetScan() {
    this.code = '';
    this.searchbar.setFocus();
  }
  //提交
  outStock() {
    if (this.item.bundles.length==0) {
      this.insertError('请先扫描捆包号','i');
      this.errSound();
      return;
    };

    if (new Set(this.item.bundles).size !== this.item.bundles.length) {
      this.insertError("提交的数据中存在重复的捆包号，请检查！",'i');
      this.errSound();
      return;
    };
    let loading = super.showLoading(this.loadingCtrl,'提交中');
    this.api.post('PP/PostPanelMaterial', {
      plant: this.api.plant,
      workshop: this.workshop,
      bundle_no: this.code,
      partPanel: this.item.bundles
    }).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('提交成功','s');
        this.item.bundles = [];
        this.okSound();
      }
      else {
        this.insertError(res.message);
        this.errSound();
      }
      loading.dismiss();
    },
    err => {
      this.insertError('提交失败');
      this.errSound();
      loading.dismiss();
    });
    this.resetScan();
  }

  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
}
