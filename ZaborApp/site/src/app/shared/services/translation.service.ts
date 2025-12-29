import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  public lang: string

  constructor() {
    this.lang = 'en'
  }
}
