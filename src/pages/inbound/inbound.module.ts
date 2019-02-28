import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InboundPage } from './inbound';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    InboundPage,
  ],
  imports: [
    IonicPageModule.forChild(InboundPage),
    ComponentsModule
  ],
})
export class InboundPageModule {}
