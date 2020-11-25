import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CloseFramePage } from './close-frame';

@NgModule({
  declarations: [
    CloseFramePage,
  ],
  imports: [
    IonicPageModule.forChild(CloseFramePage),
  ],
})
export class CloseFramePageModule {}
