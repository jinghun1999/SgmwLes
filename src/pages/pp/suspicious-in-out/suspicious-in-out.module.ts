import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousInOutPage } from './suspicious-in-out';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    SuspiciousInOutPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousInOutPage),
    ComponentsModule
  ],
})
export class SuspiciousInOutPageModule {}
