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
  box_label: string = '';  //扫描输入的料箱号
  item: any = {
    current_parts: 0,
    plant: '',
    workshop: '',
    box_label: '',  //料箱号
    car_model: '',  //车模
    box_mode: '',  //箱模
    port_no: '',
    part_type: 0, //零件类型，2为单件双模，3为双件双模
    bundle_no: '',
    part_no: '',
    parts_group: '',//零件组  

    pressPart: [],  //源零件列表
    feedingPort: [],  //源上料口列表
    pressPartGroup: [],  //子零件
    feedingPortGroup: []  //子上料
  };
  ziPart: any = {
    box_label: '',  //料箱号
    box_mode: '',  //箱模
    car_model: '',//车型
    current_parts: 0,//装箱数量
    part_no: '' //子零件
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
      this.getFeedPortList();
    });
  }
  //获取上料口列表
  private getFeedPortList() {
    this.api.get('PP/GetFrameLoad', { plant: this.item.plant, workshop: this.item.workshop }).subscribe((res: any) => {
      if (res.successful) {
        this.item.feedingPort = res.data.feedingPort;
        if (this.item.feedingPort.find((f) => f.isSelect)) {
          let feedPort = this.item.feedingPort.find((f) => f.isSelect);
          this.item.bundle_no = feedPort.bundle_no;
        } else {
          let feedPort = this.item.feedingPort[0];
          this.item.bundle_no = feedPort.bundle_no;
        }
      } else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('获取捆包列表失败');
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

    if (this.item.box_label.length) { //第二次扫描料箱
      if (this.box_label == this.ziPart.box_label) {
        this.insertError('料箱号' + this.box_label + '已扫描');
        this.setFocus();
        return;
      }
      this.api.get('pp/getFrameAgainBox', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.box_label }).subscribe((res: any) => {
        if (res.data.box_label == this.item.box_label || res.data.box_label == this.item.box_label) { 
          this.insertError(`料箱号{res.data.box_label}已扫描`);
          return;
        }

        if (res.data.box_mode != this.item.box_mode) {
          this.insertError('子零件的料箱型号与该框的料况型号不一致');
          this.setFocus();
          return;
        }
        this.ziPart.box_label = res.data.box_label;
        this.ziPart.box_mode = res.data.box_mode;
      });
      this.setFocus();
      return;
    }
    //第一次扫描
    this.api.get('pp/getFrame', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.box_label }).subscribe((res: any) => {
      if (res.successful) {
        let frame = res.data;

        this.item.feedingPortGroup = frame.feedingPortGroup;
        this.item.pressPart = frame.pressPart;
        this.item.pressPartGroup = frame.pressPartGroup;
        this.item.feedingPort = frame.feedingPort;

        //获取历史零件号
        let pressPart = frame.pressPart.find((p) => p.isSelect);
        if (pressPart) {
          this.item.part_no = pressPart.part_no;
          this.item.part_type = pressPart.part_type;
        }
        else {
          this.item.part_no = frame.pressPart[0].part_no;
          this.item.part_type = frame.pressPart[0].part_type;
        }

        this.item.car_model = frame.car_model;
        this.item.box_mode = frame.box_mode;
        this.item.box_label = frame.box_label
        this.item.parts_group = frame.parts_group;
        this.item.current_parts = res.data.current_parts;

        (this.item.part_type == 2 || this.item.part_type == 3) && this.changeFeed(this.item.part_no);
      }
      else {
        this.insertError(res.message);
      }
    }, error => {
      this.insertError('获取料箱信息失败');
    });
    this.setFocus();
  };

  //提交
  save() {
    let err = '';
    if (!this.item.feedPort.length) {
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
    this.item.port_no = this.item.feedPort.find((f) => f.bundle_no == this.item.bundle_no).port_no;
    this.item.pressPart.splice(0, 1, this.item.feedPort.find(f => f.part_no == this.item.part_no));
    let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.api.post('PP/PostFrame', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.item.current_parts = 0;
        this.item.plant = '';
        this.item.workshop = '';
        this.item.box_label = '';  //料箱号`
        this.item.car_model = '';  //车模
        this.item.box_mode = '';  //箱模
        this.item.port_no = '';
        this.item.bundle_no = '';
        this.item.part_no = '';
        this.item.parts_group = '';//零件组
        this.item.pressPart.length = 0;  //要提交的零件列表
        this.item.feedingPort.length = 0;  //要提交的上料口列表
        this.item.feedingPortGroup.length = 0;  //子零件捆包列表
        this.item.feedPort.length = 0;
        this.item.feedPort.length = 0;
        this.item.part_type = 0;

        this.getFeedPortList();//重新加载上料口列表
        this.insertError("提交成功", 's');
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
  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.current_parts,
    });
    _m.onDidDismiss(data => {
      if (data) {
        if (data.receive == 0) {
          this.insertError('装箱数量不能为0');
          return;
        }
        this.item.current_parts = data.receive
      }
    });
    _m.present();
  }
  //源零件下拉框改变
  changeFeed(part_no) {
    this.getFeedPortList();
    if (this.item.pressPart.find((p) => p.part_no == part_no).part_type == 3) {  //双件双模
      console.log('双件双模');
      this.api.get('PP/GetSwitchPressPart', { plant: this.item.plant, workshop: this.item.workshop, part_no: part_no }).subscribe((res: any) => {
        if (res.successful) {
          console.log(res);
          this.item.feedingPort = res.data.feedingPort;//源上料口
          //this.item.pressPart = res.data.pressPart;//源零件

          if (this.item.feedingPort.find((f) => f.isSelect) && this.item.pressPart.length > 0) {
            this.item.bundle_no = this.item.feedingPort.find((f) => f.isSelect).bundle_no;
          }//源上料口绑定数据
          else {
            this.item.bundle_no = this.item.feedingPort[0].bundle_no; 
          }

          if (res.data.pressPartGroup.length) {
            this.item.item.pressPartGroup = res.data.pressPartGroup;//子捆包(冲压)
          }
          else { 
            this.insertError('没有对应的捆包号数据');
            return;
          }
          if (res.data.feedingPortGroup.length) {
            this.item.item.feedingPortGroup = res.data.feedingPortGroup;//子捆包(冲压)
          }
          else { 
            this.insertError('没有对应的捆包号数据');
            return;
          }
          this.ziPart.car_model = res.data.car_model;
          this.ziPart.box_mode = res.data.box_mode;
          this.ziPart.current_parts = res.data.current_parts;
        }
        else {
          this.insertError(res.message);
        }
      }, error => {
        this.insertError('获取不到捆包列表');
      });
    }

    if (this.item.pressPart.find((p) => p.part_no == part_no).part_type == 2) { //单件双模
      this.api.get('PP/GetSwitchPressPart', { plant: this.item.plant, workshop: this.item.workshop, part_no: part_no }).subscribe((res: any) => {

        this.item.pressPartGroup = res.data.pressPartGroup;
        this.item.feedingPortGroup = res.data.feedingPortGroup;


        this.ziPart.bundle_no = this.item.bundle_no;
        this.ziPart.part_no = res.data.pressPartGroup[0].part_no;
        this.changePart(this.ziPart.part_no);
      }, error => {
        this.insertError('获取不到捆包列表');
        return;
      });
    }
    let pressPart = this.item.pressPart.find((f) => f.part_no == part_no);
    this.item.car_model = pressPart.car_model;
    this.item.box_mode = pressPart.box_mode;
    this.item.current_parts = pressPart.currentParts;
  }
  //子零件改变
  changePart(part_no) {
    let part = this.item.pressPartGroup.find((p) => p.part_no == part_no);
    if (part) {
      this.ziPart.car_model = part.car_model;
      this.ziPart.current_parts = part.currentParts;
      this.ziPart.box_mode = part.box_mode;
    }
  }

  //删除
  delect() {
    this.item.current_parts = 0;
    this.item.box_label = '';  //料箱号
    this.item.car_model = '';  //车模
    this.item.box_mode = '';  //箱模
    this.item.port_no = '';
    this.item.bundle_no = '';
    this.item.part_no = '';
    this.item.part_type = 0;
    this.item.parts_group = '';//零件组
    this.item.pressPart.length = 0;  //要提交的零件列表
    this.item.feedingPort.length = 0;  //要提交的上料口列表
    this.item.feedingPortGroup.length = 0;  //子零件捆包列表
    this.item.feedPort.length = 0;
    this.item.feedPort.length = 0;
    this.getFeedPortList();//重新加载上料口列表
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