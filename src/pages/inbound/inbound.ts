import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams, Searchbar,
  ToastController
} from 'ionic-angular';
import {BaseUI} from '../baseUI';
import {Api} from '../../providers';
import {fromEvent} from "rxjs/observable/fromEvent";

@IonicPage()
@Component({
  selector: 'page-inbound',
  templateUrl: 'inbound.html',
})
export class InboundPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  scanFlag: number = 0;                   //扫描标记：0初始标记，1已扫单，2已扫箱
  barTextHolderText: string = '请扫描入库请求单二维码';   //扫描文本框placeholder属性
  sheet: any = {};                              //出库请求单
  parts: any[] = [];                     //出库请求单零件列表

  current_part_index: number = 0;
  keyPressed : any;
  constructor(public navParams: NavParams,
              //private navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public api: Api,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              public changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  keyDown (event) {
    debugger;
    switch (event.keyCode) {
      case 13:
        //enter
        this.searchbar.setFocus();
        break;
      case 112:
        //f1
        this.inbound();
        break;
      case 113:
        //f2
        this.cancel();
        break;

      case 37:
        //left
        this.switchPart(-1);
        break;
      case 39:
        //right
        this.switchPart(1);
        break;
    }
  }
  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.addkey();
    });
  }
  ionViewWillUnload(){
    this.removekey();
  }
  addkey = () =>{
    this.keyPressed = fromEvent(document, 'keydown').subscribe(event => {
      this.keyDown(event);
    });
  }
  removekey = () =>{
    this.keyPressed.unsubscribe();
  }

  //扫描
  scan() {
    if (this.checkScanCode()) {
      if (this.scanFlag == 0) {
        //扫单
        this.scanSheet()
      } else {
        //扫箱
        this.scanBox();
      }
    } else {
      this.code = '';   //置空扫描框
    }
    this.searchbar.setFocus();
  }

  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.code == '' && this.scanFlag == 0) {
      err = '请扫描单据号！';
    } else if (this.code == '' && this.scanFlag == 1) {
      err = '请扫描箱标签！';
    } else {

      let prefix = this.code.substr(0, 2).toUpperCase();

      if (prefix != 'RS' && prefix != 'LN') {
        err = '无效的扫描，请重试！';
      } else if (prefix == 'LN' && this.scanFlag == 0) {
        err = '请先扫单据二维码！';
      } else if (prefix == 'LN' && this.scanFlag == 1 && !this.sheet.is_scanbox) {
        err = '该单据不需要扫料箱！';
      }
    }

    if (err.length > 0) {
      super.showToast(this.toastCtrl, err);
      this.code = ''
      this.searchbar.setFocus();
      return false;
    }

    return true;
  }

  //扫单
  scanSheet() {
    let loading = super.showLoading(this.loadingCtrl, '数据准备中...');
    this.api.get('wm/getAboutInboundRequest', {requestNo: this.code}).subscribe((res: any) => {
        if (res.successful) {
          this.sheet = res.data.Sheet;
          this.parts = res.data.SheetDetail;
          this.scanFlag = 1;
          this.barTextHolderText = '请扫描料箱';
          this.code = '';
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
        this.refreshDataModal();
      },
      err => {
        super.showMessageBox(this.alertCtrl, err, '错误提示');
        loading.dismiss();
        this.refreshDataModal();
      });
  }

  //扫箱
  scanBox() {
    let supplier_number = this.code.substr(2, 9).replace(/(^0*)/, '');
    let part_num = this.code.substr(11, 8).replace(/(^0*)/, '');
    let part = this.parts.find(item => item.part_no === part_num && item.is_operate === false);
    this.current_part_index = this.parts.findIndex(item => item.part_no === part_num);
    let isAdd = this.parts.findIndex(item => item.part_no === part_num && item.supplier_id === supplier_number && item.is_operate === true) > 0 ? false : true;

    if (this.current_part_index < 0) {
      super.showToast(this.toastCtrl, '单据中不存在该零件！');
      return;
    }
    else if ((part.received_part_count >= part.allow_part_qty || part.received_part_count + part.pack_stand_qty > part.allow_part_qty)
      && (part.received_pack_count >= part.allow_pack_qty || part.received_pack_count + 1 > part.allow_pack_qty)) {
      super.showToast(this.toastCtrl, '零件达到需求数量，不能继续扫箱！')
      return;
    }

    let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.api.get('wm/getOutInboundScanBarCoe', {
      barcode: this.code,
      sheetId: this.sheet.id,
      sheetDetailId: part.sheet_detail_id,
      isAdd: isAdd,
      isOutStock: false
    }).subscribe((res: any) => {
        if (res.successful) {
          if (res.data.length > 0) {
            res.data.forEach((partInfo, i) => {
              let index = this.parts.findIndex(item => item.id === partInfo.id)
              if (index >= 0) {
                this.parts[index].received_pack_count = partInfo.received_pack_count;
                this.parts[index].received_part_count = partInfo.received_part_count;
              } else {
                if (partInfo.is_new_add) {
                  index = this.parts.findIndex(item => item.part_no === partInfo.part_no && item.is_operate === false);
                  if (index != this.parts.length - 1) {
                    this.parts.splice(index + 1, 0, partInfo);
                  }
                  else {
                    this.parts.push(partInfo);
                  }
                }
              }
            });
          }
        }
        else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
        this.refreshDataModal();
      },
      err => {
        super.showMessageBox(this.alertCtrl, err, '错误提示');
        loading.dismiss();
        this.refreshDataModal();
      });
  }

  switchPart(o) {
    if (o > 0) {
      this.current_part_index < this.parts.length - 1 && this.current_part_index++;
    } else {
      this.current_part_index > 0 && this.current_part_index--
    }
  }

  get all_right() {
    let p = this.parts.length;
    if(!p) {
      return 0;
    }
    let c = this.parts.filter(item => {
      return item.is_scan;
    }).length;

    return p > 0 ? (parseFloat(c.toString()) * 100 / parseFloat(p.toString())).toFixed(0) : 100;
  }


  //手工调用，重新加载数据模型
  refreshDataModal() {
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();

    this.code = '';
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 1000);
  }

  //非标跳转Modal页
  changeQty(curr_part) {
    //let curr_part_index = this.parts.findIndex(item => item.id === id);        //当前呈现数据源操作零件的index
    //let curr_part = this.parts[curr_part_index];                                           //获取呈现数据的当前操作零件的行;
    if ((this.sheet.is_scanbox && curr_part.is_scan) || !this.sheet.is_scanbox) {

      //统计已收数量
      let _max = curr_part.allow_part_qty;

      let _m = this.modalCtrl.create('UnstandPage', {
        boxes: curr_part.received_pack_count,
        parts: curr_part.received_part_count,
        std_qty: curr_part.pack_stand_qty,
        max_parts: _max
      });
      _m.onDidDismiss(data => {
        if (data != null) {
          this.resetQty(curr_part.id, data.boxes, data.parts);
        }
      });
      _m.present();
    }
    else {
      super.showToast(this.toastCtrl, '请先扫描箱标签！');
    }
  }

  //修改成功后的回调
  resetQty(id: number, box_number: number, part_number: number) {
    let loading = super.showLoading(this.loadingCtrl, '正在处理...');
    this.api.get('wm/getUnStandModifyNumber', {
      id: id,
      boxNum: box_number,
      partNum: part_number,
      IsOutStock: false
    }).subscribe((res: any) => {
      if (res.successful) {
        res.data.forEach((partInfo, i) => {
          this.parts.forEach((item, pindex) => {
            if (item.id === partInfo.id) {
              item.received_pack_count = partInfo.received_pack_count;
              item.received_part_count = partInfo.received_part_count;

              this.refreshDataModal();
            }
          });
        });
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
      loading.dismiss();
    },
    err => {
      super.showMessageBox(this.alertCtrl, err, '错误提示');
      loading.dismiss();
    });
  }

  bgColor(p: any) {
    let res = '';
    if (p.received_part_count > p.required_part_count) {
      res = 'danger';
    } else if (p.received_part_count === p.required_part_count) {
      res = 'green';
    }
    else if (p.received_part_count === 0) {
      res = 'light';
    } else {
      res = 'danger';
    }
    return res;
  }

  cancel() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销刚才本次的操作记录，不可恢复。您确认要执行全单撤销操作吗？',
      buttons: [{
        text: '不撤销',
        handler: () => {}
      }, {
        text: '确认撤销',
        handler: () => {
          this.cancel_do();
        }
      }]
    });
    prompt.present();
  }
  cancel_do(){
    let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.api.get('wm/GetCancelRequest', {t: 1, requestId: this.sheet.id }).subscribe((res: any) => {
        if (res.successful && res.data) {
          this.reset_page();
          super.showToast(this.toastCtrl, '撤销成功！');
        } else {
          super.showMessageBox(this.alertCtrl, res.message, '错误提示');
        }
        loading.dismiss();
      },
      err => {
        super.showMessageBox(this.alertCtrl, err, '错误提示');
        loading.dismiss();
      });
  }


  //入库
  inbound() {
    if (this.scanFlag === 0) {
      super.showToast(this.toastCtrl, '请先扫描出库请求单二维码');
      return;
    }

    let NotStand = this.parts.find(item => item.received_part_count > item.allow_part_qty);
    let NotFull = this.parts.find(item => item.received_part_count < item.allow_part_qty);
    if (Array.isArray(NotStand) && NotStand.length > 0) {
      super.showMessageBox(this.alertCtrl, '零件[' + NotStand[0].part_no + ']超出剩余数量！', '提示');
      return;
    }
    let msg = '';
    if (Array.isArray(NotFull) && NotFull.length > 0 && !this.sheet.is_wave_operate) {
      msg = '本单不允许多次出库，且该单有实出数未满足需求的零件，出库后该单据将会完成，将不能再次操作！';
    }
    /*if (Array.isArray(notFull) && notFull.length > 0 && !this.sheet.is_wave_operate) {
      this.alertCtrl.create({
        title: '提示',
        message: '单据存在零件的实出数没有满足需求数，入库后该单据将会完成，不能再次操作！',
        buttons: [{
          text: '取消',
          handler: () => {
            return;
          }
        }, {
          text: '确认',
          handler: () => {
            this.execInbound();
          }
        }]
      });
    }
    else {
      this.execInbound();
    }*/

    let _m = this.modalCtrl.create('OutConfirmPage', {
      type: '入库',
      msg: msg,
      sheet: this.sheet,
      parts: this.parts
    });
    _m.onDidDismiss(data => {
      this.addkey();
      if (data) {
        this.reset_page();
      }
    });
    _m.present();
    this.removekey();
  }

  //执行出库
  /*
  */

  reset_page(){
    this.sheet = {};
    this.parts = [];
    this.code = '';
    this.barTextHolderText = '请扫描入库请求单号';
    this.scanFlag = 0;
    this.current_part_index = 0;
  }
}
