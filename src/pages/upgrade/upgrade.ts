import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';

@IonicPage()
@Component({
  selector: 'page-upgrade',
  templateUrl: 'upgrade.html',
})
export class UpgradePage {
  data: any = {};
  per: number=0;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private file: File,
    private transfer:FileTransfer,
    private fileOpener: FileOpener) {
    this.data = this.navParams.get('data');
  }
  downloadApp() {
    const { url } = this.data;
    // 4.下载apk
    // const targetUrl = 'http://127.0.0.1:8080/test.apk';
    const fileTransfer: FileTransferObject = this.transfer.create();
    // 获取当前应用的安装（home）目录
    // 1、应用包名称要一致
    // 2、升级的包的版本号要大于当前应用的版本号
    // 3、签名要一致
    // 4、sdk 要安装
    fileTransfer.download(url, this.file.dataDirectory + 'rwms_update.apk').then((entry) => {
      // 6、下载完成调用打开应用
      this.fileOpener.open(entry.toURL(),
        'application/vnd.android.package-archive')
        .then(() => {
          console.log('File is opened');
        }).catch(e => {
          console.log('Error openening file' + e);
        });
    }, (error) => {
      alert(JSON.stringify(error));
    });

    // // 5、获取下载进度
    const oProgressNum = document.getElementById('progressnum');
    fileTransfer.onProgress((event) => {
      const num = Math.ceil(event.loaded / event.total * 100);  // 转化成1-100的进度
      if (num === 100) {
        oProgressNum.innerHTML = '下载完成';
      } else {
        oProgressNum.innerHTML = '下载进度：' + num + '%';
      }
      this.per = num / 100;
    });
  }
}
