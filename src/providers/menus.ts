import { Injectable } from '@angular/core';

import { Menu } from '../models/menu';
import { Api } from './api';

@Injectable()
export class Menus {

  constructor(public api: Api) { }

  query(params?: any) {
    return this.api.get('/items', params);
  }

  add(item: Menu) {
  }

  delete(item: Menu) {
  }

}
