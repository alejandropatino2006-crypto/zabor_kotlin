import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { ActivatedRoute } from '@angular/router';
import { environment } from "../../../../environments/environment";
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styles: ['.menuimage{margin: 10px 0; cursor: pointer;}']
})
export class GalleryComponent implements OnInit {
  page: number = 1;
  direction: string = '';
  res_id: number
  images: Array<any> = [];
  fileUrl: string;
  private _album: Array<any> = [];
  res_name: string = "";
  res_img: string = "";

  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;

  constructor(private _lightbox: Lightbox, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.fileUrl = environment.fileurl + '/'
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));

    this.galleryImgs()
  }


  onScrollDown() {
    this.page++
    this.galleryImgs();
    this.direction = 'down'
  }

  galleryImgs() {
    this.spinner.show()
    //gallery images
    this.restaurantservice.getGallery({ res_id: this.res_id, page: this.page }).subscribe(
      data => {
        if (data.status) {
          data.data.forEach(ele => {
            this.images.push(ele);
            let album = {
              src: this.fileUrl + ele.image
            }
            this._album.push(album);
          });
        }
        this.res_name = data.resdetail.name
        this.res_img = this.fileUrl + data.resdetail.restaurantpic
      },
      err => {

      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  onUp() {
    // console.log('scrolled up!', ev);

    this.direction = 'up';
  }

  open(index: number): void {
    // open lightbox
    this._lightbox.open(this._album, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
}
