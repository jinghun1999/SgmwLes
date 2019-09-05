import {Component, ViewChild} from '@angular/core';
import {
  // AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams, Searchbar,
  ToastController,
  ViewController
} from 'ionic-angular';
import {Api} from "../../providers";
import {BaseUI} from "../baseUI";
import {fromEvent} from "rxjs/observable/fromEvent";

/**
 * Generated class for the SuspiciousUnlockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-suspicious-unlock',
  templateUrl: 'suspicious-unlock.html',
})
export class SuspiciousUnlockPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  label: string = '';
  data: any = {};
  keyPressed: any;
  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              // private alertCtrl: AlertController,
              private api: Api,
              public navParams: NavParams) {
    super();
    //this.data = this.navParams.get('dt');
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
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 1000);
  }

  search = () => {
    let loading = super.showLoading(this.loadingCtrl, "查询中...");
    this.api.get('suspicious/getScanCode', {code: this.label}).subscribe((res: any) => {
      if (res.successful) {
        this.data = res.data;
        this.data.unlock_count = 0;
        this.data.why = '';
      } else {
        super.showToast(this.toastCtrl, res.message, 'error');
      }
      loading.dismiss();
      this.resetSearch();
    }, err => {
      loading.dismiss();
      super.showToast(this.toastCtrl, '系统级别错误', 'error');
    });
  }

  // unlock() {
  //   let prompt = this.alertCtrl.create({
  //     title: '操作提醒',
  //     message: '确认要解封该零件吗？',
  //     buttons: [{
  //       text: '取消',
  //       handler: () => {
  //       }
  //     }, {
  //       text: '确认解封',
  //       handler: () => {
  //         this.save();
  //       }
  //     }]
  //   });
  //   prompt.present();
  // }

  save() {
    if (!this.data.unlock_count) {
      super.showToast(this.toastCtrl, '请输入解封数量', 'error');
      return;
    }
    let json = {
      code: this.data.code,
      unlock_count: this.data.unlock_count,
      why: this.data.why,
    };
    let loading = super.showLoading(this.loadingCtrl, "提交中...");
    this.api.post('suspicious/postUnlock', json).subscribe((res: any) => {
      loading.dismiss();
      if (res.successful) {
        if (!res.data) {
          this.data = {
            unlock_count: null,
            why: '',
          };
          this.resetSearch();
          super.showToast(this.toastCtrl, '成功解封', 'success');
        } else {
          super.showToast(this.toastCtrl, res.data, 'error');
        }
      } else {
        super.showToast(this.toastCtrl, res.message, 'error');
      }
    }, () => {
      loading.dismiss();
      super.showToast(this.toastCtrl, '系统级别错误', 'error');
    });
  }

  cancel() {
    //this.viewCtrl.dismiss();
    if (this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    }
  }

  resetSearch() {
    this.label = '';
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 500);
  }
}
