import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController, ViewController} from 'ionic-angular';
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";
import {fromEvent} from "rxjs/observable/fromEvent";

/**
 * Generated class for the OutConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-out-confirm',
  templateUrl: 'out-confirm.html',
})
export class OutConfirmPage extends BaseUI{
  parts: any[] = [];
  not_ok_parts: any[] =[];
  msg : string;
  sheet: any;
  type: string = '出库';
  keyPressed : any;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController,
              public viewCtrl: ViewController,
              public api: Api) {
    super();
    this.msg = navParams.get('msg').toString();
    this.sheet = navParams.get('sheet');
    this.parts = navParams.get('parts');
    this.type = navParams.get('type');
  }

  keyDown (event) {
    switch (event.keyCode) {
      /*case 13:
        //enter
        this.searchbar.setFocus();
        break;*/
      case 112:
        //f1
        this.submit();
        break;
      case 113:
        //f2
        this.cancel();
        break;
    }
    //alert("out page onKeyDown:" + event.keyCode);
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
    this.not_ok_parts = this.parts.filter(item => {
      return item.required_part_count !== item.received_part_count;
    });
  }

  submit =()=>{
    if(this.type==='出库'){
      this.execOutStock();
    }else{
      this.execInbound();
    }
  }

  //执行出库
  execOutStock() {
    let d = this.parts.filter(p => p.received_part_count > p.allow_part_qty).length;
    if (d > 0) {
      super.showToast(this.toastCtrl, '不能超需求出库，请检查', 'error');
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, '正在出库，请稍后...');
    this.api.get('wm/getExcuseOutStock', {id: this.sheet.id}).subscribe((res: any) => {
        loading.dismiss();
        if (res.successful) {
          super.showToast(this.toastCtrl, '出库成功！', 'success');
          this.viewCtrl.dismiss({res: true});
        } else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
      },
      err => {
        super.showToast(this.toastCtrl, '系统错误，请重试', 'error');
        loading.dismiss();
      });
  }

  execInbound() {
    let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.api.get('wm/getExcuseInbound', {
      id: this.sheet.id
    }).subscribe((res: any) => {
        if (res.successful && res.data) {
          super.showToast(this.toastCtrl, '入库成功！', 'success');
          this.viewCtrl.dismiss({res: true});
        } else {
          super.showToast(this.toastCtrl, res.message, 'error');
        }
        loading.dismiss();
      },
      err => {
        super.showToast(this.toastCtrl, '系统错误，请重试', 'error');
        loading.dismiss();
      });
  }

  cancel = () =>{
    this.viewCtrl.dismiss();
  }
}
