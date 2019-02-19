import { Injectable } from '@angular/core';

import { Menu } from '../../models/menu';

@Injectable()
export class Menus {
  items: Menu[] = [];

  constructor() {
    let items = [
      {
        "name": "可疑件管理",
        "icon": "ios-bug",
        "url": "SuspiciousPage"
      },
      {
        "name": "库存盘点",
        "icon": "ios-calculator",
        "url": "InventoryListPage"
      },
      {
        "name": "物料出库",
        "icon": "md-log-out",
        "url": "OutPage"
      },
      {
        "name": "物料入库",
        "icon": "md-log-in",
        "url": "InboundPage"
      },
      {
        "name": "物料移库",
        "icon": "md-redo",
        "url": "MovePage"
      },
      {
        "name": "JIS出库",
        "icon": "md-log-out",
        "url": "JisOutStockPage"
      },
      {
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
