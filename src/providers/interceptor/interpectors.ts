import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {GlobalHttpIntercept} from './global.http.intercept';

/**
 * 把所有拦截器都收集起来,一起提供给 httpInterceptor 数组
 * @type {{provide: InjectionToken<HttpInterceptor[]>; useClass: GlobalHttpIntercept; multi: boolean}[]}
 */
export const InterceptorService = [
  { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpIntercept, multi: true },
];
