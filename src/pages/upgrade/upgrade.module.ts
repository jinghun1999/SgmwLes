import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
 import { UpgradePage } from './upgrade';
 import { File } from '@ionic-native/file';
 import { FileOpener } from '@ionic-native/file-opener';
 import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
@NgModule({
  declarations: [
    UpgradePage,
  ],
  imports: [
    IonicPageModule.forChild(UpgradePage),
  ],
  providers:[
    File,
    FileTransfer,
    FileOpener,
    FileTransferObject,
  ]
})
export class UpgradePageModule {}


