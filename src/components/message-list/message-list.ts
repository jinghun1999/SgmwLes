import { Component, Input } from '@angular/core';

/**
 * Generated class for the MessageListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'message-list',
  templateUrl: 'message-list.html'
})
export class MessageListComponent {
  // `[ngClass]="{'danger': e.type==='e', 'info': e.type==='i', 'success': e.type==='s'}"`
  @Input() data: any[];

  constructor() {
  }

}
