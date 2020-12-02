import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { MessageListComponent } from './message-list/message-list';
@NgModule({
	declarations: [ProgressBarComponent,
    MessageListComponent],
	imports: [CommonModule],
	exports: [ProgressBarComponent,
    MessageListComponent]
})
export class ComponentsModule {}
