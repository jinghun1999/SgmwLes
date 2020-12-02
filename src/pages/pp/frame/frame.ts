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
  port_no: string = '';   //选中的上料口
  pressPart_list: any[] = [];  //获取的零件列表
  feedPort_list: any[] = [];  //获取的上料口列表
  //port_no: string = '';//显示上料口的第一位置
  part_name: string = '';//显示上料口的第二位置
  box_label:string='';
  item: any = {
    current_parts: 0,
    plant: '',
    workshop: '',
    box_label: '',  //料箱号
    car_model: '',  //车模
    box_mode: '',  //箱模
    port_no: '',
    part_no: '',
    pressPart: [],  //要提交的零件列表
    feedingPort: [],  //要提交的上料口列表
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
    //this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
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
    this.api.get('PP/GetFrameLoad', { plant: this.item.plant, workshop: this.item.workshop }).subscribe((res: any) => {
      if (res.successful) {
        this.feedPort_list = res.data.feedingPort;
        this.storage.get('portNo').then((val) => {   //从缓存中获取数据
          if (val) {
            this.port_no = this.feedPort_list.find((f) => f.port_no = val).port_no;
          }
          else if (this.feedPort_list.find((f) => f.isSelect)) {
            let feedPort = this.feedPort_list.find((f) => f.isSelect);
            this.port_no = feedPort.port_no;
            this.part_name = feedPort.port_name;
          } else {
            let feedPort = this.feedPort_list[0];
            this.port_no = feedPort.port_no;
            this.part_name = feedPort.port_name;
          }
        });
      } else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('系统级别错误');
      });
    this.setFocus();
  }
  //扫描执行过程
  scanBox() {
    let err = '';
    if (!this.item.box_label) {
      err = '无效的料箱号，请重试';
    }
    // if (!this.item.feedingPort) { 
    //   err = '请先扫描料箱号';
    // }
    // if (!this.port_no) {
    //   err = '请选择上料口';
    // }
    // if((new Set(this.)).size != arr.length){
    //   alert("数组有重复值")
    // }

    if (err.length > 0) {
      this.insertError(err);
      this.setFocus();
      return;
    }

    this.api.get('PP/GetFrame', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.item.box_label }).subscribe((res: any) => {
      if (res.successful) {
        let frame = res.data;
        if (frame.pressPart.length > 0) {
          this.item.part_no = frame.pressPart[0].part_no;
          this.item.pressPart = frame.pressPart;
        }
        if (frame.feedingPort.length > 0) {
          this.item.feedingPort = frame.feedingPort;
        }
        this.item.current_parts = frame.current_parts,
        this.item.plant = frame.plant,
        this.item.workshop = frame.workshop,
        this.item.box_label = frame.box_label,
        this.item.car_model = frame.car_model,
        this.item.box_mode = frame.box_mode,
        this.item.port_no = frame.port_no,
        this.box_label = frame.box_label
      }
      else {
        this.insertError(res.message);
      }
    }, error => {
      this.insertError('获取不到料箱信息，请重新扫描');
    });
    this.setFocus();
  };

  //提交
  save()  {
    let err = '';
    // if (!this.item.source || !this.item.target) {
    //   err = '请选择目标仓库';
    //   this.insertError(err);
    // }
    if (this.item.pressPart) { 
      err = '请扫描料箱号';
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    this.insertError('正在提交，请稍后...', 1);
    this.item.box_label = this.box_label;
    this.item.port_no = this.port_no;
    this.api.post('PP/PostFrame', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.storage.set('portNo', this.port_no);
        this.pressPart_list = [];
        this.toastCtrl.create({
          message: '提交成功',
          duration: 1500,
          position:'buttom'
        }).present();
        this.setFocus();
      } else {
        this.insertError(res.message);
      }
    },
      (error) => {
        this.insertError('提交失败');
      });
    this.setFocus();
  }
  //点击显示错误列表
  openErrList(e) {
    console.log(e.target);
  }

  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.packing_qty,
    });
    _m.onDidDismiss(data => {
      if (data) {
        model.packing_qty = data.receive
      }
    });
    _m.present();
  }
  //零件下拉框改变时
  changeFeed(feedPort) {
    if (feedPort.pressPart.part_type == 3) {
      this.api.get('PP/GetSwitchPressPart', { plant: this.item.plant, workshop: this.item.workshop, part_no: feedPort.part_no }).subscribe((res: any) => {
        if (res.successful) {        
          if (res.data.find((f) => f.isSelect).port_no) {
            this.port_no = res.data.find((f) => f.isSelect).port_no;
          }
          else { 
            this.port_no = res.data[0].port_no;
          }
        }
        else { 
          this.insertError(res.message);
        }
      }, error => {
        this.insertError('获取不到零件列表');
      });
    }
    this.setFocus();
  }

  cancel() {
    this.navCtrl.popToRoot(); //返回首页
  }
  focusInput = () => {
    this.searchbar.setElementClass('bg-red', false);
    this.searchbar.setElementClass('bg-green', true);
  };
  blurInput = () => {
    this.searchbar.setElementClass('bg-green', false);
    this.searchbar.setElementClass('bg-red', true);
  };
  setFocus() {
    this.item.box_label = '';
    this.searchbar.setFocus();
  }
}