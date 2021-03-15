import { Component, NgZone, ViewChild } from '@angular/core';
import {
    IonicPage,
    LoadingController,
    NavParams,
    ToastController,
    NavController,
    AlertController,
    ActionSheetController,
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
    selector: 'page-sheet-panel',
    templateUrl: 'sheet-panel.html',
})
export class SheetPanelPage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;
    bundle_no: string;  //扫描的上料口或者捆包号
    scanCount: number;//总共扫描的数量
    show: boolean = false;
    barTextHolderText: string = '扫描捆包号，光标在此处';
    workshop: string;
    item: any = {  //提交对象
        plant: '',
        source: '',
        target: '',
        bundles: [],
    };
    workshop_list: any[] = []; //页面加载时获取车间列表，选中的就是item的target
    keyPressed: any;
    errors: any[] = [];
    private onError: any;
    private onSuccess: any;
    constructor(public navParams: NavParams,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public api: Api,
        public zone: NgZone,
        public actionSheet: ActionSheetController,
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
            this.workshop = val;
            this.getWorkshops();
        });
    }
    private getWorkshops() {
        this.api.get('system/GetSheetPlants', { plant: this.api.plant }).subscribe((res: any) => {
            if (res.successful) {
                this.workshop_list = res.data;
                let model = this.workshop_list.find((w) => w.isSelect);
                model ? this.item.target = model.value : this.item.target = this.workshop;
            }
        },
            err => {
                this.insertError('获取车间失败');
            });
    }

    //扫描执行的过程
    scan() {
        let err = '';
        if (!this.bundle_no) {
           err='请扫描捆包号！';
            return;
        }
        else if (this.item.bundles.findIndex(p => p.bundleNo === this.bundle_no) >= 0) {
            err=`捆包号${this.bundle_no}已扫描，请扫描其他捆包号`;
            return;
        }
        if (err.length > 0) { 
            this.insertError(err);
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
        }
        this.api.get('PP/GetSheetPanelMaterial', { plant: this.api.plant, workshop: this.workshop, bundle_no: this.bundle_no }).subscribe((res: any) => {
            if (res.successful) {
                if (this.item.bundles.findIndex(p => p.bundleNo === res.data.bundleNo) >= 0) {
                    this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    this.insertError(`捆包号${res.data.bundleNo}已扫描，请扫描其他捆包号`);
                    this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    return;
                }
                
                let model = res.data;
                if (model.actualReceivePieces > 0) {
                    model.max_parts = model.actualReceivePieces;
                    this.item.bundles.push(model);
                    this.nativeAudio.play('yes').then(this.onSuccess, this.onError);
                } else {
                    this.insertError(`捆包号${model.bundleNo}的剩余数量小于1`);
                    this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    return;
                }
            }
            else {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError(res.message);
            }
        },
            err => {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError('扫描失败');
            });
        this.resetScan();
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
    //撤销操作
    cancel() {
        let prompt = this.alertCtrl.create({
            title: '操作提醒',
            message: '将撤销本次的操作记录,您确认要执行撤销操作吗？',
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
        this.bundle_no = '';
        this.item.bundles = [];
        this.insertError("撤销成功", 's');
        this.resetScan();
    }
    //删除
    delete(i) {
        this.item.bundles.splice(i, 1);
    }
    //手工调用，重新加载数据模型
    resetScan() {
        this.bundle_no = '';
        this.searchbar.setFocus();
    }
    //提交
    save() {
        if (this.item.bundles.length == 0) {
            this.insertError('请先扫描捆包号');
            return;
        };
        let loading = super.showLoading(this.loadingCtrl, '提交中...');
        this.api.post('PP/PostSheetPanelMaterial', {
            plant: this.api.plant,
            workshop: this.workshop,
            target: this.item.target,
            partPanel: this.item.bundles
        }).subscribe((res: any) => {
            if (res.successful) {
                this.item.bundles.length = 0;
                this.insertError('提交成功', 's')
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
    //修改带T的时间格式
    dateFunction(time: string) {
        let date = time.replace(/T/g, " ");
        return date;
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
