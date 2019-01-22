import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousAddPage } from './suspicious-add';
import {IonicStorageModule} from "@ionic/storage";

@NgModule({
  declarations: [
    SuspiciousAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousAddPage),
    IonicStorageModule.forRoot(),
  ],
})
export class SuspiciousAddPageModule {}
