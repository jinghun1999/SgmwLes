import { Component, NgZone, ViewChild } from '@angular/core';
import {
    IonicPage,
    LoadingController,
    NavParams,
    ToastController,
    NavController,
    AlertController,
    ModalController,
    Searchbar
} from 'ionic-angular';
import { Api } from '../../../providers';
import { BaseUI } from '../../baseUI';
import { fromEvent } from "rxjs/observable/fromEvent";
import { Storage } from "@ionic/storage";
import { NativeAudio } from '@ionic-native/native-audio';

@IonicPage()
@Component({
    selector: 'page-defective-product',
    templateUrl: 'defective-product.html',
})
export class DefectiveProductPage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;

    code: string = '';                      //记录扫描编号
    barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
    keyPressed: any;
    reson: string;  //退货原因
    reson_list: any[] = [];//退货原因列表
    show: boolean = false;
    max_parts: number = 0;//最大可操作数
    workshop_list: any[] = [];//加载获取的的车间列表
    errors: any[] = [];
    item: any = {
        plant: '',
        workshop: '',
        parts: [],
        codeDetailInfos: []
    };
    constructor(public navParams: NavParams,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public api: Api,
        private zone: NgZone,
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        public storage: Storage,
        public nativeAudio: NativeAudio
    ) {
        super();
        this.nativeAudio.preloadSimple('success', 'assets/audio/yes.wav').then(this.onSuccess, this.onError);
        this.nativeAudio.preloadSimple('error', 'assets/audio/no.wav').then(this.onSuccess, this.onError);
    }

    keyDown(event) {
        switch (event.keyCode) {
            case 112:
                //f1
                this.cancel();
                break;
            case 113:
                //f2
                this.save();
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
    addkey = () => {
        this.keyPressed = fromEvent(document, 'keydown').subscribe(event => {
            this.keyDown(event);
        });
    }
    onSuccess() { }
    onError() { }
    removekey = () => {
        this.keyPressed.unsubscribe();
    }
    insertError = (msg: string, t: string = 'e') => {
        this.zone.run(() => {
            this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
        });
    }
    ionViewDidLoad() {
        this.storage.get('WORKSHOP').then((val) => {
            this.item.plant = this.api.plant;
            this.item.workshop = val;
        });
        this.api.get('pp/getDefectiveLoad').subscribe((res: any) => {
            if (res.successful) {
                this.reson_list = res.data;
                this.reson = res.data[0].code_value;
            }
        });
    }

    //校验扫描
    checkScanCode() {
        let err = '';
        if (this.code == '') {
            err = '请扫描料箱号！';
        }
        else if (this.item.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
            err = `料箱${this.code}已扫描过，请扫描其他标签`;
        }
        if (err.length > 0) {
            this.insertError(err);
            this.resetScan();
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            return false;
        }
        return true;
    }
    //开始扫描
    scan() {
        if (this.checkScanCode()) {
            this.scanSheet();
        }
        else {
            this.resetScan();
        }
    }
    //扫描执行的过程
    scanSheet() {
        this.api.get('PP/GetDefectiveProduct', { plant: this.item.plant, workshop: this.item.workshop, box_label: this.code }).subscribe((res: any) => {
            if (res.successful) {
                this.insertError(" ");
                if (this.item.parts.findIndex(p => p.boxLabel === model.boxLabel) >= 0) {
                    this.insertError(`料箱${res.data.boxLabel}已扫描过，请扫描其他标签`);
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    return;
                }
                this.nativeAudio.play('ok').then(this.onSuccess, this.onError);
                let model = res.data;
                model.max_parts = model.currentParts;
                this.item.parts.push(model);
            }
            else {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError(res.message);
            }
        },
            err => {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError('扫描失败，请重新扫描！');
            });
        this.resetScan();
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
                    this.cancel_do();
                }
            }]
        });
        prompt.present();
    }

    //撤销
    cancel_do() {
        this.insertError('正在撤销...');
        this.code = '';
        this.item.parts.length = 0;
        this.insertError("撤销成功", 's');
        this.resetScan();
    }

    //删除
    delete(i) {
        this.item.parts.splice(i, 1);
    }
    //手工调用，重新加载数据模型
    resetScan() {
        this.code = '';
        this.searchbar.setFocus();
    }

    //非标跳转Modal页
    changeQty(model) {
        let _m = this.modalCtrl.create('ChangePiecesPage', {
            max_parts: model.max_parts,
            receivePieces: model.currentParts
        });
        _m.onDidDismiss(data => {
            if (data) {
                if (data.receive == 0) {
                    this.insertError('数量必须大于0');
                    return;
                }
                model.currentParts = data.receive
            }
        });
        _m.present();
    }

    //提交
    save() {
        if (!this.item.parts.length) {
            this.insertError('请先扫描料箱号');
            return;
        };
        if (new Set(this.item.parts).size !== this.item.parts.length) {
            this.insertError("提交的数据中存在重复的数据，请检查！");
            return;
        };
        this.item.codeDetailInfos.length = 0;
        let reson = this.reson_list.find(r => r.code_value == this.reson);
        if (reson) {
            this.item.codeDetailInfos.push(reson);
        }
        let loading = super.showLoading(this.loadingCtrl, '提交中');
        this.api.post('PP/PostDefectiveProduct', {
            plant: this.item.plant,
            workshop: this.item.workshop,
            codeDetailInfos: this.item.codeDetailInfos,
            parts: this.item.parts
        }).subscribe((res: any) => {
            loading.dismiss();
            if (res.successful) {
                this.item.parts.length = 0;
                this.insertError('提交成功', 's');
            }
            else {
                this.insertError(res.message);
            }
        },
            err => {
                this.insertError('提交失败');
                loading.dismiss();
            });
        this.resetScan();
    }
    focusInput = () => {
        this.searchbar.setElementClass('bg-red', false);
        this.searchbar.setElementClass('bg-green', true);
    };
    blurInput = () => {
        this.searchbar.setElementClass('bg-green', false);
        this.searchbar.setElementClass('bg-red', true);
    };
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
    showErr() {
        this.show = !this.show;
    }
}






