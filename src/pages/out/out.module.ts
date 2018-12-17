import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OutPage } from './out';

@NgModule({
  declarations: [
    OutPage,
  ],
  imports: [
    IonicPageModule.forChild(OutPage),
  ],
})
export class OutPageModule {}
