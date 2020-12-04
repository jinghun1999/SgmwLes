import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePiecesPage } from './change-pieces';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    ChangePiecesPage,
  ],
  imports: [
    IonicPageModule.forChild(ChangePiecesPage),
    ComponentsModule
  ],
})
export class ChangePiecesPageModule {}
