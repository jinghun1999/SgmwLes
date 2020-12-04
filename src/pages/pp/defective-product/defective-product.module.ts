import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DefectiveProductPage } from './defective-product';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    DefectiveProductPage,
  ],
  imports: [
    IonicPageModule.forChild(DefectiveProductPage),
    ComponentsModule
  ],
})
export class DefectiveProductPageModule {}
