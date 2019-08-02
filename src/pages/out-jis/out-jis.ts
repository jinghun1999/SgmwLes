import {Component, ViewChild, NgZone} from '@angular/core';
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
import {fromEvent} from "rxjs/observable/fromEvent";

@IonicPage()
@Component({
  selector: 'page-OutJis',
  templateUrl: 'out-jis.html',
})
export class OutJisPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  label: string = '';                      //记录扫描编号
  barTextHolderText: string = '请扫描包装标签';   //扫描文本框placeholder属性
  //workshop_list: any[] = [];
  item: any = {
    plant: '',                            //工厂
    workshop: '',                         //车间
    target: '',                           //去向车间
    parts: [],                            //出库零件列表
  };
  keyPressed: any;
  errors: any[] = [];
  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              private zone: NgZone,
              public api: Api,
              public modalCtrl: ModalController,
              public storage: Storage) {
    super();
  }

  keyDown (event) {
    switch (event.keyCode) {
      case 112:
        //f1
        this.jisOutStock();
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
      this.searchbar.setFocus();
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
  removekey = () => {
    this.keyPressed.unsubscribe();
  }
  insertError =(msg: string, t: number = 0)=> {
    this.zone.run(() => {
      this.errors.splice(0, 0, {message: msg, type: t, time: new Date()});
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
    //let loading = super.showLoading(this.loadingCtrl, '加载中...');
    this.api.get('wm/getJisOutToWorkshop', {plant: this.api.plant}).subscribe((res: any) => {
        if (res.successful) {
          //this.workshop_list = res.data;
          this.item.target = res.data;
          this.insertError('已获得目标'+res.data, 1)
        } else {
          //super.showToast(this.toastCtrl, res.message, 'error');
          this.insertError(res.message);
        }
        this.setFocus();
        //loading.dismiss();
      },
      err => {
        this.insertError('系统级别错误');
        this.setFocus();
        //loading.dismiss();
      });
  }

  //扫箱
  scanBox() {
    if (!this.label || this.label.length != 24 || this.label.substr(0, 2).toUpperCase() != 'LN') {
      this.insertError('无效的箱标签，请重新扫描');
      this.setFocus();
      return;
    }

    let _supplier_number = this.label.substr(2, 9).replace(/(^0*)/, '');
    let _part_num = this.label.substr(11, 8).replace(/(^0*)/, '');

    let i = this.item.parts.findIndex(p => p.part_no === _part_num && p.supplier_id === _supplier_number);
    if (i >= 0) {
      //已扫过的零件，直接追加
      // let tmpPart = this.item.parts[i];
      // let requireBoxes = tmpPart.require_boxes + 1;
      // let requireParts = tmpPart.require_parts + tmpPart.std_qty;

      // if (requireBoxes > tmpPart.current_boxes || requireParts > tmpPart.current_parts) {
      //   super.showToast(this.toastCtrl, '零件已超出库存，不能继续扫箱！', 'error');
      //   this.reload();
      //   return;
      // }

      // tmpPart.require_boxes = requireBoxes;
      // tmpPart.require_parts = requireParts;
      this.moveItem(this.item.parts, i, 0);
      this.item.parts[0].require_boxes++;
      this.item.parts[0].require_parts += this.item.parts[0].std_qty;
      this.setFocus();
      return;
    }

    // 不存在的零件，查询出零件信息，再push到list中
    //let loading = super.showLoading(this.loadingCtrl, '加载中...');
    this.api.get('wm/getPartByLN', {
      plant: this.item.plant,
      workshop: this.item.workshop,
      ln: this.label
    }).subscribe((res: any) => {
        if (res.successful) {
          let pts = res.data;
          if (pts.length > 0) {
            this.item.parts.splice(0, 0, {
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
              require_parts: pts[0].pack_std_qty > pts[0].parts ? pts[0].parts : pts[0].pack_std_qty,
            });

            if(res.message){
              //包装数不一致的提示信息
              this.insertError(res.message, 1);
            }
            this.setFocus();
          }
        } else {
          //super.showToast(this.toastCtrl, res.message, 'error');
          this.insertError(res.message);
        }
        //loading.dismiss();
        this.setFocus();
      },
      (error) => {
        //loading.dismiss();
        //super.showToast(this.toastCtrl, '系统错误', 'error');
        this.insertError('系统级别错误');
        this.setFocus();
      });
  }

  //index是当前元素下标，tindex是拖动到的位置下标。
  moveItem = (arr, index, tindex) => {
    //如果当前元素在拖动目标位置的下方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素，
    //我们再把数组之前的那个拖动的元素删除掉，所以要len+1
    if (index > tindex) {
      arr.splice(tindex, 0, arr[index]);
      arr.splice(index + 1, 1)
    }
    else {
      //如果当前元素在拖动目标位置的上方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置+1的地方新增一个和当前元素值一样的元素，
      //这时，数组len不变，我们再把数组之前的那个拖动的元素删除掉，下标还是index
      arr.splice(tindex + 1, 0, arr[index]);
      arr.splice(index, 1)
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
      this.setFocus();
    });
    _m.present();
  }

  //出库
  jisOutStock() {
    let err = '';
    if (!this.item.parts.length) {
      err = '请添加出库的零件';
      this.insertError(err);
    }
    if (err.length) {
      this.setFocus();
      return;
    }
    //let loading = super.showLoading(this.loadingCtrl, '正在提交...');
    this.insertError('正在提交，请稍后...', 1);
    this.api.post('wm/postJisOutStock', this.item).subscribe((res: any) => {
        if (res.successful) {
          this.item.trans_code = '';
          this.item.parts = [];
          this.errors = [];
          if(res.message){
            this.insertError(res.message);
          }else {
            this.insertError('提交成功', 1);
          }
        } else {
          this.insertError(res.message);
        }
        //loading.dismiss();
        this.setFocus()
      },
      (error) => {
        this.insertError('系统级别错误');
        this.setFocus();
      });
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }

  setFocus() {
    this.label = '';
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 200);
  }
}
