import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BoxDetailsPage } from './box-details';

@NgModule({
  declarations: [
    BoxDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(BoxDetailsPage),
  ],
})
export class BoxDetailsPageModule {}
