import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BoxInventoryPage } from './box-inventory';
import {ComponentsModule} from "../../../components/components.module";

@NgModule({
  declarations: [
    BoxInventoryPage,
  ],
  imports: [
    IonicPageModule.forChild(BoxInventoryPage),
    ComponentsModule
  ],
})
export class BoxInventoryPageModule {}
