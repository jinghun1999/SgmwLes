import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousPage } from './suspicious';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    SuspiciousPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousPage),
    ComponentsModule
  ],
})
export class SuspiciousPageModule {}
