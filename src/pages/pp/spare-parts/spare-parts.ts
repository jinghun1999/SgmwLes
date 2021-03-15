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
    selector: 'page-spare-parts',
    templateUrl: 'spare-parts.html',
})
export class SparePartsPage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;

    code: string = '';                      //记录扫描编号
    barTextHolderText: string = '扫描料箱号，光标在此处';   //扫描文本框placeholder属性
    keyPressed: any;
    show: boolean = false;
    parts: any[] = [];   //提交的料箱集合
    errors: any[] = [];
    pressParts: any = {
        isSelect: false,
        parts_group: null,
        part_no: '',
        part_name: '',
        usage: 0,
        part_type: 0,
        packing_qty: 0,
        car_model: '',
        box_mode: '',
        currentParts: 0,
        closeframeParts: 0
    };
    partNo: '';//零件号
    spareItem: any = {//散件库存
        type: 0,
        plant: '',
        boxLabel: '',
        boxModel: '',
        partNo: '',
        partName: '',
        carModel: '',
        packingQty: 0,
        currentParts: 0,
        closeframeParts: 0,
        bundle_no: '',
        status: 0,
        max_parts: 0,
        pressParts: []
    };
    item: any = {
        plant: 1000,
        workshop: '',
        parts: []
    }
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
            this.spareItem.plant = this.api.plant;
            this.item.plant = this.api.plant;
            this.item.workshop = val;
        });
    }
    //扫描
    scan() {
        let err = '';
        if (this.code.trim() == '') {
            err = '请扫描料箱号！';            
        }

        if (err.length > 0) {
            this.insertError(err);
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            this.resetScan();
            return;
        }
        this.scanSheet();
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
    //扫描执行的过程
    scanSheet() {
        this.api.get('pp/getSpareParts', { plant: this.api.plant, workshop: this.item.workshop, box_label: this.code }).subscribe((res: any) => {
            if (res.successful) {
                this.insertError(" ");
                
                let part = res.data;
                if (!part.pressParts) { //pressParts为null
                    this.spareItem.closeframeParts = this.spareItem.packingQty - this.spareItem.currentParts;//可合框数
                    this.spareItem.max_parts = this.spareItem.packingQty - this.spareItem.currentParts;
                } else if (part.pressParts.length > 0) {   //=1:扫描的是实框
                    let pressParts = part.pressParts.find(p => p.isSelect) ? part.pressParts.find(p => p.isSelect) : part.pressParts[0];
                    this.spareItem.partNo = pressParts.part_no;
                    this.spareItem.carModel = pressParts.car_model;
                    this.spareItem.boxLabel = part.boxLabel;
                    this.spareItem.boxModel = pressParts.box_mode;
                    this.spareItem.partName = pressParts.part_name;
                    this.spareItem.status = part.status;
                    this.spareItem.SJcurrentParts = part.SJcurrentParts;
                    this.spareItem.packingQty = pressParts.packing_qty;
                    this.spareItem.currentParts = part.currentParts;
                    this.spareItem.closeframeParts = part.closeframeParts;;//合框数
                    this.spareItem.pressParts = part.pressParts;
                    this.spareItem.max_parts = part.closeframeParts;
                }
                this.nativeAudio.play('yes').then(this.onSuccess, this.onError);
            }
            else {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError(res.message);
            }
        },
            err => {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                this.insertError('扫描过程出错,请重新扫描！');
            });
        this.resetScan();
    }
    //修改合框数
    changeQty(model) {
        if (!this.spareItem.boxLabel) {
            this.insertError('请扫描料箱');
            return;
        }
        let _m = this.modalCtrl.create('ChangePiecesPage', {
            max_parts: model.max_parts,
            receivePieces: model.closeframeParts
        });
        _m.onDidDismiss(data => {
            if (data) {
                if (data.receive + this.spareItem.currentParts > this.spareItem.packingQty) {
                    this.insertError('数量不能大于合框数:' + model.closeframeParts + '');
                    return;
                }
                model.closeframeParts = data.receive;
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
        this.parts = [];
        this.partNo = '';
        this.insertError("撤销成功", 's');
        this.resetScan();
    }

    //删除
    delete() {
        this.spareItem.boxLabel = '';
    }
    //手工调用，重新加载数据模型
    resetScan() {
        this.code = '';
        this.searchbar.setFocus();
    }
    //提交
    save() {
        if (!this.spareItem.boxLabel) {
            this.insertError('请扫描料箱');
            return;
        }
        if (this.spareItem.pressParts) {
            if (this.spareItem.pressParts.length > 0) {
                let pressParts = this.spareItem.pressParts.find(p => p.part_no == this.spareItem.partNo);
                this.spareItem.pressParts.length = 0;
                this.spareItem.pressParts.push(pressParts);
            }
        }
        this.item.parts.push(this.spareItem);
        console.log(this.item.parts);
        let loading = super.showLoading(this.loadingCtrl, "提交中...");
        this.api.post('pp/postSpareParts', this.item).subscribe((res: any) => {
            if (res.successful) {
                this.item.parts.length = 0;;
                this.spareItem = {};
                this.insertError('提交成功', 's');
            }
            else {
                this.insertError(res.message);
            }
            loading.dismiss();
            this.resetScan();
        },
            err => {
                this.insertError('提交失败');
                loading.dismiss();
            });
        this.resetScan();
    }
    //切换散件
    changePress(part_no) {
        let pressParts = this.spareItem.pressParts.find(p => p.part_no == part_no);
        this.spareItem.partName = pressParts.part_name;
        this.spareItem.carModel = pressParts.car_model;
        this.spareItem.boxModel = pressParts.box_mode;
        this.spareItem.packingQty = pressParts.packing_qty;
        this.spareItem.currentParts = pressParts.currentParts;
        this.spareItem.closeframeParts = pressParts.closeframeParts;

        this.api.get('pp/getSwitchSpareParts', { plant: this.api.plant, workshop: this.item.workshop, part_no: part_no }).subscribe((res: any) => {
            if (res.successful) {
                let pressParts = res.data;
                const boxLabel = this.spareItem.boxLabel;  //暂存料箱号
                const parts = this.spareItem.pressParts; //暂存零件列表
                this.spareItem = pressParts;
                this.spareItem.boxLabel = boxLabel;
                this.spareItem.closeframeParts = pressParts.closeframeParts;
                this.spareItem.pressParts = parts;
            }
            else {
                //没有WM库存
                this.insertError(res.message);
            }
        });
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