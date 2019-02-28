import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Api } from './api';
/*
  Generated class for the SuspiciousProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SuspiciousProvider {

  constructor(public http: HttpClient,
              public api: Api,) {
    console.log('Hello SuspiciousProvider Provider');
  }
  getSuspiciousPager(params: any) {
    return this.api.get('suspicious/getSuspiciousPager', params).share();
  }
}
