"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const menu_page_1 = require("../../menu/page-objects/menu.page");
class LoginPage extends menu_page_1.MenuPage {
    constructor() {
        super(...arguments);
        this.usernameElm = protractor_1.element(protractor_1.by.name("j_username"));
        this.passwordElm = protractor_1.element(protractor_1.by.name("j_password"));
        this.submit = protractor_1.element(protractor_1.by.buttonText("Entrar"));
        this.changePasswordElm = protractor_1.element(protractor_1.by.id('link_trocar_senha_desk'));
        this.newPasswordElm = protractor_1.element(protractor_1.by.name('j_new_password'));
        this.confirmPasswordElm = protractor_1.element(protractor_1.by.name('j_new_password_confirm'));
        this.submitChangeElm = protractor_1.element(protractor_1.by.buttonText("Trocar"));
        this.switchDomainElm = protractor_1.element(protractor_1.by.id('switch-domain'));
        this.domainNameElm = protractor_1.element(protractor_1.by.name('j_domain'));
        this.user = protractor_1.browser.params.username;
        this.password = protractor_1.browser.params.password;
        this.useDomain = false;
        this.newPassword = 'novasenha';
        this.submitChange = true;
    }
    get getSubmitChange() {
        return this.submitChange;
    }
    set setSubmitChange(value) {
        this.submitChange = value;
    }
    get getNewPassword() {
        return this.newPassword;
    }
    set setNewPassword(value) {
        this.newPassword = value;
    }
    setLogin(user = this.user, password = this.password, useDomain = this.useDomain) {
        this.user = user;
        this.password = password;
        this.useDomain = useDomain;
    }
    get() {
        protractor_1.browser.get(protractor_1.browser.baseUrl);
        protractor_1.browser.wait(() => {
            let noWait;
            return protractor_1.browser.getCurrentUrl().then((url) => {
                noWait = url.includes('totvs-login');
                if (!noWait)
                    protractor_1.browser.get(protractor_1.browser.baseUrl);
                return noWait;
            });
        }, 360000);
        menu_page_1.MenuPage.waitForElement(protractor_1.element(protractor_1.by.id('welcome-text')));
    }
    doLogin(user = this.user, password = this.password, useDomain = this.useDomain) {
        protractor_1.browser.wait(() => {
            let noWait;
            return protractor_1.browser.getCurrentUrl().then((url) => {
                noWait = url.includes('totvs-login');
                if (!noWait) {
                    protractor_1.browser.sleep(500);
                    protractor_1.browser.get(protractor_1.browser.baseUrl);
                }
                return noWait;
            });
        }, 360000);
        this.setLogin(user, password, useDomain);
        menu_page_1.MenuPage.waitForElement(this.usernameElm);
        menu_page_1.MenuPage.waitForElement(this.passwordElm);
        this.usernameElm.clear();
        this.usernameElm.sendKeys(this.user);
        this.passwordElm.sendKeys(this.password);
        this.switchDomain(useDomain);
        this.submit.click();
        this.setLogin(protractor_1.browser.params.username, protractor_1.browser.params.password, false);
    }
    switchDomain(condition) {
        menu_page_1.MenuPage.waitForElement(this.switchDomainElm);
        this.domainNameElm.isDisplayed().then((value) => {
            if (value) {
                this.switchDomainElm.click();
            }
        });
        if (condition) {
            this.switchDomainElm.click().then(() => {
                expect(this.domainNameElm.isDisplayed()).toBeTruthy();
            });
        }
    }
    waitMenuLoading() {
        protractor_1.browser.wait(() => {
            return protractor_1.browser.getCurrentUrl().then((url) => {
                return /#\/loading/.test(url);
            });
        });
        protractor_1.browser.wait(() => {
            return protractor_1.browser.getCurrentUrl().then((url) => {
                return !/#\/loading/.test(url);
            });
        });
        LoginPage.dismissToasters();
    }
    validLogin(user = this.user, password = this.password, useDomain = this.useDomain) {
        this.doLogin(user, password, useDomain);
        this.waitMenuLoading();
    }
    waitForMenuAutoUpdate() {
        let elm = protractor_1.element(protractor_1.by.cssContainingText('[id="taskName"]', 'Atualizando menu do usuário...'));
        let promise;
        promise = protractor_1.browser.wait(function () {
            return elm.isPresent();
        }, 10000).then(() => { }, () => {
            console.log("\"Atualizando menu do usuário...\" não apareceu");
        });
        menu_page_1.MenuPage.waitForElement(protractor_1.element(protractor_1.by.id('home')));
        menu_page_1.MenuPage.waitLoading();
        LoginPage.dismissToasters();
    }
    openChangePasswordForm() {
        menu_page_1.MenuPage.waitForElement(this.changePasswordElm);
        this.changePasswordElm.click();
    }
    changePassword(user = this.user, actualPassword = this.password, newPassword = this.newPassword, wrongConfirmationPassword = false) {
        this.setNewPassword = newPassword;
        LoginPage.waitForPage('totvs-login/changePasswordForm');
        this.verifyPasswordFields(this.passwordElm);
        this.verifyPasswordFields(this.newPasswordElm);
        this.verifyPasswordFields(this.confirmPasswordElm);
        this.usernameElm.clear().then(() => {
            this.usernameElm.sendKeys(user).then(() => {
                this.passwordElm.sendKeys(actualPassword).then(() => {
                    this.newPasswordElm.sendKeys(this.getNewPassword).then(() => {
                        this.confirmPasswordElm.sendKeys(wrongConfirmationPassword ? this.getNewPassword + 1 : this.getNewPassword).then(() => {
                            menu_page_1.MenuPage.waitForElement(this.submitChangeElm);
                            this.submitChangeElm.getAttribute('disabled').then((value) => {
                                if (value !== 'disabled') {
                                    this.submitChangeElm.click();
                                }
                            });
                        });
                    });
                });
            });
        });
    }
    verifyLicenseExceeded() {
        LoginPage.waitForElement(protractor_1.element(protractor_1.by.cssContainingText('h3', 'Erro no servidor de licenças')));
        expect(protractor_1.element(protractor_1.by.css('.modal-body')).getText()).toContain('Excedeu o número de licenças para acessar o produto em demonstração.');
        protractor_1.element(protractor_1.by.css('[ng-click="ok()"]')).click();
    }
    verifyPasswordFields(elm) {
        expect(elm.getAttribute('type')).toEqual("password");
    }
    waitPasswordConfirmationError() {
        this.err = protractor_1.element(protractor_1.by.id('erro40258'));
        menu_page_1.MenuPage.waitForElement(this.err);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitInvalidUserError() {
        this.err = protractor_1.element(protractor_1.by.id('erro55504'));
        menu_page_1.MenuPage.waitForElement(this.err);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitPasswordChanged() {
        this.err = protractor_1.element(protractor_1.by.id('erro0'));
        menu_page_1.MenuPage.waitForElement(this.err);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitInvalidPasswordError() {
        this.err = protractor_1.element(protractor_1.by.id('erro55504'));
        menu_page_1.MenuPage.waitForElement(this.err);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitInvalidPasswordContentError() {
        this.err = protractor_1.element(protractor_1.by.id('erro17006'));
        menu_page_1.MenuPage.waitForElement(this.err);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitPasswordExpired() {
        this.err = protractor_1.element(protractor_1.by.id('erro54424'));
        menu_page_1.MenuPage.waitForElement(this.err, 5000);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitPasswordExpiredAlertOnly() {
        this.err = protractor_1.element(protractor_1.by.id('erro4755'));
        menu_page_1.MenuPage.waitForElement(this.err, 10000);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
    waitUserWithoutPermission() {
        this.err = protractor_1.element(protractor_1.by.id('msgDetails'));
        menu_page_1.MenuPage.waitForElement(this.err, 10000);
        menu_page_1.MenuPage.waitForElement(protractor_1.element(protractor_1.by.css('[ng-click="ok()"]')));
        protractor_1.element(protractor_1.by.css('[ng-click="ok()"]')).click();
    }
    waitInvalidUserAccess() {
        this.err = protractor_1.element(protractor_1.by.id('erro4764'));
        menu_page_1.MenuPage.waitForElement(this.err);
        protractor_1.element(protractor_1.by.buttonText("OK")).click();
    }
}
exports.LoginPage = LoginPage;
