import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePiecesPage } from './change-pieces';

@NgModule({
  declarations: [
    ChangePiecesPage,
  ],
  imports: [
    IonicPageModule.forChild(ChangePiecesPage),
  ],
})
export class ChangePiecesPageModule {}
