import { Component, ViewChild, NgZone } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  AlertController,
  NavParams, Searchbar,
  ToastController
} from 'ionic-angular';
import { BaseUI } from '../../baseUI';
import { Api } from '../../../providers';
import { Storage } from "@ionic/storage";
import { fromEvent } from "rxjs/observable/fromEvent";
import { BundlePage } from '../bundle/bundle';

@IonicPage()
@Component({
  selector: 'page-panel-feed',
  templateUrl: 'panel-feed.html',
})
export class PanelFeedPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  barTextHolderText: string = '扫描上料口/产线，光标在此处';   //扫描文本框placeholder属性
  feedPort_list: any[] = [];  //上料口选项
  bundles: any[] = []; //提交时的临时表，bundles.push(item.partPanel),为了修改productionStatus的值
  code: string = '';                    //扫描的上料口或捆包号
  item: any = {
    plant: '',                            //工厂
    workshop: '',                         //车间
    portNo: '',                         //选中的上料口
    partPanel: []                          //提交的捆包号列表
  };
  keyPressed: any;
  errors: any[] = [];
  constructor(public navParams: NavParams,
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private zone: NgZone,
    public alertCtrl: AlertController,
    public api: Api,
    public modalCtrl: ModalController,
    public storage: Storage) {
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
    this.keyPressed = fromEvent(document, 'keydown').subscribe(event => {
      this.keyDown(event);
    });
  }
  removekey = () => {
    this.keyPressed.unsubscribe();
  }
  insertError = (msg: string, t: number = 0) => {
    // this.zone.run(() => {
    //   this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    // });
    this.errors.splice(0, 1, { message: msg, type: t, time: new Date() });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getWorkshops();
    });
  }
  private getWorkshops() {
    this.api.get('PP/GetPortNo', { plant: this.api.plant, workshop: this.item.workshop }).subscribe((res: any) => {
      if (res.successful) { //start if
        //console.log(res);
        this.feedPort_list = res.data;
        this.storage.get('PortNo').then((val) => {//1.从缓存中获取数据，          
          if (val) {
            let result= this.feedPort_list.find((f) => f.portNo == val);
            if (!result && typeof (result) != "undefined" && result != 0) { 
              this.item.portNo = result.portNo;
            }else {
              if (this.feedPort_list.find((f) => f.isSelect)) { //2.缓存无数据,取后台返回isSelect=true
                this.item.portNo = this.feedPort_list.find((f) => f.isSelect).portNo;
              }
              else if (this.feedPort_list[0]) {
                this.item.portNo = this.feedPort_list[0].portNo;//3.选择第一条数据为默认
              }
              else {
                this.insertError("系统级别错误");
              }
            } 
          }
          else {
            if (this.feedPort_list.find((f) => f.isSelect)) { //2.缓存无数据,取后台返回isSelect=true
              this.item.portNo = this.feedPort_list.find((f) => f.isSelect).portNo;
            }
            else if (this.feedPort_list[0]) {
              this.item.portNo = this.feedPort_list[0].portNo;//3.选择第一条数据为默认
            }
            else {
              this.insertError("系统级别错误");
            }
          } 
        });
      } else { //end if
        this.insertError(res.message);
      }
    }), err => {
      this.insertError("系统级别错误");
    };
    this.setFocus();
  }

  //扫描
  scan() {
    let err = '';
    if (!this.code) {
      err = '无效的上料口/产线，请重新扫描';
    }

    if (this.item.partPanel.findIndex(p => p.bundleNo === this.code) >= 0) {
      err = this.code + '已在扫描列表，不能重复扫描';
    }
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }

    //扫描的过程
    this.api.get('PP/GetFeedingPort', {
      plant: this.item.plant,
      workshop: this.item.workshop,
      port_no: this.code
    }).subscribe((res: any) => {
      if (res.successful) {
        let bundle = res.data;
        if (bundle.type == 1) {// 1.返回type=1,说明扫描的是上料口,
          this.item.portNo = bundle.portNo;
          if (bundle.part.length > 0) { //part值>0 ,有parts，弹框显示   
            this.item.partPanel = []; //不管是否有捆包，都把之前扫描的捆包号清除
            let _m = this.modalCtrl.create('BundleListPage', {  //1.1 弹框显示捆包号
              plant: this.api.plant,
              workshop: this.item.workshop,
              bundle_list: bundle.part,
              port_no: this.item.portNo
            });
            _m.onDidDismiss(data => {    //获取弹框操作返回的值,选择关闭返回undefined
              if (data) {  //选择提交操作              
                if (data.successful) { //提交成功
                  this.updateDropDownList(this.code);  //更新下拉框
                  this.storage.set('PortNo', this.code);//缓存当前上料口
                  this.toastCtrl.create({
                    message: '提交成功',
                    duration: 1500,
                    position: 'buttom'
                  }).present();
                } else {//提交失败
                  this.insertError(data.message);
                }
              } else { //选择关闭操作
                //return;
              }
            });
            _m.present();
          } else {  //    没有parst号，不弹框
            this.updateDropDownList(this.item.portNo);//更新下拉框
            this.storage.set('PortNo', this.item.portNo);//缓存当前上料口
          }
        } else { //返回的type为2，说明扫描的是捆包号
          if (this.item.partPanel.length > 0) {//已经扫描过捆包号，直接添加明细
            this.item.partPanel.splice(0, 0, {
              type: bundle.type,
              plant: bundle.plant,
              workshop: bundle.workshop,
              portNo: bundle.portNo,
              portName: bundle.portName,
              productionStatus: bundle.productionStatus,
              bundleNo: bundle.bundleNo,
              weight: bundle.weight,
              pieces: bundle.pieces,
              actualReceivePieces: bundle.actualReceivePieces,
              sapNo: bundle.sapNo,
              sapOrderNo: bundle.sapOrderNo
            });
          } else { //没有扫描过捆包号，先获取下拉框是否包含捆包号           
            this.api.get('PP/GetFeedingPort', {
              plant: this.item.plant,
              workshop: this.item.workshop,
              port_no: this.item.portNo
            }).subscribe((res: any) => {
              if (res.successful) {
                if (res.data.part.length > 0) {   //当前下拉框包含捆包号，弹框显示
                  let _m = this.modalCtrl.create('BundleListPage', {  //1.1 弹框显示捆包号
                    plant: this.api.plant,
                    workshop: this.item.workshop,
                    bundle_list: res.data.part,
                    port_no: this.item.portNo
                  });
                  _m.onDidDismiss(data => {    //获取弹框操作返回的值,选择关闭返回undefined
                    if (data) {              //选择 提交
                      if (data.successful) { //提交成功
                        this.updateDropDownList(this.item.portNo);  //更新下拉框
                        this.item.partPanel = []; //清除扫描的捆包号
                        this.storage.set('PortNo', this.item.portNo);//缓存当前上料口
                        this.toastCtrl.create({
                          message: '提交成功',
                          duration: 1500,
                          position: 'buttom'
                        }).present();
                        //添加新扫描的捆包号明细
                        this.api.get('PP/GetFeedingPort', {
                          plant: this.item.plant,
                          workshop: this.item.workshop,
                          port_no: this.code
                        }).subscribe((res: any) => {
                          if (res.successful) {
                            let feed = res.data;
                            this.item.partPanel.splice(0, 0, {
                              type: feed.type,
                              plant: feed.plant,
                              workshop: feed.workshop,
                              portNo: feed.portNo,
                              portName: feed.portName,
                              productionStatus: feed.productionStatus,
                              bundleNo: feed.bundleNo,
                              weight: feed.weight,
                              pieces: feed.pieces,
                              actualReceivePieces: feed.actualReceivePieces,
                              sapNo: feed.sapNo,
                              sapOrderNo: feed.sapOrderNo
                            });
                          }
                          else {
                            this.insertError(res.message);
                          }
                        }, error => {
                          this.insertError(res.message);
                        });
                      } else {//提交失败,显示异常
                        this.insertError('提交失败'+data.message);
                      }
                    } else { //选择关闭，无任何操作
                      this.code = '';
                      //return;
                    }
                  });
                  _m.present();
                }
                else {    //不包含捆包号，记录扫描的捆包号明细
                  this.item.partPanel.splice(0, 0, {
                    type: bundle.type,
                    plant: bundle.plant,
                    workshop: bundle.workshop,
                    portNo: bundle.portNo,
                    portName: bundle.portName,
                    productionStatus: bundle.productionStatus,
                    bundleNo: bundle.bundleNo,
                    weight: bundle.weight,
                    pieces: bundle.pieces,
                    actualReceivePieces: bundle.actualReceivePieces,
                    sapNo: bundle.sapNo,
                    sapOrderNo: bundle.sapOrderNo
                  });
                }
              } else {
                this.insertError(res.message);
              }
            }, error => {
              this.insertError('系统级别错误');
              this.setFocus();
            });
          }
        }      
      } else { 
        this.insertError(res.message);
      }      
    }, error => { 
        this.insertError( '系统级别错误');
    });
    this.setFocus();
  }
  //显示错误信息列表
  openErrList(e) {
    console.log(e.target);
  }

  //提交
  panelSubmit() {
    let err = '';
    if (!this.item.portNo) {
      err = '请先选择冲压线';
    }
    if (!this.item.partPanel) {
      err = '请先扫描上料口或捆包号';
    }
    if (new Set(this.item.bundles).size !== this.item.bundles.length) {
      err = '提交的数据中存在重复的捆包号，请检查';
    };
    if (err.length) {
      this.insertError(err);
      this.setFocus();
      return;
    }
    for (let i = 0; i <= this.item.partPanel.length - 1; i++) {
      this.bundles.push(this.item.partPanel[i]);//赋值给新的容器
      this.bundles[i].productionStatus = 3;//提交把状态改为3，表示被替换
    }

    this.api.post('PP/PostFeedingPort', this.item).subscribe((res: any) => {
      if (res.successful) {
        //把选中的冲压线写入缓存，下次默认选中
        this.storage.set('PortNo', this.item.portNo);
        this.item.partPanel = [];
        this.toastCtrl.create({
          message: '提交成功',
          duration: 1500,
          position: 'buttom'
        }).present();
      } else {
        this.insertError(res.message);
      }
    },
      error => {
        this.insertError('系统级别错误');
      });
    this.setFocus();
  }
  //撤销操作
  cancel() {
    //if (!this.item.partPanel) {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销本次的操作记录,您确认要执行撤销操作吗？',
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
  //撤销（会清除缓存）
  cancel_do() {
    this.insertError('正在撤销...', 2);
    this.bundles = [];
    this.item.partPanel = [];
    this.storage.set('PortNo', null);  //清空缓存
    this.insertError("撤销成功");
    this.errors = [];
    this.setFocus();
  }
  setFocus() {
    this.code = '';
    this.searchbar.setFocus();
  }

  clearPartPanel() { //下拉框改变，清空已扫描的捆包号
    this.item.partPanel = [];
  }

  //更新上料口下拉框
  updateDropDownList(portNo) {
    this.item.portNo = portNo;
    this.item.partPanel = [];
  }
}
