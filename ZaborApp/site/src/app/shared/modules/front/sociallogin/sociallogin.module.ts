import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialloginComponent } from './sociallogin.component';
import { SocialLoginModule, AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { TranslateModule } from '@ngx-translate/core';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('503957846512-vd52l44llpv3kpakqptach9hu3872c9p.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('227073711888379')
  },
]);

export function provideConfig() {
  return config;
}


@NgModule({
  declarations: [SocialloginComponent],
  imports: [
    CommonModule,
    SocialLoginModule,
    TranslateModule
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  exports: [
    SocialloginComponent
  ]
})
export class SocialloginModule { }
