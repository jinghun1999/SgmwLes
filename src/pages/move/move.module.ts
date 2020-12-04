import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { MovePage } from './move';

@NgModule({
  declarations: [
    MovePage,
  ],
  imports: [
    IonicPageModule.forChild(MovePage),
    ComponentsModule
  ],
})
export class MovePageModule {}
