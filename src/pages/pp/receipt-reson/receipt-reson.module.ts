import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiptResonPage } from './receipt-reson';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    ReceiptResonPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiptResonPage),
    ComponentsModule
  ],
})
export class ReceiptResonPageModule {}
