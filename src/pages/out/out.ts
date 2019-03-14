import {Component, ViewChild} from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavParams,
  //NavController,
  ToastController,
  AlertController,
  ModalController,
  ActionSheetController,
  Searchbar
} from 'ionic-angular';
import {Api} from '../../providers';
import {BaseUI} from '../baseUI';
import {fromEvent} from "rxjs/observable/fromEvent";

@IonicPage()
@Component({
  selector: 'page-out',
  templateUrl: 'out.html',
})
export class OutPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  scanFlag: number = 0;                   //扫描标记：0初始标记，1已扫单，2已扫箱
  barTextHolderText: string = '请扫描出库请求单二维码';   //扫描文本框placeholder属性
  sheet: any = {};                              //出库请求单
  parts: any[] = [];                     //出库请求单零件列表
  current_part_index: number = 0;

  keyPressed : any;
  constructor(public navParams: NavParams,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              //private navCtrl: NavController,
              public api: Api,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              //public changeDetectorRef: ChangeDetectorRef,
              public actionSheetController: ActionSheetController) {
    super();
  }

  keyDown (event) {
    switch (event.keyCode) {
      /*case 13:
        //enter
        this.searchbar.setFocus();
        break;*/
      case 112:
        //f1
        this.outStock();
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
    //alert("out page onKeyDown:" + event.keyCode);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.addkey();
    });
  }
  ionViewWillUnload() {
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

  scan() {
    if (this.checkScanCode()) {
      if (this.scanFlag == 0) {
        //扫单
        this.scanSheet();
      } else {
        //扫箱
        this.scanBox();
      }
    } else {
      this.resetScan();
    }
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
      } else if (prefix === 'LN' && this.code.length != 24) {
        err = '箱标签格式不正确';
      }
    }


    if (err.length > 0) {
      super.showToast(this.toastCtrl, err, 'error');
      //this.popToastView("手机号不能为空",1000);
      this.resetScan();
      return false;
    }

    return true;
  }

  //扫单
  scanSheet() {
    let loading = super.showLoading(this.loadingCtrl, '数据准备中...');
    this.api.get('wm/getAboutIssueRequest', {requestNo: this.code}).subscribe((res: any) => {
        if (res.successful) {
          this.sheet = res.data.Sheet;
          this.parts = res.data.SheetDetail;
          this.scanFlag = 1;
          this.barTextHolderText = '请扫描料箱标签';
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
        this.resetScan();
        //this.code = '';
        //this.searchbar.setFocus();
      },
      err => {
        super.showMessageBox(this.alertCtrl, err, '错误提示');
        loading.dismiss();
        this.code = '';
      });
  }

  //扫箱
  scanBox() {
    let err = '';

    let supplier_number = this.code.substr(2, 9).replace(/(^0*)/, '');
    let part_num = this.code.substr(11, 8).replace(/(^0*)/, '');
    let std_qty = parseInt(this.code.substr(19, 5));
    let part = this.parts.find(m => m.part_no === part_num && m.is_operate === false);

    let current_index = this.parts.findIndex(m => m.part_no === part_num && m.supplier_id === supplier_number);

    let isAdd = this.parts.findIndex(m => m.part_no === part_num
      && m.supplier_id === supplier_number
      && m.is_operate === true) > 0 ? false : true;

    if (current_index < 0) {
      err = '单据中不存在该零件！';
    } else if ((part.received_part_count >= part.allow_part_qty || part.received_part_count + part.pack_stand_qty > part.allow_part_qty)
      && (part.received_pack_count >= part.allow_pack_qty || part.received_pack_count + 1 > part.allow_pack_qty)) {
      //err = '零件' + part_num + '达到需求数量，不能继续扫箱！';
    }

    if(err.length){
      super.showToast(this.toastCtrl, err, 'error');
      this.resetScan();
      return;
    }

    //let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.api.get('wm/getOutInboundScanBarCoe', {
      barcode: this.code,
      sheetId: this.sheet.id,
      sheetDetailId: part.sheet_detail_id,
      isAdd: isAdd,
      isOutStock: true
    }).subscribe((res: any) => {
        if (res.successful) {
          if (res.data.length > 0) {
            res.data.forEach((partInfo, i) => {
              let index = this.parts.findIndex(item => item.id === partInfo.id);

              if (index >= 0) {

                this.parts[index].received_pack_count = partInfo.received_pack_count;
                this.parts[index].received_part_count = partInfo.received_part_count;
                this.parts[index].is_scan = true;

                //if scan all boxes of this part, go to next part
                if(this.parts[index].received_part_count == this.parts[index].required_part_count){
                  this.switchPart(1);
                }

              } else {
                if (partInfo.is_new_add) {
                  index = this.parts.findIndex(item => item.part_no === partInfo.part_no && !item.is_operate);
                  if (index != this.parts.length - 1) {
                    this.parts.splice(index + 1, 0, partInfo);
                  } else {
                    this.parts.push(partInfo);
                  }
                }
              }
            });
            if(res.data[0].pack_stand_qty != std_qty) {
              super.showToast(this.toastCtrl, '提醒：箱标签包装数与基础数据包装不一致');
            }
            this.current_part_index = current_index;
          }
        }
        else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
        //loading.dismiss();
        this.resetScan();
      },
      err => {
        super.showToast(this.toastCtrl, '系统错误，请稍后再试', 'error');
        //loading.dismiss();
        this.resetScan();
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

    // let m1 = this.parts.reduce((result, item) => item.required_part_count + result, 0);
    // let m2 = this.parts.reduce((result, item) => item.received_part_count + result, 0);
    // return p > 0 ? (parseFloat(m2.toString()) * 100 / parseFloat(m1.toString())).toFixed(0) : 100;
  }
  get okmsg() {
    let c = this.parts.filter(item => {
      return !item.received_part_count || item.received_part_count < item.required_part_count;
    }).length;
    return c === 0 ? '本单已全部扫箱完成' : null;
  }

  //手工调用，重新加载数据模型
  resetScan() {
    //this.changeDetectorRef.detectChanges();
    //this.changeDetectorRef.markForCheck();

    setTimeout(() => {
      this.code = '';
      this.searchbar.setFocus();
    }, 500);
  }

  //切换供应商
  switchSupplier(curr_part: any) {
    //let curr_part_index = this.parts.findIndex(item => item.id === id);
    //let curr_part = this.parts[curr_part_index];
    if ((this.sheet.is_scanbox && curr_part.is_scan) || !this.sheet.is_scanbox) {

      let actAlert = this.actionSheetController.create();
      actAlert.setTitle('选择供应商');
      for (let supplier of curr_part.supplier_list) {
        actAlert.addButton({
          text: supplier.supplier_name,
          handler: () => {
            this.excuseSwitchSupplier(curr_part, supplier);
          }
        })
      }
      actAlert.present();

    }
    else {
      super.showToast(this.toastCtrl, '请先扫描箱标签！')
    }
  }

  //执行更新供应商
  excuseSwitchSupplier(curr_part: any, supplier: any) {
    //let suppliers = curr_part.supplier_list.find(item => item.supplier_code === supplier_code);
    //if (typeof(suppliers) != 'undefined' && suppliers != null) {
      let loading = super.showLoading(this.loadingCtrl, '提交中...');
      this.api.get('wm/getModifySupplier', {
        id: curr_part.id,
        supplierName: supplier.supplier_name,
        supplierCode: supplier.supplier_code,
        IsOutStock: true
      }).subscribe((res: any) => {
          if (res.successful) {
            curr_part.supplier_id = supplier.supplier_code;
            curr_part.supplier_name = supplier.supplier_name;

            this.resetScan();

          } else {
            super.showToast(this.toastCtrl, res.message);
          }
          loading.dismiss();
        },
        err => {
          super.showToast(this.toastCtrl, '系统错误，请重试', 'error');
          loading.dismiss();
        });
    //}
  }

  //非标跳转Modal页
  changeQty(curr_part: any) {
    //let curr_part_index = this.parts.findIndex(item => item.id === id);        //当前呈现数据源操作零件的index
    //let curr_part = this.parts[curr_part_index];                                           //获取呈现数据的当前操作零件的行;
    if ((this.sheet.is_scanbox && curr_part.is_scan) || !this.sheet.is_scanbox) {
      let _max = 0;
      //统计已收数量
      if (curr_part.is_operate) {
        _max = curr_part.allow_part_qty - this.parts.find(item => item.part_no === curr_part.part_no && item.is_operate === false).received_part_count;
      } else {
        _max = curr_part.allow_part_qty;
      }

      let _m = this.modalCtrl.create('UnstandPage', {
        boxes: curr_part.received_pack_count,
        parts: curr_part.received_part_count,
        std_qty: curr_part.pack_stand_qty,
        max_parts: _max
      });
      _m.onDidDismiss(data => {
        if (data) {
          this.resetQty(curr_part.id, data.boxes, data.parts);
        }
      });
      _m.present();
    }
    else {
      super.showToast(this.toastCtrl, '请先扫描箱标签！', 'error');
    }
  }

  //修改成功后的回调
  resetQty(id: number, box_number:number, part_number:number) {
    let loading = super.showLoading(this.loadingCtrl, '正在处理...');
    this.api.get('wm/getUnStandModifyNumber', {
      id: id,
      boxNum: box_number,
      partNum: part_number,
      IsOutStock: true
    }).subscribe((res: any) => {
        if (res.successful) {
          res.data.forEach((partInfo, i) => {
            this.parts.forEach((item, pindex) => {
              if (item.id === partInfo.id) {
                item.received_pack_count = partInfo.received_pack_count;
                item.received_part_count = partInfo.received_part_count;

                this.resetScan();
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
    let res = 'primary';
    if (p.received_part_count > p.required_part_count) {
      res = 'danger';
    } else if (p.received_part_count === p.allow_part_qty) {
      res = 'secondary';
    } else if (p.received_part_count === 0) {
      res = 'dark';
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
    this.api.get('wm/GetCancelRequest', { t: 0, requestId: this.sheet.id }).subscribe((res: any) => {
        if (res.successful && res.data) {
          this.reset_page();
          super.showToast(this.toastCtrl, '撤销成功！', 'success');
          this.resetScan();
        } else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
        loading.dismiss();
      },
      err => {
        super.showToast(this.toastCtrl, '系统级别错误', 'error');
        loading.dismiss();
      });
  }

  //出库
  outStock() {
    if (this.scanFlag === 0) {
      super.showToast(this.toastCtrl, '请先扫描出库请求单二维码');
      return;
    }
    let over = this.parts.filter(item => item.received_part_count > item.allow_part_qty);
    if (Array.isArray(over) && over.length > 0) {
      super.showToast(this.toastCtrl, '零件[' + over[0].part_no + ']超出剩余数量！', 'error');
      return;
    }

    let msg = '';
    let less = this.parts.filter(item => item.received_part_count < item.allow_part_qty);
    if (Array.isArray(less) && less.length > 0 && !this.sheet.is_wave_operate) {
      msg = '本单不允许多次出库，且该单有实出数未满足需求的零件，出库后该单据将会完成，将不能再次操作！';
    }

    let _m = this.modalCtrl.create('OutConfirmPage', {
      type: '出库',
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

  reset_page(){
    this.sheet = {};
    this.parts = [];
    this.code = '';
    this.barTextHolderText = '请扫描出库请求单号';
    this.scanFlag = 0;
    this.current_part_index = 0;
  }
}
