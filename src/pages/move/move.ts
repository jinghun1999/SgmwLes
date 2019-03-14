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
import {fromEvent} from "rxjs/observable/fromEvent";

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
  keyPressed: any;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private storage: Storage,
              private api: Api) {
    super();
  }

  keyDown (event) {
    switch (event.keyCode) {
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

  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.source = val;
      this.getWorkshops();
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
        alert('系统错误');
      });
  }

  scan() {
    if (this.label && this.label.length != 24 || this.label.substr(0, 2).toUpperCase() != 'LN') {
      super.showToast(this.toastCtrl, '无效的箱标签，请重试', 'error');
      this.reload();
      return;
    }

    //let supplier_number = this.label.substr(2, 9).replace(/(^0*)/, '');
    //let part_num = this.label.substr(11, 8).replace(/(^0*)/, '');
    //let std_qty = parseInt(this.label.substr(19, 5));

    //合法标签
    let loading = super.showLoading(this.loadingCtrl, '加载中...');
    this.api.get('move/getPartByLN', {
      plant: this.item.plant,
      workshop: this.item.source,
      ln: this.label
    }).subscribe((res: any) => {
        if (res.successful) {
          let p = res.data;
          let _pi = this.item.parts.findIndex(item => item.part_no === p.part_no && item.supplier_id === p.supplier_id);
          if (_pi >= 0) {
            // already exists part, add the qty
            this.item.parts[_pi].require_boxes++;
            this.item.parts[_pi].require_parts += p.std_qty;
          } else {
            // not exists part, push to the list
            this.item.parts.push({
              workshop: p.workshop,
              part_no: p.part_no,
              part_name: p.part_name,
              supplier_id: p.supplier_id,
              supplier_name: p.supplier_name,
              dloc: p.dloc,
              unit: p.unit,
              std_qty: p.std_qty,
              require_boxes: 1,
              require_parts: p.std_qty
            });
          }
        } else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
        loading.dismiss();
        this.reload();
      },
      (error) => {
        super.showToast(this.toastCtrl, '系统错误，请稍后再试', 'error');
        loading.dismiss();
        this.reload();
      });
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
      this.reload();
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, '正在提交...');
    this.api.post('move/postMove', this.item).subscribe((res: any) => {
        if (res.successful) {
          this.item.trans_code = '';
          this.item.parts = [];
          super.showToast(this.toastCtrl, '提交成功', 'success');
        } else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
        loading.dismiss();
        this.reload();
      },
      (error) => {
        super.showToast(this.toastCtrl, '系统错误，请稍后再试', 'error');
        loading.dismiss();
        this.reload();
      });
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }

  reload() {
    this.label = '';
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 500);
  }
}
