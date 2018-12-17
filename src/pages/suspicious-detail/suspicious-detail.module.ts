import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousDetailPage } from './suspicious-detail';

@NgModule({
  declarations: [
    SuspiciousDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousDetailPage),
  ],
})
export class SuspiciousDetailPageModule {}
