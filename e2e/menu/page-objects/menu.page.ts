import { browser, element, by } from "protractor"
import { ElementFinder } from "protractor"
import { GenericPage } from "../../utils/generic.page"
import { ProgramType } from "../../utils/programType"
import { MEN702DC } from "./men702dc.page"
import * as progress from "../../conf/progress.js"
const getPort = require("get-port")


/**
 * Page Object com méotodos relacionados ao menu.
 *
 * @export
 * @class MenuPage
 */
export class MenuPage extends GenericPage {
    /**
     * Encerra todos os TOASTERS ativos na página.
     *
     * @static
     * @memberof MenuPage
     */
    public static dismissToasters(): void {
        let toasters = element.all(by.repeater("toaster in toasters"))

        toasters.each((toaster: any) => {
            toaster.click()
            MenuPage.waitForElementToBeStale(toaster)
        })
    }

    /**
     * Confirma a modal atual em exibição na página.
     *
     * @static
     * @memberof MenuPage
     */
    public static confirmModal(): void {
        let modal = element(by.className("modal"));
        let btnConfirm = modal.element(by.id("msg-confirm"));

        MenuPage.waitForElement(modal);

        MenuPage.waitForElement(btnConfirm);
        btnConfirm.click();

        MenuPage.waitForElementToBeStale(modal);
    }

    /**
     * Executa um determinado programa do menu.
     *
     * @static
     * @param {string} program Código do programa do menu.
     * @param {ProgramType} programType Tipo do programa que será executado.
     * @param {boolean} [isProgress=false] Verdadeiro se o programa é progress.
     * @param {String} [progressWindowTitle] Título da janela do programa progress.
     * @memberof MenuPage
     */
    public static execProgram(program: string, programType: ProgramType, isProgress: boolean = false, windowTitle?: string, waitTime?: number): void {
        let txtKeywords = element(by.model("keywords"))
        let btnSubmit = element(by.css("button[type=submit]"))
        let tblPrograms = element(by.id("menu-table-programs"))
        let btnExecute = element(by.css("button.btn-primary"))

        let btnSelector
        let programRow

        // Para programas Progress executa o DI primeiramente.
        if (isProgress) {
            MenuPage.openDI()
        }

        txtKeywords.clear()
        txtKeywords.sendKeys(program)

        btnSubmit.click()

        // Aguarda até que o Loading tenha finalizado.
        MenuPage.waitLoading()

        switch (programType) {
            case ProgramType.TASK:
                btnSelector = element(by.binding("tasks"))
                break

            case ProgramType.REPORT:
                btnSelector = element(by.binding("reports"))
                break

            case ProgramType.QUERY:
                btnSelector = element(by.binding("queries"))
                break

            case ProgramType.RECORD:
                btnSelector = element(by.binding("records"))
                break
        }

        if (btnSelector) {
            MenuPage.waitForElement(btnSelector)
            btnSelector.click()
        }

        programRow = element(by.cssContainingText("td", program))
        programRow.click()
        btnExecute.click()

        if (isProgress && windowTitle) {
            progress.waitForWindow(windowTitle, waitTime)
        } else {
            MenuPage.waitLoading()
        }
    }

    /**
     * Executa um determinado programa pelo Executar Programa.
     *
     * @static
     * @param {string} program Código do programa do menu.
     * @param {string} program Nome da janela Progress do programa aberto.
     * @memberof MenuPage
     */
    public static execProgrambyExecutor(program: string): void {
        let men702dc: MEN702DC = new MEN702DC()
        men702dc.open()
        men702dc.execute(program)
    }

    /**
     * Inicia o agente de testes de programas .
     */
    public static startAgent(): void {
        // Recupera uma porta disponível dinâmicamente.
        browser.call(() => {
            getPort().then((port) => {
                progress.setPort(port)
            })
        })

        MenuPage.openDI();

        // Configura o Datasul Test Agent na porta acima.
        browser.call(() => {
            progress.getPort().then((port: number) => {
                return browser.executeScript((port: number) => {
                    const xhr: XMLHttpRequest = new XMLHttpRequest();
                    xhr.open('GET', `/totvs-menu/rest/sendValues?testAgentPort=${port}`, false);
                    xhr.send('');
                    return xhr.responseText;
                }, port);
            });
        });

        // Executa o Datasul Test Agent a partir do menu.
        MenuPage.execProgram('testAgent', ProgramType.QUERY, true, 'Test Agent');
    }

    /**
     * Executa o DI e aguarda até que o mesmo fique disponível para utilização.
     */
    public static openDI(): void {
        const btnDi = element(by.id("btnDi"));
        const diConnected = element(by.className('badge diConnected'));

        MenuPage.waitForElement(btnDi);
        btnDi.click();

        browser.wait(MenuPage.EC.presenceOf(diConnected), 60000);
    }

    // Método que verifica, após a inicialização do DI, se o mesmo possui DEMONSTRAÇÃO em seu programa
    public verifyDI(env) {
        var di = progress.waitForWindow("DATASUL Interactive")
        di.findElement('MessageText').get("SCREEN-VALUE").then(function (result) {
            if (env == 'demonstracao')
                expect(result).toContain("[DEMONSTRACAO]")
            else if (env == 'teste')
                expect(result).toContain("[TESTE]")
        })
    }

    public verifyEnvironment(environment) {
        if (environment == 'demonstracao') {
            MenuPage.waitForElement(element(by.cssContainingText('span', 'DEMONSTRAÇÃO')))
            browser.wait(MenuPage.EC.presenceOf(element(by.css('#menu-topbar.env-demo'))), 15000).then(() => {
                expect(element(by.css('#menu-topbar.env-demo')).getCssValue('background-color')).toContain('7, 65, 0')
            })
        } else if (environment == 'teste') {
            MenuPage.waitForElement(element(by.cssContainingText('span', 'TESTE')))
            browser.wait(MenuPage.EC.presenceOf(element(by.css('#menu-topbar.env-test'))), 15000).then(() => {
                expect(element(by.css('#menu-topbar.env-test')).getCssValue('background-color')).toContain('60, 0, 52')
            })
        }
    }

    public static doLogout(): void {
        let btnLogout = element(by.css(".btn.btn-logoff"))
        let elmCloseEvent = element(by.css('[ng-click="close($event)"]'))

        MenuPage.dismissToasters()
        MenuPage.waitForElement(btnLogout)
        MenuPage.waitForElementToBeStale(elmCloseEvent)
        btnLogout.click()
        MenuPage.confirmModal()
        MenuPage.waitForPage("logoutForm")

        // Aguarda o DI ser encerrado.
        browser.sleep(3000)
    }
}
