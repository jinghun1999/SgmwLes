import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PanelFeedPage } from './panel-feed';

@NgModule({
  declarations: [
    PanelFeedPage,
  ],
  imports: [
    IonicPageModule.forChild(PanelFeedPage),
  ],
})
export class PanelFeedPageModule {}
