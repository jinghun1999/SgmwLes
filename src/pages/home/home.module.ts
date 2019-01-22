import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicStorageModule} from "@ionic/storage";
import { HomePage } from './home';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    TranslateModule.forChild(),
    IonicStorageModule.forRoot(),
  ],
  exports: [
    HomePage
  ]
})
export class HomePageModule { }
