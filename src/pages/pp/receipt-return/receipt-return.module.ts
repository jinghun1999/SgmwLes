
//GetReceiptReturns(string plant, string workshop, string box_label)
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiptReturnPage } from './receipt-return';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    ReceiptReturnPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiptReturnPage),
    ComponentsModule
  ],
})
export class ReceiptReturnPageModule {}
