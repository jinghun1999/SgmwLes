import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SheetPanelPage } from './sheet-panel';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    SheetPanelPage,
  ],
  imports: [
    IonicPageModule.forChild(SheetPanelPage),
    ComponentsModule
  ],
})
export class SheetPanelPageModule {}
