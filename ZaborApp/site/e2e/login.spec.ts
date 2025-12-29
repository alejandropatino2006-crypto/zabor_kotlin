/// <reference types='./steps' />

const { I, current, loginPage }: CodeceptJS.SupportObject = inject();
let user: any;

Feature('login');

Before(async () => {
  user = await I.getUserPerPage(2);
})

Scenario('Incorrect username or password.', async () => {
  I.amOnPage('/owner/login');
  I.fillField(loginPage.text.usernameTbx, user.data.data[0].email);
  I.fillField(loginPage.text.passwordTbx, secret('123456'));
  I.click(loginPage.text.signInBtn);
  I.wait(2);
  I.see(loginPage.text.failureText);
  I.wait(1);
});
