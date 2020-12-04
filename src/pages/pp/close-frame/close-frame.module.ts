import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CloseFramePage } from './close-frame';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    CloseFramePage,
  ],
  imports: [
    IonicPageModule.forChild(CloseFramePage),
    ComponentsModule
  ],
})
export class CloseFramePageModule {}
