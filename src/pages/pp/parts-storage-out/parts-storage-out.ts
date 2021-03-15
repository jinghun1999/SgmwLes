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
    selector: 'page-parts-storage-out',
    templateUrl: 'parts-storage-out.html',
})
export class PartsStorageOutPage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;

    code: string = '';                      //记录扫描编号
    barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
    keyPressed: any;
    show: boolean = false;
    workshop_list: any[] = [];//加载获取的的车间列表
    scanCount: number = 0;//记录扫描总数
    errors: any[] = [];
    item: any = {
        plant: '',
        workshop: '',//目标仓库
        target: '', //源仓库
        parts: [],
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
        public storage: Storage,
        public nativeAudio: NativeAudio
    ) {
        super();
        this.nativeAudio.preloadSimple('yes', 'assets/audio/yes.wav').then(this.onSuccess, this.onError);
        this.nativeAudio.preloadSimple('no', 'assets/audio/no.wav').then(this.onSuccess, this.onError);
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
            this.item.target = val;
            this.getWorkshops();
        });
    }
    private getWorkshops() {
        this.api.get('system/GetFramePlantsOut', { plant: this.api.plant }).subscribe((res: any) => {
            if (res.successful) {
                this.workshop_list = res.data;
                let model = this.workshop_list.find((f) => f.isSelect);
                model ? this.item.workshop = model.value : this.item.workshop = this.item.workshop = '';
            } else {
                this.insertError(res.message);
            }
        },
            err => {
                //this.insertError('获取车间列表失败');
            });
    }

    //校验扫描
    checkScanCode() {
        let err = '';
        if (this.code == '') {
            err = '请扫描捆包号！';
        }
        else if (this.item.parts.findIndex(p => p.boxLabel === this.code) >= 0) {
            err = `料箱${this.code}已扫描过，请扫描其他标签`;
        }
        if (err.length > 0) {
            this.insertError(err);
            this.searchbar.setFocus();
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            return false;
        }
        return true;
    }
    //下拉框改变
    changWS(target: string) {
        this.item.parts = [];
        this.resetScan();
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
    //扫描执行的过程
    scanSheet() {
        this.api.get('PP/GetPartsStorageOut', { plant: this.api.plant, workshop: this.item.target, box_label: this.code }).subscribe((res: any) => {
            if (res.successful) {
                this.insertError(" ");
                if (this.item.parts.findIndex(p => p.boxLabel === model.boxLabel) >= 0) {
                    this.insertError(`料箱${res.data.boxLabel}已扫描过，请扫描其他标签`);
                    this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    return;
                }
                let model = res.data;
                model.max_parts = model.currentParts;
                this.item.parts.splice(0, 0, res.data);
                this.resetScan();
                this.nativeAudio.play('ok').then(this.onSuccess, this.onError);
            }
            else {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError(res.message);
            }
        },
            err => {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError('系统级别错误');
            });
        this.resetScan();
    }

    //非标跳转Modal页
    changeQty(model) {
        let _m = this.modalCtrl.create('ChangePiecesPage', {
            max_parts: model.max_parts,
            receivePieces: model.currentParts
        });
        _m.onDidDismiss(data => {
            if (data) {
                if (data.receive > 0) {
                    model.packingQty - data.receive > 0 ? model.currentParts = data.receive : this.insertError('数量不能大于包装数');
                }
                else {
                    this.insertError('数量不能小于1');
                }
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
        this.item.parts = [];
        this.insertError("撤销成功", 's');
        this.resetScan();
    }

    //删除
    delete(i) {
        this.item.parts.splice(i, 1);;
    }
    //手工调用，重新加载数据模型
    resetScan() {
        this.code = '';
        this.searchbar.setFocus();
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
    showErr() {
        this.show = !this.show;
    }
    //提交
    save() {
        if (this.item.parts.length == 0) {
            this.insertError('请先扫描捆包号');
            return;
        };

        if (new Set(this.item.parts).size !== this.item.parts.length) {
            this.insertError("提交的数据中存在重复的捆包号，请检查！");
            return;
        };
        let loading = super.showLoading(this.loadingCtrl, '提交中...');
        this.api.post('PP/PostPartsStorageOut', { plant: this.item.plant, workshop: this.item.target, target: this.item.workshop, parts: this.item.parts }).subscribe((res: any) => {
            if (res.successful) {
                this.insertError('提交成功', 's');
                this.item.parts = [];
            }
            else {
                this.insertError(res.message);
            }
            loading.dismiss();
        },
            err => {
                loading.dismiss();
                this.insertError('提交失败');
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
}

