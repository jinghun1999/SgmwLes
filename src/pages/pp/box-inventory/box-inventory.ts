import { Component, ViewChild, NgZone } from '@angular/core';
import {
    AlertController,
    IonicPage,
    Searchbar,
    LoadingController,
    NavController,
    NavParams,
    ToastController, ModalController,
} from 'ionic-angular';

import { BaseUI } from "../../baseUI";
import { Api } from "../../../providers";
import { NativeAudio } from '@ionic-native/native-audio';

@IonicPage()
@Component({
    selector: 'page-box-inventory',
    templateUrl: 'box-inventory.html',
})
export class BoxInventoryPage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;
    sum_box_Qty: number = 0;//累计实盘箱数
    sum_box_partQty: number = 0;//累计实盘件数

    total_wuliao: number = 0; //总共多少种物料
    alr_wuliao: number = 0; //已盘物料数量
    total_boxs: number = 0; //该物料共多少箱
    real_qty: number = 0;
    show: boolean = false;
    label: string = '';
    errors: any[] = [];
    new_data_list: any[] = [];
    org: any;
    data: any = {
        code: null,
        parts: [],
    };
    item: any = {
        code: '',
        plant: '',
        workshop: '',
        id: '',
        mode: '',
        belong: '',
        status: '',
        remark: '',
        type: '',
        parts: [],
    };
    part_total: number = 0;
    current_part_index: number = 0;
    current_part: any = null;
    private onSuccess: any;
    private onError: any;
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        private zone: NgZone,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController,
        private nativeAudio: NativeAudio,
        private api: Api) {
        super();
        this.org = navParams.get('item');
        this.nativeAudio.preloadSimple('ok', 'assets/audio/yes.wav').then(this.onSuccess, this.onError);
        this.nativeAudio.preloadSimple('no', 'assets/audio/no.wav').then(this.onSuccess, this.onError);
    }

    ionViewDidEnter() {
        this.searchbar.setFocus();
        this.searchSheet();
    }
    insertError = (msg: string, t: string = 'e') => {
        this.zone.run(() => {
            this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
        });
    }
    ionViewDidLoad() {
        this.searchbar.setFocus();
    }
    searchSheet() {
        let loading = super.showLoading(this.loadingCtrl, "查询中...");
        if (this.org && this.org.code) {
            this.api.get('inventory/GetScanBoxCode', { code: this.org.code }).subscribe((res: any) => {
                loading.dismissAll();
                if (res.successful) {                    
                    this.data = res.data;
                    this.item.code = this.data.code;
                    this.item.plant = this.data.plant;
                    this.item.workshop = this.data.workshop;
                    this.item.status = this.data.status;
                    this.item.type = this.data.type;
                    this.item.id = this.data.id;
                    this.item.mode = this.data.mode;
                    this.item.remark = this.data.remark;
                    this.item.belong = this.data.belong;
                    this.part_total = this.data.parts.length;
                    this.total_wuliao = this.data.parts.length;
                    this.data.parts.forEach(item => {
                        if (item.box_status == 2) {
                            this.alr_wuliao++;
                        }
                    });
                    this.nativeAudio.play('ok').then(this.onSuccess, this.onError);
                } else {
                    this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                    this.insertError(res.message);
                }
            }, err => {
                this.nativeAudio.play('no').then(this.onSuccess, this.onError);
                loading.dismissAll();
                this.insertError('系统错误，请重试');
            });
        }
        loading.dismissAll();
        this.resetScan();
    }
    //扫描
    searchPart() {
        let err = '';
        if (!this.label.length) {
            err = '请扫描正确的零件标签';
        }
        if (err.length) {
            super.showToast(this.toastCtrl, err, 'error');
            this.resetScan
                ();
            return;
        }
        this.current_part = this.data.parts.find(p => p.box === this.label);
        if (this.current_part) {
            this.nativeAudio.play('ok').then(this.onSuccess, this.onError);
            this.real_qty = this.current_part.real_qty;
            if (this.current_part.box_status == 1) {   //扫描并提交操作
                this.current_part.box_status = 2;
                this.item.parts.length = 0;
                this.alr_wuliao++;
                this.item.parts.push(this.current_part);
                this.api.post('inventory/PostBoxPart', this.item).subscribe((res: any) => {
                    if (res.successful) {
                    } else {
                        super.showToast(this.toastCtrl, res.message, 'error');
                    }
                });
            }
            this.upDataList(this.data.parts);
        }
        else {
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
            super.showToast(this.toastCtrl, '该零件不在盘点单列表中', 'error');
        }
        this.resetScan();
    }

    cancel() {
        let prompt = this.alertCtrl.create({
            title: '操作提醒',
            message: '是否放弃盘点任务？',
            buttons: [{
                text: '取消',
                handler: () => {

                }
            }, {
                text: '确定',
                handler: () => {
                    if (this.navCtrl.canGoBack())
                        this.navCtrl.pop();
                }
            }]
        });
        prompt.present();
    }

    close() {
        const prompt = this.alertCtrl.create({
            title: '关闭盘点单',
            message: "关闭后该盘点单将不能再继续盘点，您确定要关闭吗?",
            buttons: [
                {
                    text: '不要',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: '确认关闭',
                    handler: () => {
                        this.api.get('inventory/getClose', { id: this.data.id }).subscribe((res: any) => {
                            if (res.successful) {
                                //已关闭
                                super.showToast(this.toastCtrl, '已关闭该盘点单', 'success');
                                this.resetScan();
                                this.data = {
                                    code: null,
                                    parts: [],
                                };
                                this.part_total = 0;
                            } else {
                                super.showToast(this.toastCtrl, res.message, 'error');
                            }
                        });
                    }
                }
            ]
        });
        prompt.present();
    }

    changeQ() {
        if (this.current_part.real_qty > this.current_part.packing_qty) {
            this.insertError('数量不能大于包装数量');
            return;
        }
        this.item.parts.length = 0;
        this.item.parts.push(this.current_part);
        this.api.post('inventory/postBoxPart', this.item).subscribe((res: any) => {
            if (res.successful) {
                this.insertError('已更新', 's');

                this.new_data_list = this.data.parts.filter(p => p.id != this.current_part.id);
                this.upDataList(this.new_data_list);

                this.sum_box_partQty += Number(this.current_part.real_qty);
                this.data.parts = this.new_data_list.concat(this.current_part);
            } else {
                super.showToast(this.toastCtrl, res.message, 'error');
            }
        }, err => {
            super.showToast(this.toastCtrl, err.message, 'error');
        })
    }

    //确认提交
    showConfirm(type) {
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
                    if (type == 1) {
                        this.doOK();
                    }
                    else if (type == 2) {
                        this.save();
                    }
                }
            }]
        });
        prompt.present();
    }

    //提交
    save() {
        this.api.get('inventory/getBoxSubmit', { id: this.data.id }).subscribe((res: any) => {
            if (res.successful) {
                super.showToast(this.toastCtrl, '已完成盘点', 'success');
                setTimeout(() => {
                    if (this.navCtrl.canGoBack()) {
                        //this.navCtrl.push('PanDianPage');
                        this.navCtrl.pop();
                    }
                }, 1000);
            } else {
                super.showToast(this.toastCtrl, res.message, 'error');
            }
        });
    }
    //查询箱明细
    doDetailed(part_no) {
        this.item.parts.length = 0;
        this.api.get('inventory/GetScanBoxCode', { code: this.data.code }).subscribe((res: any) => {
            for (let i = 0; i < res.data.parts.length; i++) {
                res.data.parts[i].part_no == part_no && this.item.parts.push(res.data.parts[i]);
            }
        });
        let _m = this.modalCtrl.create('BoxDetailsPage', {
            parts: this.item
        });
        _m.onDidDismiss(data => {
            if (data && data.length > 0) {
                this.current_part.real_qty = data.find(f => f.box == this.current_part.box).real_qty;

                this.new_data_list = this.data.parts.filter(p => p.part_no != data[0].part_no);
                this.data.parts = this.new_data_list.concat(data);

                this.upDataList(this.data.parts);

            }
        });
        _m.present();
    }
    doOK() { //零件盘点完成
        let parts = this.data.parts.filter(p => p.part_no == this.current_part.part_no);
        this.item.parts = parts;
        this.api.post('inventory/PostBoxPart', this.item).subscribe((res: any) => {
            if (res.successful) {
                this.sum_box_Qty = 0;
                this.sum_box_partQty = 0;
                this.insertError('盘点成功', 's');
                for (let i = 0; i < this.item.parts.length; i++) {
                    this.sum_box_Qty++;
                    this.sum_box_partQty += this.item.parts[i].real_qty;
                }
                this.item.parts.length = 0;
            }
            else {
                super.showToast(this.toastCtrl, res.message, 'error');
            }
        });
    }
    resetScan() {
        setTimeout(() => {
            this.label = '';
            this.searchbar.setFocus();
        }, 500);
    }
    showErr() {
        this.show = !this.show;
    }
    //遍历集合重新赋值
    upDataList(parts_array) {
        this.sum_box_partQty = 0;
        this.sum_box_Qty = 0;
        this.total_boxs = 0;
        this.alr_wuliao = 0;
        parts_array.forEach(item => {
            if (item.part_no === this.current_part.part_no) {
                this.total_boxs++;
                if (item.box_status == 2) {
                    this.sum_box_Qty++;
                    this.alr_wuliao++;
                    this.sum_box_partQty += Number(item.real_qty);
                }
            }
        });
    }

    focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
    blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
}
