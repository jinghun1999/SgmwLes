import {Component, ViewChild} from '@angular/core';
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams, Searchbar,
  ToastController
} from 'ionic-angular';
import {BaseUI} from '../baseUI';
import {Api} from '../../providers';
import {Storage} from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-jisOutStock',
  templateUrl: 'jisOutStock.html',
})
export class JisOutStockPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  label: string = '';                      //记录扫描编号
  barTextHolderText: string = '请扫描包装标签';   //扫描文本框placeholder属性
  workshop_list: any[] = [];
  item: any = {
    plant: '',                            //工厂
    workshop: '',                         //车间
    target:'',                            //去向车间
    parts: [],                            //出库零件列表
  };


  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public api: Api,
              public modalCtrl: ModalController,
              public storage: Storage) {
    super();
  }

  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val)=>{
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getWorkshops();
    });
  }

  private getWorkshops() {
    let loading = super.showLoading(this.loadingCtrl, '加载中...');
    this.api.get('system/getPlants', {plant: this.api.plant}).subscribe((res: any) => {
        loading.dismiss();

        if (res.successful) {
          this.workshop_list = res.data;

        } else {
          super.showToast(this.toastCtrl, res.message);
        }
      },
      err => {
        loading.dismiss();
        alert(JSON.stringify(err))
      });
  }

  //扫描
  scan() {
    if (this.checkScanCode()) {
      //扫箱
      this.scanBox();
    } else {
      this.label = '';   //置空扫描框
    }

    this.searchbar.setFocus();
  }

  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.label == '') {
      err = '请扫描包装标签！';
    } else {
      let prefix = this.label.substr(0, 2).toUpperCase();

      if (prefix != 'LN') {
        err = '无效的扫描，请重试！';
      } else if (prefix == 'LN' && this.label.length != 24) {
        err = '无效的扫描，请重试！';
      }
    }

    if (err.length > 0) {
      super.showToast(this.toastCtrl, err);
      this.label = '';
      this.searchbar.setFocus();
      return false;
    }
    return true;
  }

  //扫箱
  scanBox() {
    if (this.label && this.label.length === 24 && this.label.substr(0, 2).toUpperCase() === 'LN') {
      let _supplier_number = this.label.substr(2, 9).replace(/(^0*)/, '');
      let _part_num = this.label.substr(11, 8).replace(/(^0*)/, '');

      let i = this.item.parts.findIndex(p => p.part_no === _part_num && p.supplier_id === _supplier_number);
      if (i >= 0) {
        super.showToast(this.toastCtrl, '该标签已扫描，不能重复添加');
        this.label = '';
        this.searchbar.setFocus();
        return;
      }
      //合法标签
      let loading = super.showLoading(this.loadingCtrl, '加载中...');
      this.api.get('wm/getPartByLN', {
        plant: this.item.plant,
        workshop: this.item.workshop,
        ln: this.label
      }).subscribe((res: any) => {
          if (res.successful) {
            let pts = res.data;
            if (pts.length > 0) {
              this.item.parts.push({
                plant: pts[0].plant,
                workshop: pts[0].workshop,
                part_no: pts[0].part_no,
                part_name: pts[0].part_name,
                supplier_id: pts[0].supplier_id,
                supplier_name: pts[0].supplier_name,
                dloc: pts[0].dloc,
                unit: pts[0].unit,
                std_qty: pts[0].pack_std_qty,
                current_boxes: pts[0].boxes,
                current_parts: pts[0].parts,
                require_boxes: 1,
                require_parts: 1,
              });
              super.showToast(this.toastCtrl, '已添加零件' + pts[0].part_name);
              this.label = '';
            }
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
          loading.dismiss();
          this.label = '';
          this.searchbar.setFocus();
        },
        (error) => {
          alert('系统错误,' + error);
          loading.dismiss();
          this.label = '';
          this.searchbar.setFocus();
        });
    } else {
      super.showToast(this.toastCtrl, '无效的箱标签，请重试');
      this.label = '';
      this.searchbar.setFocus();
    }
  }

  //非标跳转Modal页
  changeQty(part) {
    let _m = this.modalCtrl.create('UnstandPage', {
      boxes: part.require_boxes,
      parts: part.require_parts,
      std_qty: part.std_qty,
      max_parts: part.current_parts,
    });
    _m.onDidDismiss(data => {
      if (data) {
        part.require_boxes = data.boxes;
        part.require_parts = data.parts;
      }
    });
    _m.present();
  }

  //出库
  jisOutStock() {
    let err = '';
    if (!this.item.parts.length) {
      err += '请添加出库的零件';
    }
    if (err.length) {
      super.showToast(this.toastCtrl, err);
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, '正在提交...');
    this.api.post('wm/postJisOutStock', this.item).subscribe((res: any) => {
        if (res.successful) {
          this.item.trans_code = '';
          this.item.parts = [];
          super.showToast(this.toastCtrl, '提交成功');
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
      },
      (error) => {
        alert('系统错误,' + error);
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
      res = 'secondary';
    }
    return res;
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }
}
