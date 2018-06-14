import { browser, element, by, ElementFinder, ExpectedConditions } from "protractor"
import { MenuPage } from "../../menu/page-objects/menu.page"

export class LoginPage extends MenuPage {

    // Elementos de login
    public usernameElm = element(by.name("j_username"))
    public passwordElm = element(by.name("j_password"))
    public submit = element(by.buttonText("Entrar"))

    // Elementos de troca de senha
    public changePasswordElm = element(by.id('link_trocar_senha_desk'))
    public newPasswordElm = element(by.name('j_new_password'))
    public confirmPasswordElm = element(by.name('j_new_password_confirm'))
    public submitChangeElm = element(by.buttonText("Trocar"))
    public switchDomainElm = element(by.id('switch-domain'))
    public domainNameElm = element(by.name('j_domain'))
    public err;

    // Variaveis de login
    private user: string = browser.params.username
    private password: string = browser.params.password
    private useDomain: boolean = false

    // Variaveis de troca de senha
    private newPassword: string = 'novasenha'
    private submitChange: boolean = true

    public get getSubmitChange(): boolean {
        return this.submitChange
    }

    public set setSubmitChange(value: boolean) {
        this.submitChange = value
    }

    public get getNewPassword(): string {
        return this.newPassword
    }

    public set setNewPassword(value: string) {
        this.newPassword = value
    }

    // Define os valores passados por parametro pelo usuario para as variaveis da page object.
    public setLogin(user: string = this.user, password: string = this.password, useDomain: boolean = this.useDomain) {
        this.user = user
        this.password = password
        this.useDomain = useDomain
    }

    public get() {
        browser.get(browser.baseUrl)
        browser.wait(() => {
            let noWait
            return browser.getCurrentUrl().then((url) => {
                noWait = url.includes('totvs-login')
                if (!noWait) browser.get(browser.baseUrl)
                return noWait
            })
        }, 360000)
        MenuPage.waitForElement(element(by.id('welcome-text')))
    }

    /**
     * Efetua login no produto Datasul.
     * Não verifica se o login foi bem sucedido.
     * @memberof LoginPage
     * @param {string} user Código do usuário que será utilizado no login
     * @param {string} password Senha do usuário que será utilizado no login
     * @param {boolean} useDomain Utilização de domínio no login (usuários externos)
     */
    public doLogin(user: string = this.user, password: string = this.password, useDomain: boolean = this.useDomain) {
        browser.wait(() => {
            let noWait
            return browser.getCurrentUrl().then((url) => {
                noWait = url.includes('totvs-login')
                if (!noWait) {
                    browser.sleep(500)
                    browser.get(browser.baseUrl)
                }
                return noWait
            })
        }, 360000)

        this.setLogin(user, password, useDomain)

        MenuPage.waitForElement(this.usernameElm)
        MenuPage.waitForElement(this.passwordElm)

        // this.switchDomain(false);
        this.usernameElm.clear()
        this.usernameElm.sendKeys(this.user)
        this.passwordElm.sendKeys(this.password)

        this.switchDomain(useDomain);

        this.submit.click()

        this.setLogin(browser.params.username, browser.params.password, false)
    }

    /**
     * Manipula o switch de uso de dominio na pagina de login
     * @memberof LoginPage
     * @param {boolean} condition Condição que determina se será utilizado ativada a utilização de domínio no login
     */
    public switchDomain(condition: boolean): void {
        MenuPage.waitForElement(this.switchDomainElm)

        this.domainNameElm.isDisplayed().then((value) => {
            if (value) {
                this.switchDomainElm.click()
            }
        })

        if (condition) {
            this.switchDomainElm.click().then(() => {
                expect(this.domainNameElm.isDisplayed()).toBeTruthy()
            })
        }
    }

    /**
     * Aguarda o carregamento do menu
     * @memberof LoginPage
     */
    public waitMenuLoading() {
        // Aguarda o inicío do loading do menu.
        // É necessário aguardar o início, pois a requisição para o
        // servidor pode demorar um pouco até que o mesmo inicie o loading.
        browser.wait(() => {
            return browser.getCurrentUrl().then((url: string) => {
                return /#\/loading/.test(url)
            })
        })

        // Aguarda o término do loading do menu.
        browser.wait(() => {
            return browser.getCurrentUrl().then((url: string) => {
                return !/#\/loading/.test(url)
            })
        })

        LoginPage.dismissToasters()
    }

    /**
     * Efetua login no produto Datasul
     * Aguarda o carregamento do menu para validar se o login foi bem sucedido
     * @memberof LoginPage
     * @param {string} user Código do usuário que será utilizado no login
     * @param {string} password Senha do usuário que será utilizado no login
     * @param {boolean} useDomain Utilização de domínio no login (usuários externos)
     */
    public validLogin(user: string = this.user, password: string = this.password, useDomain: boolean = this.useDomain) {
        this.doLogin(user, password, useDomain)
        this.waitMenuLoading()
    }

    /**
     * Aguarda a mensagem "Atualizando menu do usuário..." durante o carregamento do Jboss
     * @memberof LoginPage
     */
    public waitForMenuAutoUpdate() {

        let elm = element(by.cssContainingText('[id="taskName"]', 'Atualizando menu do usuário...'))
        let promise

        promise = browser.wait(function () {
            return elm.isPresent()
        }, 10000).then(() => { }, () => {
            console.log("\"Atualizando menu do usuário...\" não apareceu")
        })

        MenuPage.waitForElement(element(by.id('home')))
        MenuPage.waitLoading()
        LoginPage.dismissToasters()
    }

    /**
     * Abre a tela de troca senha
     * @memberof LoginPage
     */
    public openChangePasswordForm(): void {
        MenuPage.waitForElement(this.changePasswordElm)
        this.changePasswordElm.click()
    }

    /**
     * Realiza a troca de senha na página de login
     * @memberof LoginPage
     * @param {string} user Código do usuário que será utilizado na troca de senha
     * @param {string} actualPassword Senha do usuário que será utilizado na troca de senha
     * @param {string} newPassword Nova senha do usuário que será utilizado na troca de senha
     * @param {boolean} wrongConfirmationPassword Condição utilizada para forçar o erro na confirmação de senha
     */
    public changePassword(user: string = this.user, actualPassword: string = this.password, newPassword: string = this.newPassword, wrongConfirmationPassword: boolean = false): void {
        this.setNewPassword = newPassword;

        LoginPage.waitForPage('totvs-login/changePasswordForm')

        // Verificação para garantir que os caracteres não aparecem no campo (type="password")
        this.verifyPasswordFields(this.passwordElm)
        this.verifyPasswordFields(this.newPasswordElm)
        this.verifyPasswordFields(this.confirmPasswordElm)

        // Efetua a inserção de valores e conclui a tentativa de trocar a senha
        this.usernameElm.clear().then(() => {
            this.usernameElm.sendKeys(user).then(() => {
                this.passwordElm.sendKeys(actualPassword).then(() => {
                    this.newPasswordElm.sendKeys(this.getNewPassword).then(() => {
                        this.confirmPasswordElm.sendKeys(wrongConfirmationPassword ? this.getNewPassword + 1 : this.getNewPassword).then(() => {
                            MenuPage.waitForElement(this.submitChangeElm)
                            this.submitChangeElm.getAttribute('disabled').then((value) => {
                                if (value !== 'disabled') {
                                    this.submitChangeElm.click();
                                }
                            })
                        })
                    })
                })
            })
        })
    }

    /**
     * Verifica se a mensagem de número de licenças excedidas é apresentada.
     * @memberof LoginPage
     */
    public verifyLicenseExceeded() {
        LoginPage.waitForElement(element(by.cssContainingText('h3', 'Erro no servidor de licenças')))
        expect(element(by.css('.modal-body')).getText()).toContain('Excedeu o número de licenças para acessar o produto em demonstração.')
        element(by.css('[ng-click="ok()"]')).click()
    }

    /**
     * Verifica se o tipo do elemento é password
     * @memberof LoginPage
     * @param {ElementFinder} elm Elemento que será validado
     */
    public verifyPasswordFields(elm: ElementFinder): void {
        expect(elm.getAttribute('type')).toEqual("password")
    }

    /**
     * Aguarda a mensagem de erro relacionado a senha de confirmação da nova senha
     * @memberof LoginPage
     */
    public waitPasswordConfirmationError(): void {
        this.err = element(by.id('erro40258'))
        MenuPage.waitForElement(this.err)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de erro relacionado a usuario invalido
     * @memberof LoginPage
     */
    public waitInvalidUserError(): void {
        this.err = element(by.id('erro55504'))
        MenuPage.waitForElement(this.err)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de alteração de senha bem sucedida.
     * @memberof LoginPage
     */
    public waitPasswordChanged(): void {
        this.err = element(by.id('erro0'))
        MenuPage.waitForElement(this.err)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de erro relacionado a senha invalida
     * @memberof LoginPage
     */
    public waitInvalidPasswordError(): void {
        this.err = element(by.id('erro55504'))
        MenuPage.waitForElement(this.err)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de erro relacionado a senha que não atende aos critérios de segurança
     * @memberof LoginPage
     */
    public waitInvalidPasswordContentError(): void {
        this.err = element(by.id('erro17006'))
        MenuPage.waitForElement(this.err)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de erro relacionado a senha expirada
     * @memberof LoginPage
     */
    public waitPasswordExpired(): void {
        this.err = element(by.id('erro54424'))
        MenuPage.waitForElement(this.err, 5000)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de erro relacionado a senha expirada
     * @memberof LoginPage
     */
    public waitPasswordExpiredAlertOnly(): void {
        this.err = element(by.id('erro4755'))
        MenuPage.waitForElement(this.err, 10000)
        element(by.buttonText("OK")).click()
    }

    /**
     * Aguarda a mensagem de usuário sem permissão de acesso ao menu
     * @memberof LoginPage
     */
    public waitUserWithoutPermission(): void {
        this.err = element(by.id('msgDetails'))
        MenuPage.waitForElement(this.err, 10000)
        MenuPage.waitForElement(element(by.css('[ng-click="ok()"]')))
        element(by.css('[ng-click="ok()"]')).click()
    }

    /**
     * Aguarda a mensagem de usuário inválido para acesso ao menu
     * @memberof LoginPage
     */
    public waitInvalidUserAccess(): void {
        this.err = element(by.id('erro4764'))
        MenuPage.waitForElement(this.err)
        element(by.buttonText("OK")).click()
    }
}