import { browser, element, by } from "protractor";
import { ElementFinder, ExpectedConditions } from "protractor";
import { exec } from "shelljs";

/**
 * Page Object genérico base para novos Page Object.
 * 
 * @export
 * @class GenericPage
 */
export class GenericPage {
    protected static EC = ExpectedConditions;

    /**
     * Aguarda até que a página esteja totalmente carregada.
     * 
     * @static
     * @memberof GenericPage
     */
    public static waitLoading(): void {
        GenericPage.waitForElementToBeStale(element(by.id("loading-screen")));
    }

    /**
     * Aguarda até que o elemento esteja presente.
     * 
     * @param {ElementFinder} el Elemento que será verificado.
     * @memberof GenericPage
     */
    public static waitForElement(el: ElementFinder, waitTime?): void {
        // Aguarda até que a página esteja totalmente carregada.
        GenericPage.waitLoading();
        
        el = element.all(el.locator()).filter((elem) => {
            return elem.isDisplayed().then((displayedElement) => {
                return displayedElement;
            });
        }).first();

        el.getAttribute('innerHTML').then((elmInnerHTML): any => {
            browser.wait(GenericPage.EC.elementToBeClickable(el), waitTime || 10000, "Elemento demorou muito para ficar disponível \n " + elmInnerHTML);
        })
    }

    /**
     * Aguarda até que determinada página esteja em execução.
     * 
     * @param {string} page  URL da página que será verificada.
     * @memberof GenericPage
     */
    public static waitForPage(page: string): void {
        browser.wait(() => {
            return browser.getCurrentUrl().then((url: string) => {
                return new RegExp(page).test(url);
            });
        });
    }

    /**
     * Aguarda até que o elemento não esteja mais no DOM.
     * 
     * @param {ElementFinder} el Elemento que será verificado.
     * @memberof GenericPage
     */
    public static waitForElementToBeStale(el: ElementFinder): void {
        browser.wait(this.EC.stalenessOf(el), 30000);
    }

    public static waitForAllElementsToBeStale(el): Promise<{}> {
        return new Promise((resolve) => {
            browser.wait(this.EC.stalenessOf(el), 15000);
            resolve(true);
        });
    }

    public static waitForAllElementsToBePresent(el): Promise<{}> {
        return new Promise((resolve) => {
            browser.wait(this.EC.presenceOf(el), 15000);
            resolve(true);
        });
    }

    /**
     * Manipula um determinado Checkbox
     * 
     * @param {ElementFinder} el Checkbox que deseja-se manipular.
     * @param {boolean} value Condição boleana para o checkbox.
     * @memberof GenericPage
     */
    public static setCheckbox(el: ElementFinder, value: boolean): void {
        el.isSelected().then(function (selected) {
            if (value) {
                if (selected) {
                    console.log("Checkbox já está ativado.");
                } else {
                    el.click().then(() => {
                        expect(el.isSelected()).toBeTruthy();
                        console.log("Checkbox foi ativado.");
                    });
                }
            } else {
                if (selected) {
                    el.click().then(() => {
                        expect(el.isSelected()).toBeFalsy();
                        console.log("Checkbox foi desativado.");
                    });
                } else {
                    console.log("Checkbox já está desativado.");
                }
            }
        });
    }

    /**
     * Manipula um determinado Radio button
     * 
     * @param {ElementFinder} el Radio button que deseja-se manipular.
     * @param {boolean} value Condição boleana para o radio button.
     * @memberof GenericPage
     */
    public static setRadioButton(el: ElementFinder, value: boolean): void {
        el.getAttribute('value').then(function (enabled) {
            if (value) {
                if (enabled) {
                    console.log("Radio button já está ativado.");
                } else {
                    el.click().then(() => {
                        expect(el.getAttribute('value')).toEqual('enabled');
                        console.log("Radio button foi ativado.");
                    });
                }
            } else {
                if (enabled) {
                    el.click().then(() => {
                        expect(el.getAttribute('value')).not.toEqual('enabled');
                        console.log("Radio button foi desativado.");
                    });
                } else {
                    console.log("Radio button já está desativado.");
                }
            }
        });
    }

    /**
     * Executa um comando DOS
     * 
     * @param {string} command Comando que será executado.
     * @memberof GenericPage
     */

    public static execute(command: string) {
        exec(command, { async: true, silent: true });
    }

    /**
     * Simula a rolagem da página até determinado elemento
     * 
     * @param {ElementFinder} el Elemento que deve ficar visível na página.
     * @memberof GenericPage
     */
    public static scrollInto(el: ElementFinder) {
        browser.executeScript(() => {
            if (arguments.length > 0) arguments[0].scrollIntoView();
        }, el);
    }
}