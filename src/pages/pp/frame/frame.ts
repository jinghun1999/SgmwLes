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
  pressPart_list: any[] = [];  //获取的零件列表
  feedPort_list: any[] = [];  //获取的上料口列表
  part_name: string = '';//显示上料口的第二位置
  bundle_no: string = '';
  box_label: string = '';  //扫描输入的料箱号
  item: any = {
    current_parts: 0,
    plant: '',
    workshop: '',
    box_label: '',  //料箱号
    car_model: '',  //车模
    box_mode: '',  //箱模
    port_no: '',
    bundle_no: '',
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
  //获取上料口列表
  private getWorkshops() {
    this.api.get('PP/GetFrameLoad', { plant: this.item.plant, workshop: this.item.workshop }).subscribe((res: any) => {
      if (res.successful) {
        this.feedPort_list = res.data.feedingPort; 
        //console.log(res.data.feedingPort);
        if (this.feedPort_list.find((f) => f.isSelect)) {
          let feedPort = this.feedPort_list.find((f) => f.isSelect);
          this.item.bundle_no = feedPort.bundle_no;
          this.part_name = feedPort.port_name;
        } else {
          let feedPort = this.feedPort_list[0];
          this.item.bundle_no = feedPort.bundle_no;
          this.part_name = feedPort.port_name;
        }
      } else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('无法获取上料口');
      });
    this.setFocus();
  }
  //扫描执行过程
  scanBox() {
    let err = '';
    if (!this.box_label.trim()) {
      err = '无效的料箱号，请重试';
    }
    if (err.length > 0) {
      this.insertError(err);
      this.setFocus();
      return;
    }

    this.api.get('PP/GetFrame', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.box_label }).subscribe((res: any) => {
      if (res.successful) {
        let frame = res.data;
        if (frame.pressPart && frame.pressPart.length > 0) {
          this.pressPart_list = frame.pressPart;
          let model = null;
          if (this.pressPart_list.find((f) => f.isSelect)) {
            model = this.pressPart_list.find((f) => f.isSelect)
          }
          else {
            model = this.pressPart_list[0];
          }
          this.item.current_parts = model.packing_qty;
          this.item.part_no = model.part_no;
          this.item.car_model = model.car_model;
          this.item.box_mode = model.box_mode;
          this.item.part_no = model.part_no;

          model.part_type == 3 ? this.changeFeed(model.part_no) : null;
        }
        else {
          this.insertError("找不到零件");
        }
        //this.item.plant = frame.plant,
        this.item.box_label = frame.box_label
      }
      else {
        this.insertError(res.message);
      }
    }, error => {
      this.insertError('获取不到料箱信息');
    });
    this.setFocus();
  };

  //提交
  save() {
    let err = '';

    if (!this.pressPart_list.length) {
      err = '请扫描料箱号';
    }
    if (!this.item.part_no || !this.item.bundle_no) {
      err = '上料口或零件号不能为空';
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    this.item.port_no = this.feedPort_list.find((f) => f.bundle_no == this.item.bundle_no).port_no;
    this.item.pressPart.splice(0, 1, this.pressPart_list.find(f => f.part_no == this.item.part_no));
    let loading = super.showLoading(this.loadingCtrl,'提交中...');
    this.api.post('PP/PostFrame', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.pressPart_list = [];
        this.item.pressPart = [];
        this.item.current_parts = 0;
        this.item.box_label = '';
        this.item.car_model = '';
        this.item.box_mode = '';
        this.getWorkshops();//重新加载上料口列表
        this.insertError("提交成功", 's');
        this.setFocus();
      } else {
        this.insertError(res.message);
      }
      loading.dismiss();
    },
      (error) => {
        this.insertError('提交失败');
        loading.dismiss();
      });
    this.setFocus();
  }
  //点击显示错误列表
  openErrList(e) {
    //console.log(e.target);
  }

  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.current_parts,
    });
    _m.onDidDismiss(data => {
      if (data) {
        this.item.current_parts = data.receive
      }
    });
    _m.present();
  }
  //零件下拉框改变时
  changeFeed(part_no) {
    if (this.pressPart_list.find((p)=>p.part_no == part_no).part_type==3) {  //双件双模
      this.api.get('PP/GetSwitchPressPart', { plant: this.item.plant, workshop: this.item.workshop, part_no: part_no }).subscribe((res: any) => {
        if (res.successful) {
          this.feedPort_list = res.data;
          if (this.feedPort_list.find((f) => f.isSelect) && this.feedPort_list.length > 0) {
            this.item.bundle_no = this.feedPort_list.find((f) => f.isSelect).bundle_no;
            //this.item.bundle_no = this.feedPort_list.find((f) => f.bundle_no == this.item.bundle_no).bundle_no;
          }
          else {
            this.item.bundle_no = this.feedPort_list[0].bundle_no;
          }
        }
        else {
          this.insertError(res.message);
        }
      }, error => {
        this.insertError('获取不到捆包列表');
      });
    }

    this.item.port_no=this.feedPort_list.find((f) => f.bundle_no == this.item.bundle_no).port_no;
    this.item.car_model = this.pressPart_list.find((f) =>  f.part_no == part_no ).car_model;
    this.item.box_mode = this.pressPart_list.find((f) =>  f.part_no == part_no ).box_mode;
    this.item.pressPart.splice(0, 1, this.pressPart_list.find(f => f.part_no == this.item.part_no));
    this.item.current_parts = this.pressPart_list.find(f => f.part_no == this.item.part_no).packing_qty;
  }

  cancel() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销本次的操作记录,您确认要执行撤销操作吗？',
      buttons: [
        {
          text: '不撤销',
          handler: () => { },
        },
        {
          text: '确认撤销',
          handler: () => {
            this.insertError('正在撤销...', 'i');
            this.item.part_no = '';
            this.item.port_no = '';
            this.item.bundle_no = '';
            this.insertError('撤销成功', 's');
            this.setFocus();
          },
        },
      ],
    });
    prompt.present();
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
    this.box_label = '';
    this.searchbar.setFocus();
  }
}