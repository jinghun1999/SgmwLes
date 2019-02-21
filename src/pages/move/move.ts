import {Component, ViewChild} from '@angular/core';
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Searchbar,
  ToastController
} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

@IonicPage()
@Component({
  selector: 'page-move',
  templateUrl: 'move.html',
})
export class MovePage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  label: string;
  item: any = {
    plant: '',
    source: '',
    target: '',

    parts: [],
  };
  workshop_list: any[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private storage: Storage,
              private api: Api) {
    super();
  }

  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.source = val;
      this.getWorkshops();
    });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      //this.searchbar.setFocus();
    });
  }

  private getWorkshops() {
    let loading = super.showLoading(this.loadingCtrl, '加载中...');
    /*this.api.get('move/getTransList', {plant: this.item.plant, source: this.item.source}).subscribe((res: any) => {
        if (res.successful) {
          this.trans_list = res.data;
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
      },
      (error) => {
        alert('系统错误,' + error);
        loading.dismiss();
      });*/
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

  /*
  onChangeTrans($event) {
    let i = this.trans_list.findIndex(p => p.transaction_code === this.item.trans_code);
    this.item.target = this.trans_list[i].target;
    this.item.trans_name = this.trans_list[i].transaction_name;

    //this.searchbar.setFocus();
  }*/

  scan() {
    if (this.label && this.label.length === 19 && this.label.substr(0, 2).toUpperCase() === 'LN') {
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
      this.api.get('move/getPartByLN', {
        plant: this.item.plant,
        workshop: this.item.source,
        ln: this.label
      }).subscribe((res: any) => {
          if (res.successful) {
            let pts = res.data;
            if (pts.length > 0) {
              this.item.parts.push({
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

  save() {
    let err = '';
    if (!this.item.source || !this.item.target) {
      err += '请选择仓库';
    } else if (!this.item.parts.length) {
      err += '请添加移动的零件';
    }
    if (err.length) {
      super.showToast(this.toastCtrl, err);
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, '正在提交...');
    this.api.post('move/postMove', this.item).subscribe((res: any) => {
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

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }
}
