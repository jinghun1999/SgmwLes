import { Component, ViewChild, NgZone } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  ModalController,
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
    private zone: NgZone,
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
    setTimeout(() => {
      this.addkey();
      this.searchbar.setFocus();
    });
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
  private getWorkshops() {
    this.api.get('pp/getPortNo', {
      plant: this.api.plant,
      workshop: this.item.workshop,
    }).subscribe((res: any) => {
      if (res.successful) {
        const ports = res.data;
        this.feedPort_list = ports;
        let a = ports.find((f) => f.isSelect);
        this.item.portNo = typeof(a)==='undefined' ? ports.length>0?ports[0].portNo:null:a.portNo;
        
      } else {
        this.insertError(res.message);
      }
    }),
      (err) => {
        this.insertError('获取');
      };
  }

  //扫描
  scan() {
    let err = '';
    if (this.code.length==0) {
      err = '无效的上料口/产线，请重新扫描';
    } else if (this.item.partPanel.findIndex((p: any) => p.bundleNo === this.code) >= 0) {
      err = this.code + '已在扫描列表中，不能重复扫描';
    }
    if (err.length>0) {
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
            if (this.item.partPanel.findIndex((p: any) => p.bundleNo === bundle.bundleNo) >= 0) { 
              this.insertError(bundle.bundleNo+"已在扫描列表中，不能重复扫描");
              return;
            } 
            if (bundle.type == 1) {   //type=1，扫描的是上料口
              if (bundle.part.length > 0) {
                for (let i = 0; i < bundle.part.length; i++) {
                  bundle.part[i].productionStatus = 3;//弹框捆包号的生产状态由使用中改为被替换                  
                }
                this.updateDropDownList(bundle.portNo);
                this.openDig(bundle.part,null);
              } else {
                this.updateDropDownList(bundle.portNo);
              }
            } else {   // 扫描的是捆包号              
              // 已经扫描过捆包号，直接添加明细
              if (this.item.partPanel.length>0) {
                // if (bundle.productionStatus = 3) {
                //   bundle.productionStatus = 1; //扫捆包号，生产状态有被替换改为使用中
                // }
                bundle.productionStatus = 1;
                bundle.part = [];
                this.item.partPanel.splice(0, 0, bundle);
              } else {
                // 没有扫描过捆包号，先获取下拉框是否包含捆包号
                if (bundle.part && bundle.part.length>0) {
                  for (let i = 0; i < bundle.part.length; i++) {
                    bundle.part[i].productionStatus = 3;//弹框捆包号的生产状态由使用中改为被替换                    
                  }                  
                  if (bundle.bundleNo) {  //把扫描的捆包号添加明细
                    let part = bundle.part;
                    bundle.productionStatus = 1;
                    bundle.part = [];
                    this.openDig(part,bundle);
                  }
                  else { 
                    this.openDig(bundle.part,null)
                  }
                }
                else { 
                  bundle.productionStatus = 1;
                  bundle.part = [];
                  this.item.partPanel.splice(0, 0, bundle);
                }
              }              
            }            
          } else {
            this.insertError(res.message);            
          }          
        },
        (error) => {
          this.insertError('扫描失败');
        }
      );
    this.setFocus();
  }

  openDig = (parts: any,bundle:any) => {
    const _m = this.modalCtrl.create('BundleListPage', {
      //1.1 弹框显示捆包号
      plant: this.api.plant,
      workshop: this.item.workshop,
      bundle_list: parts,
      port_no: this.item.portNo
    });
    _m.onDidDismiss((data) => {      
      if (data) {
        if (data.successful) {
          this.updateDropDownList(this.item.portNo);  //更新下拉框上料口
          this.insertError('提交成功', 's');
          bundle ? this.item.partPanel.splice(0, 0, bundle) : null;          
        } else if (data.isCancel && data.isCancel) { //选择"关闭"操作
          this.item.partPanel = [];
        }
        else {
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
    } else if (this.item.partPanel.length==0) {
      err = '请先扫描上料口或捆包号';
    } else if (new Set(this.item.partPanel).size !== this.item.partPanel.length) {
      err = '提交的数据中存在重复的捆包号，请检查';
    }
    if (err.length>0) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    let loading = super.showLoading(this.loadingCtrl,'提交中...');
    this.api.post('PP/PostFeedingPort', this.item).subscribe(
      (res: any) => {
        if (res.successful) {
          this.item.partPanel = [];
          this.insertError('提交成功', 's');
        } else {
          this.insertError(res.message);
        }
        loading.dismiss();
      },
      (error) => {
        this.insertError('提交失败');
        loading.dismiss();
      }      
    );
    this.setFocus();
  }
  //撤销操作
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
            this.cancel_do();
          },
        },
      ],
    });
    prompt.present();
  }
  //撤销
  cancel_do() {
    this.insertError('正在撤销...', 'i');
    this.item.partPanel = [];
    this.insertError('撤销成功', 's');
    this.setFocus();
  }
  setFocus() {
    this.code = '';
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 200);
  }

  clearPartPanel() {
    //下拉框改变，清空已扫描的捆包号
    this.item.partPanel = [];
    this.api.get('pp/getFeedingPort', {
      plant: this.item.plant,
      workshop: this.item.workshop,
      port_no: this.item.portNo,
      selectPort_no:this.item.portNo
    }).subscribe((res: any) => {
      if (res.successful) {
        let bundle = res.data;
        if (bundle.type==1 && bundle.part.length>0) {
          for (let i = 0; i < bundle.part.length; i++) {
           bundle.part[i].productionStatus=3;//弹框捆包号的生产状态由使用中改为被替换                    
          }
          this.openDig(bundle.part,null);
        }
      }
      else {
        this.insertError(res.message);
      }
    }, error => {
      this.insertError('获取捆包列表失败');
    });
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
