import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import { of } from 'rxjs/observable/of';
import { ToastController } from 'ionic-angular';
//import {HttpClient} from '@angular/common/http';

@Injectable()
export class LogService {
  date = new Date();
  msg: string;

  constructor(public toastCtrl: ToastController) {
  }

  /**
   * 打印日志信息到控制台
   * @param {string} message
   */
  print(message: string) {
    const nowDateTime = this.date.toLocaleString();
    console.log(`【${nowDateTime}】-【${message}】`);
  }

  /**
   * http请求错误处理
   * @param {string} operation
   * @param {T} result
   * @returns {(error: any) => Observable<T>}
   */
  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // console.error(`status:${error.status}`);
      // console.error(`statusText:${error.statusText}`);
      // console.error(`url:${error.url}`);
      // console.error(`ok:${error.ok}`);
      // console.error(`message:${error.message}`);
      switch (error.status) {
        case 0:
          this.msg = `服务器连接断开`;
          break;
        case 403:
          this.msg = `服务器拒绝访问`;
          break;
        case 404:
          this.msg = `访问的页面不存在`;
          break;
        case 500:
          this.msg = `服务器系统错误`;
          break;
        default:
          this.msg = `未知错误`;
      }
      //this.print(`${operation}--状态码:${error.status},错误信息:${error.message}`);
      let toast = this.toastCtrl.create({
        message: this.msg,
        duration: 5000,
        position: 'bottom'
      });
      toast.present();
      return of(result as T);
    };
  }
}
