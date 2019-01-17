import {Component, ChangeDetectorRef } from '@angular/core';
import {IonicPage, LoadingController,  NavParams, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

/**
 * Generated class for the OutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-out',
  templateUrl: 'out.html',
})
export class OutPage extends BaseUI {
  ScanNo: string = "";                      //记录扫描编号
  ScanFlag: number = 0;                   //扫描标记：0初始标记，1已扫单，2已扫箱
  ScanPlaceHolder:string = "请扫描请求单号";   //扫描文本框placeholder属性
  Sheet: any = {};                              //出库请求单
  SheetDetail: any[];                     //出库请求单零件列表

  constructor(public navParams: NavParams,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public api: Api,
              public alertCtrl: AlertController,
              public modalCtrl:ModalController,
              public changeDetectorRef:ChangeDetectorRef,
              public actionSheetController:ActionSheetController) {
    super();
  }
  //扫描
  Scan() {
    if (this.CheckScanCode()) {
      //扫单
      if (this.ScanFlag == 0) {
        this.ScanSheet()
      } else {   //扫箱
        this.ScanBarCode();
      }
    } else {
      this.ScanNo = "";   //置空扫描框
    }
  }

  //扫单
  ScanSheet() {
    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.get('WM/GetAboutIssueRequest', {requestNo: this.ScanNo}).subscribe((res: any) => {
        if (res.successful) {
          this.Sheet = res.data.Sheet;
          this.SheetDetail = res.data.SheetDetail;
          this.ScanFlag = 1;
          this.ScanPlaceHolder = "请扫描料箱";
          this.ScanNo = "";                                 //扫描框设置为空
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
      },
      err => {
        super.showMessageBox(this.alertCtrl,err,'错误提示');
        loading.dismiss();
      });
  }

  //校验扫描
  CheckScanCode() {
    if (this.ScanNo == "" && this.ScanFlag == 0) {
      super.showToast(this.toastCtrl, "请扫描单据号！")
      return false;
    } else if (this.ScanNo == "" && this.ScanFlag == 1) {
      super.showToast(this.toastCtrl, "请扫描箱标签！")
      return false;
    } else if (this.ScanNo.substr(0, 2).toUpperCase() != "RS" && this.ScanNo.substr(0, 2).toUpperCase() != "LN") {
      super.showToast(this.toastCtrl, "非法扫描！")
      return false;
    } else if (this.ScanNo.substr(0, 2).toUpperCase() == "LN" && this.ScanFlag == 0) {
      super.showToast(this.toastCtrl, "请先扫单据编号！")
      return false;
    } else if (this.ScanNo.substr(0, 2).toUpperCase() == "LN" && this.ScanFlag == 1 && !this.Sheet.is_scanbox) {
      super.showToast(this.toastCtrl, "该单据不需要扫料箱！")
      return false;
    }
    return true;
  }

  //扫箱
  ScanBarCode() {
    let supplier_number = this.ScanNo.substr(2, 9).replace(/(^0*)/, "");
    let part_num = this.ScanNo.substr(11, 8).replace(/(^0*)/, "");
    let part = this.SheetDetail.find(item => item.part_no === part_num && item.is_operate === false);
    let partIndex = this.SheetDetail.findIndex(item => item.part_no === part_num);
    let isAdd = this.SheetDetail.indexOf(item => item.part_no === part_num && item.supplier_id === supplier_number && item.is_operate === true) > 0 ? false : true;

    if (partIndex < 0) {
      super.showToast(this.toastCtrl, "单据中不存在该零件！");
      return;
    }
    else if ((part.received_part_count >= part.allow_part_qty || part.received_part_count + part.pack_stand_qty > part.allow_part_qty) && (part.received_pack_count>=part.allow_pack_qty || part.received_pack_count+1>part.allow_pack_qty)) {
      super.showToast(this.toastCtrl, "零件达到需求数量，扫箱不执行！")
      return;
    }

    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.get('WM/GetOutInboundScanBarCoe', {
      barcode: this.ScanNo,
      sheetId: this.Sheet.id,
      sheetDetailId: part.sheet_detail_id,
      isAdd: isAdd,
      isOutStock: true
    }).subscribe((res: any) => {
        if (res.successful) {
          if(res.data.length>0) {
            for (let partInfo of res.data) {
              let index = this.SheetDetail.findIndex(item => item.id === partInfo.id)
              if (index >= 0) {
                this.SheetDetail[index].received_pack_count = partInfo.received_pack_count;
                this.SheetDetail[index].received_part_count = partInfo.received_part_count;
              } else {
                if (partInfo.is_new_add) {
                  index = this.SheetDetail.findIndex(item => item.part_no === partInfo.part_no && item.is_operate === false);
                  if(index!=this.SheetDetail.length-1) {
                    this.SheetDetail.splice(index + 1, 0, partInfo);
                  }
                  else{
                    this.SheetDetail.push(partInfo);
                  }
                }
              }
            }
            this.ScanNo = "";      //扫描框设置为空
            this.RefreshDataModal();    //手工调用页面加载数据模型
          }
        }
        else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
      },
      err => {
        super.showMessageBox(this.alertCtrl,err,'错误提示');
        loading.dismiss();
      });
  }

  //手工调用，重新加载数据模型
  RefreshDataModal(){
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
  }

  //切换供应商
  SwitchSupplier(id) {
    let curr_part_index = this.SheetDetail.findIndex(item => item.id === id);
    let curr_part = this.SheetDetail[curr_part_index];
    if((this.Sheet.is_scanbox && curr_part.is_scan) || !this.Sheet.is_scanbox) {
      // let alert_tool = this.alertCtrl.create();
      // alert_tool.setSubTitle('选择供应商');
      // for (let supplier of curr_part.supplier_list) {
      //   alert_tool.addInput({
      //     type: 'radio',
      //     label: supplier.supplier_name,
      //     value: supplier.supplier_code,
      //     checked: supplier.supplier_code === curr_part.supplier_id ? true : false,
      //   });
      // }
      // alert_tool.addButton({text: '取消', role: 'cancel'});
      // alert_tool.addButton({
      //   text: '确认',
      //   role: 'role',
      //   handler: data => {
      //     this.ExcuseSwitchSupplier(curr_part, curr_part_index, data)
      //   }
      // });
      // alert_tool.present();
      let actAlert = this.actionSheetController.create();
      actAlert.setTitle('供应商');
      for(let supplier of curr_part.supplier_list){
        actAlert.addButton({
          text:supplier.supplier_name,
          handler:() =>{
            this.ExcuseSwitchSupplier(curr_part, curr_part_index, supplier.supplier_code);
          }
        })
      }
      actAlert.present();
    }
    else {
      super.showToast(this.toastCtrl, "请先扫描箱标签！")
    }
  }

  //执行更新供应商
  ExcuseSwitchSupplier(curr_part,index,supplier_code) {
    let suppliers = curr_part.supplier_list.find(item=>item.supplier_code===supplier_code);
    if(typeof(suppliers)!="undefined" && suppliers!=null){
      let loading = super.showLoading(this.loadingCtrl, "提交中...");
      this.api.get('WM/GetModifySupplier', {
        id:curr_part.id,
        supplierName:suppliers.supplier_name,
        supplierCode:suppliers.supplier_code,
        IsOutStock:true
      }).subscribe((res: any) => {
          if (res.successful) {
            this.SheetDetail[index].supplier_id = suppliers.supplier_code;
            this.SheetDetail[index].suplier_name = suppliers.supplier_name;
            this.RefreshDataModal();
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
          loading.dismiss();
        },
        err => {
          super.showMessageBox(this.alertCtrl,err,'错误提示');
          loading.dismiss();
        });
    }
  }

  //非标跳转Modal页
  UnStandModify(id){
    let curr_part_index = this.SheetDetail.findIndex(item => item.id === id);        //当前呈现数据源操作零件的index
    let curr_part = this.SheetDetail[curr_part_index];                                           //获取呈现数据的当前操作零件的行;
    if((this.Sheet.is_scanbox && curr_part.is_scan) || !this.Sheet.is_scanbox) {
      let MaxAllowNumber = 0;
      //统计已收数量
      if (curr_part.is_operate === true) {
        MaxAllowNumber = curr_part.allow_part_qty - this.SheetDetail.find(item => item.part_no === curr_part.part_no && item.is_operate === false).received_part_count;
      } else {
        MaxAllowNumber = curr_part.allow_part_qty;
      }

      let unstdModal = this.modalCtrl.create('UnstandPage', {
        BoxNumber: curr_part.received_pack_count,
        PartNumber: curr_part.received_part_count,
        StandPack: curr_part.pack_stand_qty,
        MaxPartNumber: MaxAllowNumber
      });
      unstdModal.onDidDismiss(data => {
        if (data != null) {
          this.UnStandReSetNumber(curr_part.id, data.BoxNumber, data.PartNumber);
        }
      });
      unstdModal.present();
    }
    else {
      super.showToast(this.toastCtrl,  "请先扫描箱标签！");
    }
  }

  //修改成功后的回调
  UnStandReSetNumber(id,box_number,part_number){
    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.get('WM/GetUnStandModifyNumber', {
      id:id,
      boxNum:box_number,
      partNum:part_number,
      IsOutStock:true
    }).subscribe((res: any) => {
        if (res.successful) {
          if(res.data.length>0){
            for(let partInfo of res.data) {
              let index = this.SheetDetail.findIndex(item => item.id ===partInfo.id)
              if(index>0){
                this.SheetDetail[index].received_pack_count=partInfo.received_pack_count;
                this.SheetDetail[index].received_part_count=partInfo.received_part_count;
                this.RefreshDataModal();
              }
            }
          }
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
      },
      err => {
        super.showMessageBox(this.alertCtrl,err,'错误提示');
        loading.dismiss();
      });
  }

  //出库
  OutStock() {
    let NotStand = this.SheetDetail.find(item => item.received_part_count > item.allow_part_qty);
    let NotFull = this.SheetDetail.find(item => item.received_part_count < item.allow_part_qty);
    if (Array.isArray(NotStand) && NotStand.length > 0) {
      super.showMessageBox(this.alertCtrl, "零件[" + NotStand[0].part_no + "]超出剩余数量！", '提示');
      return;
    }
    if (Array.isArray(NotFull) && NotFull.length > 0 && !this.Sheet.is_wave_operate) {
      this.alertCtrl.create({
        title:'提示',
        message:'单据存在零件的实出数没有满足需求数，出库后该单据将会完成，不能再次操作！',
        buttons:[{
          text:'取消',
          handler:()=>{
            return;
          }
        },{
          text:'确认',
          handler:()=>{
            this.ExcuseOutStock();
          }
        }]
      });
    }
    else{
      this.ExcuseOutStock();
    }
  }
  //执行出库
  ExcuseOutStock(){
    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.get('WM/GetExcuseOutStock', {
      id:this.Sheet.id
    }).subscribe((res: any) => {
        if (res.successful && res.data) {
          this.Sheet = {};
          this.SheetDetail = [];
          this.ScanNo = '';
          this.ScanPlaceHolder = '请扫描单号';
          this.ScanFlag = 0;

          super.showToast(this.toastCtrl, '出库成功！');
        } else {
          super.showMessageBox(this.alertCtrl, res.message, '错误提示');
        }
        loading.dismiss();
      },
      err => {
        super.showMessageBox(this.alertCtrl,err,'错误提示');
        loading.dismiss();
      });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad OutPage');
  }

}
