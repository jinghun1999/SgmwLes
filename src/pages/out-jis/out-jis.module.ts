import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OutJisPage } from './out-jis';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    OutJisPage,
  ],
  imports: [
    IonicPageModule.forChild(OutJisPage),
    ComponentsModule
  ],
})
export class OutJisPageModule {}
