"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const programType_1 = require("../../utils/programType");
const progress = require("../../conf/progress");
const login_page_1 = require("../../login/page-objects/login.page");
const menu_page_1 = require("../../menu/page-objects/menu.page");
class BTB962AA extends menu_page_1.MenuPage {
    constructor() {
        super(...arguments);
        this.loginPage = new login_page_1.LoginPage();
    }
    get(user, password, useDomain = false) {
        protractor_1.browser.get(protractor_1.browser.baseUrl);
        this.loginPage.validLogin(user, password, useDomain);
        menu_page_1.MenuPage.startAgent();
        menu_page_1.MenuPage.execProgram('btb962aa', programType_1.ProgramType.RECORD, true, 'BTB962AA');
        this.waitForWindow();
    }
    waitForWindow() {
        this.btb962aa = progress.waitForWindow('btb962aa');
    }
    getCodEmpresa() {
        return this.btb962aa.findElement('cod_empresa').get('SCREEN-VALUE');
    }
    getDesRazaoSocial() {
        return this.btb962aa.findElement('des_razao_social').get('SCREEN-VALUE');
    }
    getNomAbrev() {
        return this.btb962aa.findElement('nom_abrev').get('SCREEN-VALUE');
    }
    getCodCgc() {
        return this.btb962aa.findElement('cod_cgc').get('SCREEN-VALUE');
    }
    getCodBroker() {
        return this.btb962aa.findElement('cod_broker').get('SCREEN-VALUE');
    }
    add() {
        this.btb962aa.findElement('bt-add').choose();
    }
    update() {
        this.btb962aa.findElement('bt-mod').choose();
    }
    delete() {
        this.btb962aa.findElement('bt-del').choose();
        const msg = progress.waitForWindow('(550)');
        msg.findElement('bt_ok').choose();
    }
    goTo() {
        this.btb962aa.findElement('bt-go').choose();
    }
    exit(logout = false) {
        this.btb962aa.findElement('bt-exi').choose();
        if (logout)
            menu_page_1.MenuPage.doLogout();
    }
}
exports.BTB962AA = BTB962AA;
