"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const protractor_2 = require("protractor");
const shelljs_1 = require("shelljs");
class GenericPage {
    static waitLoading() {
        GenericPage.waitForElementToBeStale(protractor_1.element(protractor_1.by.id("loading-screen")));
    }
    static waitForElement(el, waitTime) {
        GenericPage.waitLoading();
        el = protractor_1.element.all(el.locator()).filter((elem) => {
            return elem.isDisplayed().then((displayedElement) => {
                return displayedElement;
            });
        }).first();
        el.getAttribute('innerHTML').then((elmInnerHTML) => {
            protractor_1.browser.wait(GenericPage.EC.elementToBeClickable(el), waitTime || 10000, "Elemento demorou muito para ficar disponível \n " + elmInnerHTML);
        });
    }
    static waitForPage(page) {
        protractor_1.browser.wait(() => {
            return protractor_1.browser.getCurrentUrl().then((url) => {
                return new RegExp(page).test(url);
            });
        });
    }
    static waitForElementToBeStale(el) {
        protractor_1.browser.wait(this.EC.stalenessOf(el), 30000);
    }
    static waitForAllElementsToBeStale(el) {
        return new Promise((resolve) => {
            protractor_1.browser.wait(this.EC.stalenessOf(el), 15000);
            resolve(true);
        });
    }
    static waitForAllElementsToBePresent(el) {
        return new Promise((resolve) => {
            protractor_1.browser.wait(this.EC.presenceOf(el), 15000);
            resolve(true);
        });
    }
    static setCheckbox(el, value) {
        el.isSelected().then(function (selected) {
            if (value) {
                if (selected) {
                    console.log("Checkbox já está ativado.");
                }
                else {
                    el.click().then(() => {
                        expect(el.isSelected()).toBeTruthy();
                        console.log("Checkbox foi ativado.");
                    });
                }
            }
            else {
                if (selected) {
                    el.click().then(() => {
                        expect(el.isSelected()).toBeFalsy();
                        console.log("Checkbox foi desativado.");
                    });
                }
                else {
                    console.log("Checkbox já está desativado.");
                }
            }
        });
    }
    static setRadioButton(el, value) {
        el.getAttribute('value').then(function (enabled) {
            if (value) {
                if (enabled) {
                    console.log("Radio button já está ativado.");
                }
                else {
                    el.click().then(() => {
                        expect(el.getAttribute('value')).toEqual('enabled');
                        console.log("Radio button foi ativado.");
                    });
                }
            }
            else {
                if (enabled) {
                    el.click().then(() => {
                        expect(el.getAttribute('value')).not.toEqual('enabled');
                        console.log("Radio button foi desativado.");
                    });
                }
                else {
                    console.log("Radio button já está desativado.");
                }
            }
        });
    }
    static execute(command) {
        shelljs_1.exec(command, { async: true, silent: true });
    }
    static scrollInto(el) {
        protractor_1.browser.executeScript(() => {
            if (arguments.length > 0)
                arguments[0].scrollIntoView();
        }, el);
    }
}
GenericPage.EC = protractor_2.ExpectedConditions;
exports.GenericPage = GenericPage;
