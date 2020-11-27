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
  selector: 'page-frame',
  templateUrl: 'frame.html',
})
export class FramePage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性

  feedPort_list: any[] = [];
  item: any = {
    current_parts: 0,
    plant: '',
    workshop: '',
    box_label: '',
    car_mode: '',
    pressPart: [],  //零件列表
    feedingPort: [],  //上料口列表
  };
  keyPressed: any;
  errors: any[] = [];
  constructor(public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public api: Api,
    public navCtrl: NavController,
    private zone: NgZone,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public storage: Storage
  ) {
    super();
  }

  keyDown(event) {
    switch (event.keybox_label) {
      case 112:
        //f1
        this.save();
        break;
      case 113:
        //f2
        this.cancel();
        break;
    }
  }
  ionViewDidEnter() {
    this.addkey();
    this.searchbar.setFocus();
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
    this.api.get('PP/GetPortNo', { plant: this.item.plant, workshop : this.item.workshop}).subscribe((res: any) => {
      if (res.successful) {
        this.feedPort_list = res.data;
        this.item.port_no = this.feedPort_list[0].portNo
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


  //扫描执行过程
  scanBox() {
    let err = '';
    if (this.item.box_label== '') {
      err = '无效的料箱号，请重试';
      this.insertError(err);
      this.setFocus();
      return;
    }

    // if (this.item.bundles.findIndex(p => p.bundleNo === this.item.box_label) >= 0) {
    //   err = `料箱号${this.item.box_label}已扫描过，请扫描其他料箱号`;
    //   this.insertError(err);
    //   this.setFocus();
    //   return;
    // }

    this.api.get('PP/GetFrame', { plant: this.item.plant,  workshop:this.item.workshop, box_label: this.item.box_label }).subscribe((res) => { 
      console.log(res); 
    });

  };

  //提交
  save() {
    //   let err = '';
    //   if (!this.item.source || !this.item.target) {
    //     err = '请选择目标仓库';
    //     this.insertError(err);
    //   }
    //   if (err.length) {
    //     this.setFocus();
    //     return;
    //   }
    //   this.insertError('正在提交，请稍后...', 1);
    //   this.api.post('PP/PostSheetPanelMaterial', this.item).subscribe((res: any) => {
    //     if (res.successful) {
    //       this.insertError('提交成功', 2);
    //     } else {
    //       this.insertError(res.message);
    //     }
    //     this.setFocus();
    //   },
    //     (error) => {
    //       this.insertError('系统级别错误，请重试');
    //       this.setFocus();
    //     });
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }

  setFocus() {
    this.item.box_label = '';
    this.searchbar.setFocus();
  }
}