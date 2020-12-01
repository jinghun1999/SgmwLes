import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DefectiveProductPage } from './defective-product';

@NgModule({
  declarations: [
    DefectiveProductPage,
  ],
  imports: [
    IonicPageModule.forChild(DefectiveProductPage),
  ],
})
export class DefectiveProductPageModule {}
