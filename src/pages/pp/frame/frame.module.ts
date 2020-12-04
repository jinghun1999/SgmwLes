import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FramePage } from './frame';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    FramePage,
  ],
  imports: [
    IonicPageModule.forChild(FramePage),
    ComponentsModule
  ],
})
export class FramePageModule {}
