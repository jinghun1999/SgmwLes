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
  max_parts: number = 0;
  item: any = {
    current_parts_group: 0,
    box_label_group: '',
    car_model_group: '',
    box_mode_group: '',
    current_parts: 0,
    plant: '',
    workshop: '',
    box_label: '',  //料箱号
    car_model: '',  //车模
    box_mode: '',  //箱模
    port_no: '',
    part_type: 0, //零件类型，1为单件单模，2为单件双模，3为双件双模
    bundle_no: '',
    part_no: '',
    parts_group: '',//所属零件组
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
    part_no: '',//子零件
    max_parts: 0
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
          let feedingPort = this.item.feedingPort.find((f) => f.isSelect);
          this.item.bundle_no = feedingPort.bundle_no;
        } else {
          let feedingPort = this.item.feedingPort[0];
          this.item.bundle_no = feedingPort.bundle_no;
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

    if (this.item.box_label.length && this.ziPart.box_label.length) {
      err = '不能过多的扫描';
    }

    if (err.length > 0) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    if (this.item.box_label.length && this.item.bundle_no.length) { //第二次扫描料箱
      if (this.item.part_type == 1) {
        this.insertError('单件单模零件只能扫一个料箱');
        return;
      }

      if (this.box_label == this.ziPart.box_label) {
        this.insertError('料箱号' + this.box_label + '已扫描');
        this.setFocus();
        return;
      }
      this.api.get('pp/getFrameAgainBox', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.box_label }).subscribe((res: any) => {
        if (!res.successful) {
          this.insertError(res.message);
          return;
         }
        if (res.data.box_label == this.item.box_label || res.data.box_label == this.item.box_label) {
          this.insertError('料箱号'+res.data.box_label+'已扫描');
          return;
        }

        if (res.data.box_mode != this.item.box_mode) {
          this.insertError('子零件的料箱型号与该框的料框型号不一致');
          this.setFocus();
          return;
        }
        this.ziPart.box_label = res.data.box_label;
      });
      this.setFocus();
      return;
    }
    //扫描第一个料箱
    this.api.get('pp/getFrame', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.box_label }).subscribe((res: any) => {
      if (res.successful) {
        let frame = res.data;
        this.item.pressPart = frame.pressPart;
        this.item.feedingPort = frame.feedingPort;

        //获取历史零件号
        if (frame.pressPart.length) {
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
          this.item.box_label = frame.box_label;
          this.item.parts_group = frame.parts_group;
          this.item.current_parts = res.data.current_parts;
          this.item.max_parts = res.data.current_parts;
          this.changePart(this.item.part_no);
        }
        else {
          this.item.pressPart.length = 0;
          this.insertError('找不到对应的零件');
        }
        if (frame.feedingPort.length) {  //源捆包
          this.item.feedingPort = frame.feedingPort;
        }
        else {
          this.item.feedingPort.length = 0;
        }
        if (frame.feedingPortGroup.length) {  //子料箱，
          this.item.feedingPortGroup = frame.feedingPortGroup;
        }
        else {
          this.item.feedingPortGroup.length = 0;
        }
        if (frame.pressPartGroup.length) { //子零件
          this.item.pressPartGroup = frame.pressPartGroup;
        } else {
          this.item.pressPartGroup.length = 0;
        }
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
    if (!this.item.feedingPort.length) {
      err = '请扫描料箱号';
    }

    if (this.item.part_type == 1) {
      if (this.item.feedingPort.length == 0 || this.item.pressPart.length == 0) {
        err = '请扫描料箱号';
      }
    }
    else if (this.item.part_type == 2 || this.item.part_type == 3) {
      if (this.item.feedingPort.length == 0 || this.item.feedingPortGroup.length == 0) {
        err = '未找到对应的零件或捆包号';
      }
      if (this.item.pressPart.length == 0 || this.item.pressPartGroup.length == 0 || this.ziPart.box_label.length == 0) {
        err = '请扫描料箱号';
      }
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }

    this.item.box_label_group = this.ziPart.box_label;
    this.item.box_mode_group = this.ziPart.box_mode;
    this.item.car_model_group = this.ziPart.car_model;
    this.item.current_parts_group = this.ziPart.current_parts;

    //提交的源捆包
    let feedingPort = this.item.feedingPort.find(f => f.bundle_no == this.item.bundle_no);
    if (feedingPort) {
      this.item.feedingPort.length = 0;
      this.item.port_no = feedingPort.port_no;
      this.item.feedingPort.push(feedingPort);
    }

    //提交的源零件
    let pressPart = this.item.pressPart.find(f => f.part_no == this.item.part_no);
    if (pressPart) {
      this.item.pressPart.length = 0;
      this.item.pressPart.push(pressPart);
    }

    if (this.item.part_type == 2 || this.item.part_type == 3) {
      //提交的子捆包
      let feedingPortGroup = this.item.feedingPortGroup.find(f => f.bundle_no == this.ziPart.bundle_no);
      this.item.feedingPortGroup.length = 0;
      this.item.feedingPortGroup.push(feedingPortGroup);
      //提交的子零件
      let pressPartGroup = this.item.pressPartGroup.find(p => p.part_no == this.ziPart.part_no);
      this.item.pressPartGroup.length = 0;
      this.item.pressPartGroup.push(pressPartGroup);
    } else if (this.item.part_type == 1) {
      this.item.feedingPortGroup.length = 0;
      this.item.pressPartGroup.length = 0;
    }
    let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.api.post('PP/PostFrame', this.item).subscribe((res: any) => {
      if (res.successful) {
        this.defaultData();
        this.getFeedPortList();//重新加载上料口列表
        this.insertError("提交成功", 's');
        this.setFocus();
      } else {
        this.insertError(res.message);
      }
      loading.dismiss();
    },
      error => {
        this.insertError('提交失败');
        loading.dismiss();
      });
  }
  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.max_parts,
      receivePieces: model.current_parts
    });
    _m.onDidDismiss(data => {
      if (data) {
        if (data.receive == 0) {
          this.insertError('装箱数量不能为0');
          return;
        }
        model.current_parts = data.receive
      }
    });
    _m.present();
  }
  //切换源捆包
  changeFeed(bundle_no) {
    if (this.item.part_type == 2) { //单件双模
      this.item.feedingPortGroup = this.item.feedingPort;
      this.ziPart.bundle_no = this.item.bundle_no;
    } else if (this.item.part_type == 3) { //双件双模
      let port_no = this.item.feedingPort.find(f => f.bundle_no == bundle_no);


      let ziPartName = this.item.feedingPortGroup.find(f => f.port_no == port_no.port_no);

      if (ziPartName) {
        this.ziPart.bundle_no = ziPartName.bundle_no;
      }
      else {
        console.log('当前上料口没有和它方向相同的捆包');
        //this.noFeedingPortGroup = true;
        this.ziPart.bundle_no = '';
        this.item.feedingPortGroup.length = 0;
      }
    }
  }
  //切换源零件
  changePart(part_no) {
    this.getFeedPortList();
    let pressPart = this.item.pressPart.find((p) => p.part_no == part_no);
    if (!pressPart) {
      return;
    }
    if (pressPart.part_type == 3) {  //双件双模
      this.item.part_type = 3;
      this.api.get('PP/GetSwitchPressPart', { plant: this.item.plant, workshop: this.item.workshop, part_no: part_no }).subscribe((res: any) => {
        if (res.successful) {
          if (res.data.feedingPortGroup.length) {
            this.item.feedingPortGroup = res.data.feedingPortGroup;//子捆包
            this.ziPart.bundle_no = res.data.feedingPortGroup.find(f => f.isSelect) ? res.data.feedingPortGroup.find(f => f.isSelect).bundle_no : res.data.feedingPortGroup[0].bundle_no;
          }
          else { 
           // console.log('当前上料口没有和它方向相同的捆包');
            this.ziPart.bundle_no = '';
            this.item.feedingPortGroup.length = 0;
          }
          this.item.parts_group = res.data.parts_group;

          if (res.data.feedingPort.length > 0) {
            this.item.feedingPort = res.data.feedingPort;//源上料口
            if (this.item.feedingPort.find((f) => f.isSelect) && this.item.pressPart.length > 0) {
              this.item.bundle_no = this.item.feedingPort.find((f) => f.isSelect).bundle_no;
            }//源上料口绑定数据
            else {
              this.item.bundle_no = this.item.feedingPort[0].bundle_no;
            }
            this.changeFeed(this.item.bundle_no);
          }
          else {
            this.item.feedingPort.length = 0;
            this.insertError('找不到对应的捆包号');
          }

          if (res.data.pressPartGroup.length) {
            this.item.pressPartGroup = res.data.pressPartGroup;//子零件
            this.ziPart.part_no = res.data.pressPartGroup.find(p => p.isSelect) ? res.data.pressPartGroup.find(p => p.isSelect).part_no : res.data.pressPartGroup[0].part_no;
            this.changeZi(this.ziPart.part_no);
          }
          else {
            this.item.pressPartGroup.length = 0;
            this.insertError('找不到对应的子零件');
          }
        }
        else {
          this.insertError(res.message);
        }
      }, error => {
        this.insertError('获取捆包列表失败');
      });
    }

    if (pressPart.part_type == 2) { //单件双模
      this.item.part_type = 2;
      this.api.get('PP/GetSwitchPressPart', { plant: this.item.plant, workshop: this.item.workshop, part_no: part_no }).subscribe((res: any) => {
        if (res.successful) {
          if (res.data.pressPartGroup.length) {
            this.item.pressPartGroup = res.data.pressPartGroup;//子零件
            this.ziPart.part_no = res.data.pressPartGroup.find(f => f.isSelect) ? res.data.pressPartGroup.find(f => f.isSelect).part_no : res.data.pressPartGroup[0].part_no;

            //子捆包
            if (res.data.feedingPortGroup.length > 0) {
              this.item.feedingPortGroup = res.data.feedingPortGroup;
            } else { 
              this.insertError('找不到对应的捆包号');
            }
            this.changeZi(this.ziPart.part_no);
          }
          else {
            this.item.pressPartGroup.length = 0;
            this.insertError('找不到对应的零件');
          }
          this.item.parts_group = res.data.parts_group;
          this.ziPart.bundle_no = this.item.bundle_no;
        }
        else {
          this.insertError(res.message);
        }
      }, error => {
        this.insertError('获取捆包列表失败');
        return;
      });
    }

    if (pressPart.part_type == 1) {   //单件单模
      this.item.part_type = 1;
    }
    this.item.car_model = pressPart.car_model;
    this.item.box_mode = pressPart.box_mode;
    this.item.current_parts = pressPart.currentParts;
  }
  //切换子零件触发事件
  changeZi(part_no) {
    let part = this.item.pressPartGroup.find(p => p.part_no == part_no);
    this.ziPart.car_model = part.car_model;
    this.ziPart.box_mode = part.box_mode;
    this.ziPart.current_parts = part.currentParts;
    this.ziPart.max_parts = part.currentParts;
  }
  //删除
  delect() {
    this.defaultData();
    this.setFocus();
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
            this.insertError('正在撤销...');
            this.defaultData();
            this.setFocus();
            this.insertError('撤销成功', 's');
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
  //初始化数据
  defaultData() {
    this.item.current_parts_group = 0;
    this.item.box_label_group = '';
    this.item.car_model_group = '';
    this.item.box_mode_group = '';
    this.item.current_parts = 0;
    this.item.box_label = '';  //料箱号
    this.item.car_model = '';  //车模
    this.item.box_mode = '';  //箱模
    this.item.port_no = '';
    this.item.part_type = 0; //零件类型，2为单件双模，3为双件双模
    this.item.bundle_no = '';
    this.item.part_no = '';
    this.item.parts_group = '';//所属零件组
    this.item.pressPart.length = 0;  //源零件列表
    this.item.feedingPort.length = 0;  //源上料口列表
    this.item.pressPartGroup.length = 0;  //子零件
    this.item.feedingPortGroup.length = 0;  //子上料

    this.ziPart.box_label = '';
    this.ziPart.box_mode = '';
    this.ziPart.car_model = '';
    this.ziPart.current_parts = 0;
    this.ziPart.max_parts = this.ziPart.current_parts;
    this.ziPart.part_no = 0;
  }
}