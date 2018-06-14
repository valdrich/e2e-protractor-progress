import { browser, element, by, promise } from "protractor";
import { ProgramType } from "../../utils/programType";
import { MenuPage } from "./menu.page";
import { LoginPage } from "../../login/page-objects/login.page";
import * as progress from "../../conf/progress";

export class MEN702DC {

    private loginPage = new LoginPage()

    private _codProg: string = "";
    private _waitFor: string = "";

    public setCodProg(codProg: string) {
        return browser.call(() => {
            this._codProg = codProg;
        });
    }

    public getCodProg() {
        return browser.call(() => {
            return new Promise((resolve) => {
                resolve(this._codProg);
            });
        });
    }

    public setWaitFor(waitFor: string) {
        return browser.call(() => {
            this._waitFor = waitFor;
        });
    }

    public getWaitFor() {
        return browser.call(() => {
            return new Promise((resolve) => {
                resolve(this._waitFor);
            });
        });
    }

    public get(user: string, password: string, useDomain: boolean = false) {
        browser.get(browser.baseUrl);
        this.loginPage.validLogin(user, password, useDomain); // Valida se a página precisa ser autenticada.
        MenuPage.startAgent(); // Executa o agente de testes do Progress.
        this.open();
    }

    public clear(): void {
        this.setCodProg("");
    }

    public open(): void {
        let configButton = element(by.css('[title="Configurações"]'));
        let executeProgramButton = element(by.css('[ng-click="selectOption(OPTIONS.EXECUTE_PROGRAM)"]'))
        let openOptionButton = element(by.css('[ng-click="openOption(optionSelected)"]'));

        // Aguarda até que o Loading tenha finalizado.
        MenuPage.waitLoading();

        // Abre o programa Executar Programa (MEN702DC)
        MenuPage.waitForElement(configButton)
        configButton.click();
        MenuPage.waitForElement(executeProgramButton)
        executeProgramButton.click();
        MenuPage.waitForElement(openOptionButton)
        openOptionButton.click();
    }

    public execute(program): void {
        let executorWindow = progress.waitForWindow('MEN702DC');
        executorWindow.findElement('v_cod_prog_dtsul').set("SCREEN-VALUE", program);
        executorWindow.findElement('bt_ok').choose()
    }
    public save(): void {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_sav").choose();
    }

    public ok(): void {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_ok").choose()
    }

    public cancel(): void {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_can").choose()
    }

    public help(): void {
        let MEN702DC = progress.waitForWindow("MEN702DC");
        MEN702DC.findElement("bt_hel2").choose()
    }
}