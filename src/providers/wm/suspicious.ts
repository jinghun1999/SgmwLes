import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';
//import { Storage } from '@ionic/storage';
import { Api } from '../api/api';

@Injectable()
export class Suspicious {
  constructor(public api: Api,) { }

  getSuspiciousPager(params: any) {
    return this.api.get('suspicious/getSuspiciousPager', params).share();
  }
}
