/// <reference types='codeceptjs' />

type StepsFile = typeof import('./steps_file').default;
type LoginPage = typeof import('./pages/Login').default;

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, loginPage: LoginPage }
  interface Methods extends Playwright {}
  interface I extends ReturnType<StepsFile>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
