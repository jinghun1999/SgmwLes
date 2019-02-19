import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JisOutStockPage } from './jisOutStock';
import {SettingsPage} from "../settings/settings";

@NgModule({
  declarations: [
    JisOutStockPage,
    SettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(JisOutStockPage),
  ],
})
export class JisOutStockPageModule {}
