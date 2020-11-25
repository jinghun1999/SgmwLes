import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FramePage } from './frame';

@NgModule({
  declarations: [
    FramePage,
  ],
  imports: [
    IonicPageModule.forChild(FramePage),
  ],
})
export class FramePageModule {}
