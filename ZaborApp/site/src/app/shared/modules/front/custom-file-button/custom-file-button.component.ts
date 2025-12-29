import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-file-button',
  templateUrl: './custom-file-button.component.html',
  styleUrls: ['./custom-file-button.component.scss']
})
export class CustomFileButtonComponent implements OnInit {
  fileInfo: string;
  @Output() fileChangeEvent = new EventEmitter<Event>();
  @Input() browseText: string = 'Browse';
  @Input() acceptFiles: string = '.mp4';


  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];

    if (!this.validateFileType(file)) {
      if (this.acceptFiles === 'video/*') {
        this.fileInfo = this.translate.instant('Invalid file type. Please select an MP4, WebM, or Ogg file.');
      }
      if (this.acceptFiles === 'image/*') {
        this.fileInfo = this.translate.instant('Invalid file type. Please select an JPG, JPEG, or PNG file.');
      }

      // You can clear the file selection here if desired
      input.value = '';
      return;
    }

    // Check if file size is greater than 20 MB
    if ((file.size / 1024 / 1024) > 20) {
      this.fileInfo = this.translate.instant('Maximum file size is 20 MB. Please select a smaller file. The size of the file you selected is ')+this.formatBytes(file.size);
      // You can clear the file selection here if desired
      input.value = '';
      return;
    }

    this.fileInfo = `${file.name} (${this.formatBytes(file.size)})`;
    event.target.file = file;
    this.fileChangeEvent.emit(event);
  }

  validateFileType(file: File): boolean {
    const fileType = file.type;
// console.log("fileType: ", fileType);
    if (this.acceptFiles === 'video/*') {
      // return fileType === 'video/mp4';
      const regex = /video\/(mp4|webm|ogg)/;
      return regex.test(fileType);
    }

    if (this.acceptFiles === 'image/*') {
      // return fileType === 'image/*';
      const regex = /image\/(jpeg|jpg|png)/;
      return regex.test(fileType);
    }

    //return fileType === 'video/mp4';
    return false;
  }

  formatBytes(bytes: number): string {
    const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const factor = 1024;
      let index = 0;

      while (bytes >= factor) {
        bytes /= factor;
        index++;
      }

      return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
  }

}
