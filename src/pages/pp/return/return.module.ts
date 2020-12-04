import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReturnPage } from './return'; 
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    ReturnPage,
  ],
  imports: [
    IonicPageModule.forChild(ReturnPage),
    ComponentsModule
  ],
})
export class ReturnPageModule {}
