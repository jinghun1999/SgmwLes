import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SetProfilePage } from './set-profile';
import {IonicStorageModule} from "@ionic/storage";

@NgModule({
  declarations: [
    SetProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(SetProfilePage),
    IonicStorageModule.forRoot(),
  ],
})
export class SetProfilePageModule {}
