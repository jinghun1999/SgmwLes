import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BundleListPage } from './bundle-list';
import {ComponentsModule} from "../../../components/components.module";

@NgModule({
  declarations: [
    BundleListPage,
  ],
  imports: [
    IonicPageModule.forChild(BundleListPage),
    ComponentsModule
  ],
})
export class BundleListPageModule {}
