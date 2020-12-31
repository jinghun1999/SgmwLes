import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BoxInventoryPage } from './box-inventory';

@NgModule({
  declarations: [
    BoxInventoryPage,
  ],
  imports: [
    IonicPageModule.forChild(BoxInventoryPage),
  ],
})
export class BoxInventoryPageModule {}
