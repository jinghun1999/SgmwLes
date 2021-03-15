import { Component, ViewChild } from '@angular/core';
import {
    AlertController,
    IonicPage,
    Searchbar,
    LoadingController,
    NavController,
    NavParams,
    ViewController,
    ToastController, ModalController,
} from 'ionic-angular';

import { BaseUI } from "../../baseUI";
import { Api } from "../../../providers";
import { NativeAudio } from '@ionic-native/native-audio';


@IonicPage()
@Component({
    selector: 'page-box-details',
    templateUrl: 'box-details.html',
})
export class BoxDetailsPage extends BaseUI {
    @ViewChild(Searchbar) searchbar: Searchbar;
    label: string = '';
    part_name: string = ''; //零件名称
    part_no: string = '';//零件号
    part_list: any[] = [];
    data: any = {
    };
    private onSuccess: any;
    private onError: any;
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
    box_Qty: number = 0; //实盘箱数
    box_part_Qty: number = 0; //实盘件数
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        private nativeAudio: NativeAudio,
        private api: Api) {
        super();
        this.data = this.navParams.get('parts');
        this.part_list = this.data.parts;
        this.nativeAudio.preloadSimple('ok', 'assets/audio/yes.wav').then(this.onSuccess, this.onError);
        this.nativeAudio.preloadSimple('no', 'assets/audio/no.wav').then(this.onSuccess, this.onError);
    }

    ionViewDidEnter() {
        this.doReset();
    }
    //扫描
    searchPart() {
        if (!this.label) {
            return;
        }
        let part = this.data.parts.find(p => p.box === this.label);
        if (part) {
            if (part.box_status == 1) {
                part.box_status = 2;
                this.box_Qty++;
                this.save(part);
            }
            this.box_part_Qty = 0;
            for (let i = 0; i < this.data.parts.length; i++) {
                if (this.data.parts[i].box_status == 2) {
                    this.box_part_Qty += Number(this.data.parts[i].real_qty);
                }
            }
            this.nativeAudio.play('ok').then(this.onSuccess, this.onError);
        }
        else {
            this.nativeAudio.play('no').then(this.onSuccess, this.onError);
        }
        this.setFocus();
    }
    //提交
    save(part) {
        this.item.parts.length = 0;
        this.item.parts.push(part);
        this.api.post('inventory/PostBoxPart', this.item).subscribe((res: any) => {
            if (res.successful) {
                this.item.parts.length = 0;
            }
            else {
                super.showToast(this.toastCtrl, res.message, 'error');
            }
        });
    }

    focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
    blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
    //修改箱数
    changeQty(part) {
        let _m = this.modalCtrl.create('ChangePiecesPage', {
            max_parts: part.packing_qty,
            receivePieces: Number(part.real_qty)
        });
        _m.onDidDismiss(data => {
            if (data) {
                if (part.box_status == 1) {
                    this.box_part_Qty += data.receive;
                    part.box_status = 2;
                    this.box_Qty++;
                } else {
                    this.box_part_Qty = this.box_part_Qty - Number(part.real_qty) + data.receive;
                }
                part.real_qty = data.receive;
                this.save(part);
            }
        });
        _m.present();
    }
    setFocus() {
        this.label = '';
        this.searchbar.setFocus();
    }
    back() {
        this.viewCtrl.dismiss(this.data.parts);
    }
    doReset() {
        if (this.box_Qty != 0) {
            return;
        }
        let loading = super.showLoading(this.loadingCtrl, '加载中...');
        if (this.part_list.length) {
            this.part_name = this.part_list[0].part_name;
            this.part_no = this.part_list[0].part_no;
            for (let i = 0; i < this.part_list.length; i++) {
                this.part_list[i].max = Number(this.part_list[i].real_qty);
                if (this.part_list[i].box_status === 2) {
                    this.box_Qty++;
                    this.box_part_Qty += Number(this.part_list[i].real_qty);
                }
            }
        }
        if (this.data.parts) {
            this.item.code = this.data.code;
            this.item.plant = this.data.plant;
            this.item.workshop = this.data.workshop;
            this.item.status = this.data.status;
            this.item.type = this.data.type;
            this.item.id = this.data.id;
            this.item.mode = this.data.mode;
            this.item.remark = this.data.remark;
            this.item.belong = this.data.belong;
        }
        loading.dismiss();
    }
}
