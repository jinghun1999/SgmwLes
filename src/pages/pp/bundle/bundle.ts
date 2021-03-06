import { Component, NgZone, ViewChild } from '@angular/core';
import {
    IonicPage,
    LoadingController,
    NavParams,
    ToastController,
    NavController,
    AlertController,
    ModalController,
    Searchbar,
    Content
} from 'ionic-angular';
import { Api } from '../../../providers';
import { BaseUI } from '../../baseUI';
import { Storage } from "@ionic/storage";
import { NativeAudio } from '@ionic-native/native-audio';
@IonicPage()
@Component({
    selector: 'page-bundle',
    templateUrl: 'bundle.html',
})
export class BundlePage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;
    @ViewChild(Content) content: Content;
    code: string = '';                      //记录扫描编号
    barTextHolderText: string = '扫描捆包号,光标在此处';   //扫描文本框placeholder属性
    workshop: string; //初始化获取的车间
    keyPressed: any;
    show: boolean = false;
    max_parts: number = 0;//最大修改数
    errors: any[] = [];
    item: any = {
        bundles: [],
    };
      private onSuccess: any;
      private onError: any;
    constructor(public navParams: NavParams,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public api: Api,
        private zone: NgZone,
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        private nativeAudio: NativeAudio,
        public storage: Storage
    ) {
        super();
        this.nativeAudio.preloadSimple('ok', 'assets/audio/yes.wav').then(this.onSuccess, this.onError);
       this.nativeAudio.preloadSimple('no', 'assets/audio/no.wav').then(this.onSuccess, this.onError);
     }
    
    ionViewDidEnter() {
        setTimeout(() => {
            this.searchbar.setFocus();
            this.content.scrollToBottom();
        });        
    }

    insertError = (msg: string, t: string = 'e') => {
        this.zone.run(() => {
            this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
        });
    }
    ionViewDidLoad() {
        this.storage.get('WORKSHOP').then((val) => {
            this.workshop = val;
        });
    }
    //修改带T的时间格式
    dateFunction(time) {
        let data = time.replace(/T/g, " ");
        return data;
    }
    //校验扫描
    checkScanCode() {
        let err = '';
        if (this.code == '') {
            err = '请扫描捆包号！';
        }

        if (this.item.bundles.findIndex(p => p.bundleNo === this.code) >= 0) {
            err = `捆包${this.code}已扫描过，请扫描其他捆包`;
        }

        if (err.length > 0) {
            this.insertError(err);
            this.searchbar.setFocus();
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            return false;
        }
        return true;
    }

    //开始扫描
    scan() {
        if (this.checkScanCode()) {
            //扫捆包号
            this.scanSheet();
        }
        else {
            this.resetScan();
        }
    }
    //确认提交
    showConfirm() {
        let prompt = this.alertCtrl.create({
            title: '操作提醒',
            message: '是否确定要提交？',
            buttons: [{
                text: '取消',
                handler: () => {

                }
            }, {
                text: '确定',
                handler: () => {
                    this.save();
                }
            }]
        });
        prompt.present();
    }
    //扫描执行的过程
    scanSheet() {
        this.api.get('PP/GetPanelMaterial', { plant: this.api.plant, workshop: this.workshop, bundle_no: this.code }).subscribe((res: any) => {
            if (res.successful) {
                this.scrollToBottom();
                this.insertError(" ");
                let model = res.data;
                if (this.item.bundles.findIndex(p => p.bundleNo === model.bundleNo) >= 0) {
                    this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    this.insertError(`捆包${model.bundleNo}已扫描过，请扫描其他捆包`);
                    return;
                } else {
                    if (model.weight < 0 || model.weight.length == 0) {
                        model.weight = 0;
                    }
                    this.max_parts = model.actualReceivePieces;
                    model.max_parts = model.actualReceivePieces;
                    this.item.bundles.push(model);
                    this.nativeAudio.play('ok').then(this.onSuccess, this.onError);
                }
            }
            else {
                this.insertError(res.message);
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            }
        },
            err => {
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            this.insertError('扫描出错');
            });
        this.resetScan();
    }
    showErr() {
        this.show = !this.show;
    }

    //非标跳转Modal页
    changeQty(model) {
        let _m = this.modalCtrl.create('ChangePiecesPage', {
            max_parts: model.max_parts,
            receivePieces: model.actualReceivePieces
        });
        _m.onDidDismiss(data => {
            if (data) {
                model.actualReceivePieces = data.receive
            }
        });
        _m.present();
    }

    cancel() {
        let prompt = this.alertCtrl.create({
            title: '操作提醒',
            message: '将撤销刚才本次的操作记录，不可恢复。您确认要执行全单撤销操作吗？',
            buttons: [{
                text: '不撤销',
                handler: () => { }
            }, {
                text: '确认撤销',
                handler: () => {
                    this.code = '';
                    this.max_parts = 0;
                    this.item.bundles.length = 0;
                    this.show = false;
                    this.insertError('撤销成功', 's');
                }
            }]
        });
        prompt.present();
    }

    //删除
    delete(i) {
        this.item.bundles.splice(i, 1);
    }
    //手工调用，重新加载数据模型
    resetScan() {
        this.code = '';
        this.searchbar.setFocus();
    }
    //提交
    save() {
        if (this.item.bundles.length == 0) {
            this.insertError('请先扫描捆包号', 'i');
            return;
        };

        if (new Set(this.item.bundles).size !== this.item.bundles.length) {
            this.insertError("提交的数据中存在重复的捆包号，请检查！", 'i');
            return;
        };
        let loading = super.showLoading(this.loadingCtrl, '提交中');
        this.api.post('PP/PostPanelMaterial', {
            plant: this.api.plant,
            workshop: this.workshop,
            bundle_no: this.code,
            partPanel: this.item.bundles
        }).subscribe((res: any) => {
            if (res.successful) {
                this.insertError('提交成功', 's');
                this.item.bundles = [];
            }
            else {
                this.insertError(res.message);
            }
            loading.dismiss();
        },
            err => {
                this.insertError('提交失败');
                loading.dismiss();
            });
        this.resetScan();
    }

    focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
    blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
    //每次扫描后都滚动到最下面
    scrollToBottom() {
        let x = 0; //X轴坐标
        let y = document.getElementById("body").offsetHeight; //Y轴坐标
        this.content.scrollTo(x, y);
    }
}
