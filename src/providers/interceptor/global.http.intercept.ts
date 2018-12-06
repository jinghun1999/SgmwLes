import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { Storage } from '@ionic/storage';
import { NavController, ToastController, App } from 'ionic-angular';
import {LoginPage} from "../../pages/login/login";

/**
 * 全局http拦截器: 监视和转换从应用发送到服务器的 HTTP 请求
 * intercept 方法会把请求转换成一个最终返回 HTTP 响应体的 Observable
 * next.handle(globalReq)把 HTTP 请求转换成 HttpEvents 组成的 Observable,它最终包含的是来自服务器的响应
 */
@Injectable()
export class GlobalHttpIntercept implements HttpInterceptor {

  constructor(public appCtrl : App,
              private storage: Storage,
              private toastCtrl: ToastController) {
  }

  alertMsg(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      cssClass: 'toast-message', // 目前没用 添加的位置不是想要的
      position: 'top', // “top”，“middle”，“bottom”。
      duration: 3000
    });
    toast.present();
  }
  private goTo() {
    // 退出到登录页面
    this.getNavCtrl();
    setTimeout(() => this.navCtrl.push(LoginPage));
  }
  navCtrl: NavController;
  private getNavCtrl() {
    this.navCtrl = this.appCtrl.getActiveNav();
  }
  private handleData( event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
    // 业务处理：一些通用操作
    let errMsg: string;
    switch (event.status) {
      case 200:
        break;
      case 400: // Bad Request
        if (event['error'].error) {
          errMsg = event['error'].error;
          return Observable.throw(errMsg);
        }
        break;
      case 401: // 未登录状态码
        this.goTo();
        break;
      case 403:
      case 404:
      case 500:
        if (event['error'].msg) {
          errMsg = event['error'].msg;
        }
        // this.goTo(`/${event.status}`);
        break;
      default:
        if (event instanceof HttpErrorResponse) {
          errMsg = '未可知错误，大部分是由于后端不支持CORS或无效配置引起',
          this.alertMsg(event.message);
        }
        break;
    }
    return of(event);
  }

  //处理请求中的错误，考虑了各种情况的错误处理并在console.log中显示error
  // private handleError(event:HttpErrorResponse | any){
  //   let errMsg:string;
  //   if(event instanceof Response){
  //     const body =event.json()||'';
  //     const err = body.error || JSON.stringify(body);
  //     errMsg = `${event.status} - ${event.statusText || ''} ${err}`;
  //
  //   }else{
  //     errMsg = event.message?event.message:event.toString()
  //   }
  //   console.error(errMsg);
  //   return Observable.throw(errMsg);
  // }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<
    | HttpEvent<any>
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>> {

    let globalReq = req;

    globalReq = globalReq.clone({setHeaders: {'Content-Type': 'application/json'}});
    if (!req.url.includes('assets/i18n') &&
      !req.url.includes('api/account/login')
    ){
      // console.log(`服务器需要校验jwt`);
      this.storage.get('jwt').then((token)=>{
        globalReq = globalReq.clone({setHeaders: {Authorization: token}});
      });
      // if (req.url.includes('excel/export')) {
      //   globalReq = globalReq.clone({responseType: 'blob'});
      // }
      // if (req.url.includes('excel/import')) { // 导入操作
      //   globalReq = globalReq.clone({reportProgress: true});
      // }
    }
    return next.handle(globalReq).pipe(
      // 查看响应数据
      tap((event: any) => {
        if (event instanceof HttpResponse && event.status === 200) {
          //this.logService.print(`全局HTTP拦截器响应请求${globalReq.url}--状态:${event.statusText},信息:${event.body}`);
          return this.handleData(event);
        }
        return of(event);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err)),
    );
  }



}
