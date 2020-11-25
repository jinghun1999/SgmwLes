import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BundlePage } from './bundle';
import {ComponentsModule} from "../../../components/components.module";

@NgModule({
  declarations: [
    BundlePage,
  ],
  imports: [
    IonicPageModule.forChild(BundlePage),
    ComponentsModule
  ],
})
export class BundlePageModule {}
