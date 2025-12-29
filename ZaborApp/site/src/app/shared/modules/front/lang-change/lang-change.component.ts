import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lang-change',
  templateUrl: './lang-change.component.html',
  styles: ['.langDrop{background: transparent;border: none;margin-left: 5px;float:right;}', '.langDrop option{color: black;}', '.home .langDrop{color: white;}']
})
export class LangChangeComponent implements OnInit {

  constructor(
    public translation: TranslationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  changeLang(eventTarget: EventTarget) {
    const language = (eventTarget as HTMLSelectElement).value;
    this.translation.lang = language;
    this.translate.use(language);
  }

}
