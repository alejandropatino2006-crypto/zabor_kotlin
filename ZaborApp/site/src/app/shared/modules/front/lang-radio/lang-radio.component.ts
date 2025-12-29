import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-lang-radio',
  templateUrl: './lang-radio.component.html',
  styleUrls: ['./lang-radio.component.scss']
})
export class LangRadioComponent implements OnInit {

  selectedLang: string = 'en';

  constructor(
    public translation: TranslationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this.selectedLang);
    this.translate.use(this.selectedLang);
    //alert(this.translation.lang);
    //alert(this.selectedLang);
    // this.selectedLang = this.translation.lang;
    // this.translate.setDefaultLang(this.selectedLang);
    // this.translate.use(this.selectedLang);
  }

  changeLang(eventTarget: EventTarget) {
    const language = (eventTarget as HTMLInputElement).value;
    this.selectedLang = language;
    this.translation.lang = language;
    this.translate.use(language);
  }

}
