import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PartsStorageInPage } from './parts-storage-in';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    PartsStorageInPage,
  ],
  imports: [
    IonicPageModule.forChild(PartsStorageInPage),
    ComponentsModule
  ],
})
export class PartsStorageInPageModule {}
