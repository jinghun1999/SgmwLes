import { Injectable } from '@angular/core';

import { Menu } from '../../models/menu';
import {SuspiciousAddPage} from "../../pages/suspicious-add/suspicious-add";
import {SuspiciousUnlockPage} from "../../pages/suspicious-unlock/suspicious-unlock";

@Injectable()
export class Menus {
  items: Menu[] = [];

  constructor() {
    let items = [
      {
        "key": 1,
        "name": "物料出库",
        "icon": "md-log-out",
        "url": "OutPage"
      },
      {
        "key": 2,
        "name": "物料入库",
        "icon": "md-log-in",
        "url": "InboundPage"
      },
      {
        "key": 4,
        "name": "JIS出库",
        "icon": "md-log-out",
        "url": "OutJisPage"
      },
      {
        "key": 3,
        "name": "物料移库",
        "icon": "md-redo",
        "url": "MovePage"
      },
      {
        "key": 5,
        "name": "添加可疑件",
        "icon": "ios-bug",
        "url": "SuspiciousAddPage"
      },
      {
        "key": 6,
        "name": "解封可疑件",
        "icon": "ios-bug",
        "url": "SuspiciousUnlockPage"
      },
      {
        "key": 7,
        "name": "库存盘点",
        "icon": "ios-calculator",
        "url": "InventoryListPage"
      },
      {
        "key": -1,
        "name": "",
        "icon": "",
        "url": ""
      },
    ];

    for (let item of items) {
      this.items.push(new Menu(item));
    }
  }

  query(params?: any) {
    if (!params) {
      return this.items;
    }

    return this.items.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  add(item: Menu) {
    this.items.push(item);
  }

  delete(item: Menu) {
    this.items.splice(this.items.indexOf(item), 1);
  }
}
