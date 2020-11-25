import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SheetPanelPage } from './sheet-panel';

@NgModule({
  declarations: [
    SheetPanelPage,
  ],
  imports: [
    IonicPageModule.forChild(SheetPanelPage),
  ],
})
export class SheetPanelPageModule {}
