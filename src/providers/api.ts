import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { NavParams,AlertController, Events,ToastController } from 'ionic-angular';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  public plant: string = '1000';
  public version: string = 'P-201030';
  //public api_host: string = 'http://localhost:49280';
  //public api_host: string = 'http://localhost/lesapi';
  public api_host: string = '10.1.126.171';
  //public api_host: string = '';
  public isSure:boolean=false;
  //public api_host: string = 'http://10.34.243.14/lesapi';
  url: string ='http://'+ this.api_host + '/lesapi/api';

  constructor(public http: HttpClient, public events: Events,public alertCtrl:AlertController,public toastCtrl:ToastController) {
    if (!this.isSure) { 
      this.getIPAddress();
    }    
  }

  //弹框输入ip地址
  getIPAddress() {
    if (!this.api_host) {      
      let alert = this.alertCtrl.create({
        title:'',
        subTitle:'请输入IP地址',
        inputs:[
          {
            name:'ipAddress',
            placeholder:'IP'
          }
        ],
        buttons:['取消',
          {
            text:'确定',
            handler: data => {
              //正则匹配ip地址
              let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
              if (!reg.test(data.ipAddress)) {   //start if 不匹配
                let toast = this.toastCtrl.create({
                  message: '请输入正确的ip地址',
                  duration: 1500
               });
               toast.present();
                return false;
              } //end if
              //  localStorage.setItem('ipAddress',data.ipAddress);                
              this.url = 'http://' + data.ipAddress + '/lesapi/api';
              this.isSure = true;
            }
          }]
      })
      alert.present();      
   }
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

    return this.http.get(this.url + '/' + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
  }
}
