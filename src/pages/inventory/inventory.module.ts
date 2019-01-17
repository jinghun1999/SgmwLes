import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { InventoryPage } from './inventory';

@NgModule({
  declarations: [
    InventoryPage,
  ],
  imports: [
    IonicPageModule.forChild(InventoryPage),
    TranslateModule.forChild()
  ],
  exports: [
    InventoryPage
  ]
})
export class SearchPageModule { }
