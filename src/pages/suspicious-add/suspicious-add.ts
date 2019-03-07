import {Component, ViewChild} from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavController,
  ViewController,
  ToastController,
  Searchbar,
  ModalController
} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";

@IonicPage()
@Component({
  selector: 'page-suspicious-add',
  templateUrl: 'suspicious-add.html',
})

export class SuspiciousAddPage extends BaseUI{
  @ViewChild(Searchbar) searchbar: Searchbar;

  item: any = {
    pack_qty: 1,
    part_qty: 0,
    frag_qty: 0,
    issue_class: '',
  };
  label: string = '';
  issue_choose: any[];
  scan_result: any = {};

  plant: string = '';
  workshop: string = '';
  constructor(public navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public viewCtrl: ViewController,
              public modalCtrl: ModalController,
              public storage: Storage,
              public api: Api) {
    super();
  }

  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val)=>{
      this.plant = this.item.plant = this.api.plant;
      this.workshop = this.item.workshop = val;
      this.getIssue();
    });

    this.searchFocus();
  }

  searchFocus(){
    this.label = '';
    setTimeout(()=>{
      this.searchbar.setFocus();
    }, 1000);
  }

  getIssue = () => {
    this.api.get('system/getEnums', {code: 'wm_suspicious_issuesclass'}).subscribe((res: any) => {
      if (res.successful) {
        this.issue_choose = res.data;
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    });
  }

  search() {
    let err = '';
    if (!this.label || this.label.length != 24 || this.label.substr(0, 2).toUpperCase() != 'LN') {
      err = '无效的箱标签，请重新扫描';
    }

    let _supplier_number = this.label.substr(2, 9).replace(/(^0*)/, '');
    let _part_num = this.label.substr(11, 8).replace(/(^0*)/, '');

    if (this.scan_result.part_no && this.scan_result.part_no === _part_num && this.scan_result.supplier_id === _supplier_number) {
      if (this.item.part_qty + this.scan_result.packing_qty > this.scan_result.current_parts) {
        err = '封存数量不能超过库存数';
      } else {
        this.item.pack_qty++;
        this.item.part_qty += this.scan_result.packing_qty;
      }
    } else if (this.item.part_no) {
      err = '每次只能封存相同的零件，请重新扫箱';
    }

    if (err.length) {
      super.showToast(this.toastCtrl, err, 'error');
      this.searchFocus();
      return;
    }


    let loading = super.showLoading(this.loadingCtrl, "查询中...");
    this.api.get('suspicious/getScanPart', {
      plant: this.plant,
      workshop: this.workshop,
      label: this.label
    }).subscribe((res: any) => {
      loading.dismiss();
      if (res.successful) {
        this.scan_result = res.data;
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
      this.searchFocus();
    }, err => {
      loading.dismiss();
      alert(JSON.stringify(err));
      this.searchFocus();
    });
  }

  get part_count() {
    const frag = parseFloat(this.item.frag_qty);
    const c = (frag ? this.item.pack_qty - 1 : this.item.pack_qty) * this.scan_result.packing_qty + frag;
    if (c > this.scan_result.current_parts) {
      return this.scan_result.current_parts;
    } else {
      return c;
    }
  }

  save() {
    this.item.part_qty = this.part_count;
    let err = '';
    if (!this.scan_result.part_no) {
      err += '请先扫描或输入零件箱标签';
    } else if (!this.part_count) {
      err += '封存总数量不能小于1';
    } else if (!this.item.issue_class) {
      err += '请选择问题分类';
    }
    if (err.length) {
      super.showToast(this.toastCtrl, err, 'error');
      this.resetSearch();
      return;
    }

    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.post('suspicious/post', {
      code: '',
      plant: this.scan_result.plant,
      workshop: this.scan_result.workshop,
      dloc: this.scan_result.dloc,

      supplier: this.scan_result.supplier_id,
      supplier_name: this.scan_result.supplier_name,

      part_no: this.scan_result.part_no,
      part_name: this.scan_result.part_name,
      confirmed: 0,
      pack_std_qty: this.scan_result.packing_qty,
      pack_qty: this.item.pack_qty,
      part_qty: this.item.part_qty,
      frag_qty: this.item.frag_qty,

      status_text_jf: 0,
      status_text_th: 0,

      issue_class: this.item.issue_class,
    }).subscribe((res: any) => {
      loading.dismiss();
      if (res.successful) {
        //this.viewCtrl.dismiss(res.data);
        this.open_detail(res.data);
        // 跳转到详情页面
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    }, err => {
      loading.dismiss();
      super.showToast(this.toastCtrl, err);
    });
  }

  open_detail(item) {
    //this.navCtrl.push('SuspiciousAddPage');
    let addModal = this.modalCtrl.create('SuspiciousDetailPage', {data: item});
    addModal.onDidDismiss(item => {
        this.item = {};
        this.scan_result = {};
        this.resetSearch();
    });
    addModal.present();
  }

  cancel() {
    if (this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    } else {
      //this.viewCtrl.dismiss();
    }
  }

  resetSearch = () => {
    this.label = '';
    this.item = {
      pack_qty: 1,
      part_qty: 0,
      frag_qty: 0,
      issue_class: '',
    };
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 1000);
  }
}
