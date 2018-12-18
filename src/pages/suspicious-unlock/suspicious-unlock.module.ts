import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspiciousUnlockPage } from './suspicious-unlock';

@NgModule({
  declarations: [
    SuspiciousUnlockPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspiciousUnlockPage),
  ],
})
export class SuspiciousUnlockPageModule {}
