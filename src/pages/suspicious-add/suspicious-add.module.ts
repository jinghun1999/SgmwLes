import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousAddPage } from './suspicious-add';

@NgModule({
  declarations: [
    SuspiciousAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousAddPage),
  ],
})
export class SuspiciousAddPageModule {}
