import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Events, ToastController, ModalController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { timeout } from 'rxjs/operators';

@Injectable()
export class Api {
  public plant: string = '1000';
  public version: string = 'P-201222';   
  public api_host: string;   //api接口地址,在login.ts配置

  constructor(public http: HttpClient, public events: Events, public alertCtrl: AlertController, public toastCtrl: ToastController, public storage: Storage, public modalCtrl: ModalController) {
    this.api_host= localStorage.getItem('les_env');
  }
  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }
 
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    //设置<login>登录和<home>页面获取菜单的请求超时为2分钟
    if (endpoint == 'account/login' || endpoint == 'system/getMenus') {
      return this.http.get(this.api_host + '/api' + '/' + endpoint, reqOpts).pipe(timeout(120000));
    }
    else { 
      return this.http.get(this.api_host + '/api' + '/' + endpoint, reqOpts);
    }    
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.api_host+'/api' + '/' + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.api_host+'/api' + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.api_host+'/api' + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.api_host+'/api' + '/' + endpoint, body, reqOpts);
  }
}
