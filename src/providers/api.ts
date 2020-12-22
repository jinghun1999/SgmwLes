import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Events, ToastController, ModalController } from 'ionic-angular';
import { Storage } from "@ionic/storage";


/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  public plant: string = '1000';
  public version: string = 'P-201222';
  
  //public api_host: string = 'http://localhost:49280';
  //public api_host: string = 'http://127.0.0.1:49280';
  //public api_host: string = 'http://localhost/lesapi';
  public api_host: string = 'http://10.1.126.171/lesapi';
  //public api_host: string ='http://localhost:49280';
  //public api_host: string = 'http://10.34.243.14/lesapi';
  url: string = this.api_host;

  constructor(public http: HttpClient, public events: Events, public alertCtrl: AlertController, public toastCtrl: ToastController, public storage: Storage, public modalCtrl: ModalController) {
  }
  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    return this.http.get(this.getUrl() + '/api' + '/' + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.getUrl()+ '/api' + '/' + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.getUrl()+ '/api' + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.getUrl()+ '/api' + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.getUrl() + '/api' + '/' + endpoint, body, reqOpts);
  }
  private getUrl() { 
    const url = localStorage.getItem('env');
    // console.log('默认='+this.url);
    // console.log('本地存储='+url);
    // console.log('url='+window.location);
    return url ? url : this.url;
  }
}
