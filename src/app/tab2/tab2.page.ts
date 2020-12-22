import { Component, OnInit } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../services/photo.service';
import { Test } from '../vo/test';

const { Camera } = Plugins;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  private test: Test;
  constructor(
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController
  ) { 
    this.test = {
      item : "test!!!!"
    }
  }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

}
