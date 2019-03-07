import { Component } from '@angular/core';
//import { FormBuilder, FormGroup } from '@angular/forms';
import {IonicPage, NavController, NavParams, App, ModalController} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {Settings, User, Api} from '../../providers';
import {BaseUI} from '../'
/**
 * The Settings page is a simple form that syncs with a Settings provider
 * to enable the user to customize settings for the app.
 *
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage extends BaseUI {
  // Our local settings object
  options: any;
  data: any = {};
  constructor(
    private app: App,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public settings: Settings,
    public api: Api,
    public navParams: NavParams,
    public storage: Storage,
    public user: User) {
    super();
  }

  ionViewDidLoad() {
    this.data.plant = this.api.plant;

    this.storage.get('WORKSHOP').then((val)=>{
      this.data.workshop = val;
    })
  }

  ionViewWillEnter() {

  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

  change(){
    let addModal = this.modalCtrl.create('SetProfilePage',{}, );
    addModal.onDidDismiss(ds => {
      if (ds) {
        this.data.workshop = ds;
      }
    })
    addModal.present();
  }

  logout() {
    this.user.logout().subscribe((re) => {
      debugger;
      setTimeout(() => {
        // this.app.getRootNav().setRoot(LoginPage);
        this.app.getRootNav().setRoot('LoginPage', {}, {
          animate: true,
          direction: 'forward'
        });
      });
    }, (r) => {
      alert('注销失败');
    });
  }
}
