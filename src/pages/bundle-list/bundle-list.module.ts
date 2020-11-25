import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BundleListPage } from './bundle-list';

@NgModule({
  declarations: [
    BundleListPage,
  ],
  imports: [
    IonicPageModule.forChild(BundleListPage),
  ],
})
export class BundleListPageModule {}
