import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class PhotoService {
  public photos = [];
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  public async loadSaved() {
    try {
      await Filesystem.readdir({
        path: 'DCIM/Camera/',
        directory: FilesystemDirectory.ExternalStorage
      }).then(async (res) => {
        for (let file of res.files) {
          let contents = await Filesystem.readFile({
            path: 'DCIM/Camera/' + file,
            directory: FilesystemDirectory.ExternalStorage
          }).then((res) => {
            this.photos.push(`data:image/jpeg;base64,${res.data}`);
          });
        }
      });
    } catch (e) {
      console.error('Unable to read dir', e);
    }
  }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera, 
      quality: 100 
    });
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.push(savedImageFile.webviewPath);
  }

  private async savePicture(cameraPhoto: CameraPhoto) {
    const base64Data = await this.readAsBase64(cameraPhoto);
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: 'DCIM/Camera/' + fileName,
      data: base64Data,
      directory: FilesystemDirectory.ExternalStorage
    });

    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });
      return file.data;
    }
    else {
      const response = await fetch(cameraPhoto.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
