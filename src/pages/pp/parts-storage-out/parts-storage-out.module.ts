import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PartsStorageOutPage } from './parts-storage-out';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    PartsStorageOutPage,
  ],
  imports: [
    IonicPageModule.forChild(PartsStorageOutPage),
    ComponentsModule
  ],
})
export class PartsStorageOutPageModule {}
