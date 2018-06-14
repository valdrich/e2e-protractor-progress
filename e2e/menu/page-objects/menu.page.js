"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const generic_page_1 = require("../../utils/generic.page");
const programType_1 = require("../../utils/programType");
const men702dc_page_1 = require("./men702dc.page");
const progress = require("../../conf/progress.js");
const getPort = require("get-port");
class MenuPage extends generic_page_1.GenericPage {
    static dismissToasters() {
        let toasters = protractor_1.element.all(protractor_1.by.repeater("toaster in toasters"));
        toasters.each((toaster) => {
            toaster.click();
            MenuPage.waitForElementToBeStale(toaster);
        });
    }
    static confirmModal() {
        let modal = protractor_1.element(protractor_1.by.className("modal"));
        let btnConfirm = modal.element(protractor_1.by.id("msg-confirm"));
        MenuPage.waitForElement(modal);
        MenuPage.waitForElement(btnConfirm);
        btnConfirm.click();
        MenuPage.waitForElementToBeStale(modal);
    }
    static execProgram(program, programType, isProgress = false, windowTitle, waitTime) {
        let txtKeywords = protractor_1.element(protractor_1.by.model("keywords"));
        let btnSubmit = protractor_1.element(protractor_1.by.css("button[type=submit]"));
        let tblPrograms = protractor_1.element(protractor_1.by.id("menu-table-programs"));
        let btnExecute = protractor_1.element(protractor_1.by.css("button.btn-primary"));
        let btnSelector;
        let programRow;
        if (isProgress) {
            MenuPage.openDI();
        }
        txtKeywords.clear();
        txtKeywords.sendKeys(program);
        btnSubmit.click();
        MenuPage.waitLoading();
        switch (programType) {
            case programType_1.ProgramType.TASK:
                btnSelector = protractor_1.element(protractor_1.by.binding("tasks"));
                break;
            case programType_1.ProgramType.REPORT:
                btnSelector = protractor_1.element(protractor_1.by.binding("reports"));
                break;
            case programType_1.ProgramType.QUERY:
                btnSelector = protractor_1.element(protractor_1.by.binding("queries"));
                break;
            case programType_1.ProgramType.RECORD:
                btnSelector = protractor_1.element(protractor_1.by.binding("records"));
                break;
        }
        if (btnSelector) {
            MenuPage.waitForElement(btnSelector);
            btnSelector.click();
        }
        programRow = protractor_1.element(protractor_1.by.cssContainingText("td", program));
        programRow.click();
        btnExecute.click();
        if (isProgress && windowTitle) {
            progress.waitForWindow(windowTitle, waitTime);
        }
        else {
            MenuPage.waitLoading();
        }
    }
    static execProgrambyExecutor(program) {
        let men702dc = new men702dc_page_1.MEN702DC();
        men702dc.open();
        men702dc.execute(program);
    }
    static startAgent() {
        protractor_1.browser.call(() => {
            getPort().then((port) => {
                progress.setPort(port);
            });
        });
        MenuPage.openDI();
        protractor_1.browser.call(() => {
            progress.getPort().then((port) => {
                return protractor_1.browser.executeScript((port) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', `/totvs-menu/rest/sendValues?testAgentPort=${port}`, false);
                    xhr.send('');
                    return xhr.responseText;
                }, port);
            });
        });
        MenuPage.execProgram('testAgent', programType_1.ProgramType.QUERY, true, 'Test Agent');
    }
    static openDI() {
        const btnDi = protractor_1.element(protractor_1.by.id("btnDi"));
        const diConnected = protractor_1.element(protractor_1.by.className('badge diConnected'));
        MenuPage.waitForElement(btnDi);
        btnDi.click();
        protractor_1.browser.wait(MenuPage.EC.presenceOf(diConnected), 60000);
    }
    verifyDI(env) {
        var di = progress.waitForWindow("DATASUL Interactive");
        di.findElement('MessageText').get("SCREEN-VALUE").then(function (result) {
            if (env == 'demonstracao')
                expect(result).toContain("[DEMONSTRACAO]");
            else if (env == 'teste')
                expect(result).toContain("[TESTE]");
        });
    }
    verifyEnvironment(environment) {
        if (environment == 'demonstracao') {
            MenuPage.waitForElement(protractor_1.element(protractor_1.by.cssContainingText('span', 'DEMONSTRAÇÃO')));
            protractor_1.browser.wait(MenuPage.EC.presenceOf(protractor_1.element(protractor_1.by.css('#menu-topbar.env-demo'))), 15000).then(() => {
                expect(protractor_1.element(protractor_1.by.css('#menu-topbar.env-demo')).getCssValue('background-color')).toContain('7, 65, 0');
            });
        }
        else if (environment == 'teste') {
            MenuPage.waitForElement(protractor_1.element(protractor_1.by.cssContainingText('span', 'TESTE')));
            protractor_1.browser.wait(MenuPage.EC.presenceOf(protractor_1.element(protractor_1.by.css('#menu-topbar.env-test'))), 15000).then(() => {
                expect(protractor_1.element(protractor_1.by.css('#menu-topbar.env-test')).getCssValue('background-color')).toContain('60, 0, 52');
            });
        }
    }
    static doLogout() {
        let btnLogout = protractor_1.element(protractor_1.by.css(".btn.btn-logoff"));
        let elmCloseEvent = protractor_1.element(protractor_1.by.css('[ng-click="close($event)"]'));
        MenuPage.dismissToasters();
        MenuPage.waitForElement(btnLogout);
        MenuPage.waitForElementToBeStale(elmCloseEvent);
        btnLogout.click();
        MenuPage.confirmModal();
        MenuPage.waitForPage("logoutForm");
        protractor_1.browser.sleep(3000);
    }
}
exports.MenuPage = MenuPage;
