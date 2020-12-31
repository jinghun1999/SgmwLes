import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SparePartsPage } from './spare-parts';
import {ComponentsModule} from "../../../components/components.module";

@NgModule({
  declarations: [
    SparePartsPage,
  ],
  imports: [
    IonicPageModule.forChild(SparePartsPage),
    ComponentsModule
  ],
})
export class SparePartsPageModule {}
