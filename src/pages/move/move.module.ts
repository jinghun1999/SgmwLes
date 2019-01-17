import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MovePage } from './move';

@NgModule({
  declarations: [
    MovePage,
  ],
  imports: [
    IonicPageModule.forChild(MovePage),
  ],
})
export class MovePageModule {}
