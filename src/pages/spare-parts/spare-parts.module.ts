import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SparePartsPage } from './spare-parts';

@NgModule({
  declarations: [
    SparePartsPage,
  ],
  imports: [
    IonicPageModule.forChild(SparePartsPage),
  ],
})
export class SparePartsPageModule {}
