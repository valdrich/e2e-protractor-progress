"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const menu_page_1 = require("./menu.page");
const login_page_1 = require("../../login/page-objects/login.page");
const progress = require("../../conf/progress");
class MEN702DC {
    constructor() {
        this.loginPage = new login_page_1.LoginPage();
        this._codProg = "";
        this._waitFor = "";
    }
    setCodProg(codProg) {
        return protractor_1.browser.call(() => {
            this._codProg = codProg;
        });
    }
    getCodProg() {
        return protractor_1.browser.call(() => {
            return new Promise((resolve) => {
                resolve(this._codProg);
            });
        });
    }
    setWaitFor(waitFor) {
        return protractor_1.browser.call(() => {
            this._waitFor = waitFor;
        });
    }
    getWaitFor() {
        return protractor_1.browser.call(() => {
            return new Promise((resolve) => {
                resolve(this._waitFor);
            });
        });
    }
    get(user, password, useDomain = false) {
        protractor_1.browser.get(protractor_1.browser.baseUrl);
        this.loginPage.validLogin(user, password, useDomain);
        menu_page_1.MenuPage.startAgent();
        this.open();
    }
    clear() {
        this.setCodProg("");
    }
    open() {
        let configButton = protractor_1.element(protractor_1.by.css('[title="Configurações"]'));
        let executeProgramButton = protractor_1.element(protractor_1.by.css('[ng-click="selectOption(OPTIONS.EXECUTE_PROGRAM)"]'));
        let openOptionButton = protractor_1.element(protractor_1.by.css('[ng-click="openOption(optionSelected)"]'));
        menu_page_1.MenuPage.waitLoading();
        menu_page_1.MenuPage.waitForElement(configButton);
        configButton.click();
        menu_page_1.MenuPage.waitForElement(executeProgramButton);
        executeProgramButton.click();
        menu_page_1.MenuPage.waitForElement(openOptionButton);
        openOptionButton.click();
    }
    execute(program) {
        let executorWindow = progress.waitForWindow('MEN702DC');
        executorWindow.findElement('v_cod_prog_dtsul').set("SCREEN-VALUE", program);
        executorWindow.findElement('bt_ok').choose();
    }
    save() {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_sav").choose();
    }
    ok() {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_ok").choose();
    }
    cancel() {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_can").choose();
    }
    help() {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_hel2").choose();
    }
}
exports.MEN702DC = MEN702DC;
