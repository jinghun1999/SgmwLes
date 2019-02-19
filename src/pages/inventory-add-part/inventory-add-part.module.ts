import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InventoryAddPartPage } from './inventory-add-part';

@NgModule({
  declarations: [
    InventoryAddPartPage,
  ],
  imports: [
    IonicPageModule.forChild(InventoryAddPartPage),
  ],
})
export class InventoryAddPartPageModule {}
