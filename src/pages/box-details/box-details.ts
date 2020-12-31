import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-box-details',
  templateUrl: 'box-details.html',
})
export class BoxDetailsPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;
  list: any[] = [
    { id: 0 },
    { id: 1 },
    { id: 2 },
    { id: 3 },
    
  ];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BoxDetailsPage');
  }

}
