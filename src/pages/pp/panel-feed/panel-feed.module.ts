import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PanelFeedPage } from './panel-feed';
import {ComponentsModule} from "../../../components/components.module";


@NgModule({
  declarations: [
    PanelFeedPage,
  ],
  imports: [
    IonicPageModule.forChild(PanelFeedPage),
    ComponentsModule
  ],
})
export class PanelFeedPageModule {}
