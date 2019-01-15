import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InboundPage } from './inbound';

@NgModule({
  declarations: [
    InboundPage,
  ],
  imports: [
    IonicPageModule.forChild(InboundPage),
  ],
})
export class InboundPageModule {}
