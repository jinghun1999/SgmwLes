import { Component, ViewChild, NgZone } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  AlertController,
  NavParams,
  Searchbar,
  ToastController,
} from "ionic-angular";
import { BaseUI } from "../../baseUI";
import { Api } from "../../../providers";
import { Storage } from "@ionic/storage";
import { fromEvent } from "rxjs/observable/fromEvent";

@IonicPage()
@Component({
  selector: "page-panel-feed",
  templateUrl: "panel-feed.html",
})
export class PanelFeedPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  feedPort_list: any[] = []; //上料口选项
  bundles: any[] = []; //提交时的临时表，bundles.push(item.partPanel),为了修改productionStatus的值
  code: string = ''; //扫描的上料口或捆包号
  item: any = {
    plant: '', //工厂
    workshop: '', //车间
    portNo: '', //选中的上料口
    partPanel: [], //提交的捆包号列表
  };
  keyPressed: any;
  errors: any[] = [];
  constructor(
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public api: Api,
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
        this.panelSubmit();
        break;
    }
  }
  ionViewDidEnter() {
    this.addkey();
  }
  ionViewWillUnload() {
    this.removekey();
  }
  addkey = () => {
    this.keyPressed = fromEvent(document, 'keydown').subscribe((event) => {
      this.keyDown(event);
    });
  };
  removekey = () => {
    this.keyPressed.unsubscribe();
  };
  insertError = (msg: string, t: number = 0) => {
    // this.zone.run(() => {
    //   this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    // });
    this.errors.splice(0, 1, { message: msg, type: t, time: new Date() });
  };
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getWorkshops();
    });
  }
  private getWorkshops() {
    this.api.get('pp/getPortNo', {
        plant: this.api.plant,
        workshop: this.item.workshop,
      }).subscribe((res: any) => {
        if (res.successful) {
          const ports = res.data;
          this.feedPort_list = ports;
          this.storage.get('PortNo').then((val) => {
            //1.从缓存中获取数据，            
            const a = ports.find((f: any) => f.portNo == val);
            if (val && a) {
              this.item.portNo = a.portNo;
            } else if (ports.length) {
              const a = ports.find((f: any) => f.isSelect); 
              this.item.portNo = a? a.portNo: ports[0].portNo;
            } else {
              this.insertError('未获取到上料口数据');
            }
          });
        } else {
          this.insertError(res.message);
        }
      }),
      (err) => {
        this.insertError('系统级别错误');
      };
    this.setFocus();
  }

  //扫描
  scan() {
    let err = '';
    if (!this.code.length) {
      err = '无效的上料口/产线，请重新扫描';
    } else if (this.item.partPanel.findIndex((p: any) => p.bundleNo === this.code) >= 0) {
      err = this.code + '已在扫描列表，不能重复扫描';
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }

    this.api
      .get('pp/getFeedingPort', {
        plant: this.item.plant,
        workshop: this.item.workshop,
        port_no: this.code,
        selectPort_no: this.item.portNo,
      }).subscribe(
        (res: any) => {
          if (res.successful) {
            const bundle = res.data;
            // 上料口
            if (bundle.type == 1) {
              if (bundle.part.length) {
                //不管是否有捆包，都把之前扫描的捆包号清除
                this.updateDropDownList(bundle.portNo); 
                this.openDig(bundle.part);
              } else {
                this.updateDropDownList(this.code); 
              }
            } else {
              // 捆包号
              // 已经扫描过捆包号，直接添加明细
              if (this.item.partPanel.length) {
                this.item.partPanel.splice(0, 0, bundle);
              } else {
                // 没有扫描过捆包号，先获取下拉框是否包含捆包号
                this.openDig(bundle.part); 
                this.item.partPanel.splice(0, 0, bundle);
              }
            }
          } else {
            this.insertError(res.message);
          }
        },
        (error) => {
          this.insertError('系统级别错误');
        }
      );
    this.setFocus();
  }

  openDig = (parts: any) => {
    const _m = this.modalCtrl.create('BundleListPage', {
      //1.1 弹框显示捆包号
      plant: this.api.plant,
      workshop: this.item.workshop,
      bundle_list: parts,
      port_no: this.item.portNo,
    });
    _m.onDidDismiss((data) => {
      if (data) {
        if (data.successful) {
          this.updateDropDownList(this.code);
          this.storage.set('PortNo', this.code); //缓存当前上料口
        } else {
          //提交失败
          this.insertError(data.message);
        }
      }
    });
    _m.present();
  }
  
  //提交
  panelSubmit() {
    let err = '';
    if (!this.item.portNo) {
      err = '请先选择冲压线';
    } else if (!this.item.partPanel) {
      err = '请先扫描上料口或捆包号';
    } else if (new Set(this.item.bundles).size !== this.item.bundles.length) {
      err = '提交的数据中存在重复的捆包号，请检查';
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    for (let i = 0; i <= this.item.partPanel.length - 1; i++) {
      this.bundles.push(this.item.partPanel[i]); //赋值给新的容器
      this.bundles[i].productionStatus = 3; //提交把状态改为3，表示被替换
    }

    this.api.post('PP/PostFeedingPort', this.item).subscribe(
      (res: any) => {
        if (res.successful) {
          //把选中的冲压线写入缓存，下次默认选中
          this.storage.set('PortNo', this.item.portNo);
          this.item.partPanel = [];
          super.showToast(this.toastCtrl, '提交成功');
        } else {
          this.insertError(res.message);
        }
      },
      (error) => {
        this.insertError('系统级别错误');
      }
    );
    this.setFocus();
  }
  //撤销操作
  cancel() {
    //if (!this.item.partPanel) {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销本次的操作记录,您确认要执行撤销操作吗？',
      buttons: [
        {
          text: '不撤销',
          handler: () => {},
        },
        {
          text: '确认撤销',
          handler: () => {
            this.cancel_do();
          },
        },
      ],
    });
    prompt.present();
  }
  //撤销（会清除缓存）
  cancel_do() {
    this.insertError('正在撤销...', 2);
    this.bundles = [];
    this.item.partPanel = [];
    this.storage.set('PortNo', null); //清空缓存
    this.insertError('撤销成功');
    this.errors = [];
    this.setFocus();
  }
  setFocus() {
    this.code = '';
    this.searchbar.setFocus();
  }

  clearPartPanel() {
    //下拉框改变，清空已扫描的捆包号
    this.item.partPanel = [];
  }

  //更新上料口下拉框
  updateDropDownList(portNo) {
    this.item.portNo = portNo;
    this.item.partPanel = [];
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
