import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OutPage } from './out';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    OutPage,
  ],
  imports: [
    IonicPageModule.forChild(OutPage),
    ComponentsModule
  ],
})
export class OutPageModule {}
