import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PartsStorageInPage } from './parts-storage-in';

@NgModule({
  declarations: [
    PartsStorageInPage,
  ],
  imports: [
    IonicPageModule.forChild(PartsStorageInPage),
  ],
})
export class PartsStorageInPageModule {}
