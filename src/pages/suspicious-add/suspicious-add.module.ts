import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousAddPage } from './suspicious-add';
import {IonicStorageModule} from "@ionic/storage";
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    SuspiciousAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousAddPage),
    IonicStorageModule.forRoot(),
    ComponentsModule
  ],
})
export class SuspiciousAddPageModule {}
