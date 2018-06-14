import { browser } from 'protractor';

import { ProgramType } from '../../utils/programType';
import * as progress from '../../conf/progress';

import { LoginPage } from '../../login/page-objects/login.page';
import { MenuPage } from '../../menu/page-objects/menu.page';

export class BTB962AA extends MenuPage {
    private loginPage = new LoginPage();
    private btb962aa;

    public get(user: string, password: string, useDomain: boolean = false): void {
        browser.get(browser.baseUrl);
        this.loginPage.validLogin(user, password, useDomain);

        MenuPage.startAgent();
        MenuPage.execProgram('btb962aa', ProgramType.RECORD, true, 'BTB962AA');

        this.waitForWindow();
    }

    public waitForWindow(): void {
        this.btb962aa = progress.waitForWindow('btb962aa');
    }

    public getCodEmpresa(): Promise<progress> {
        return this.btb962aa.findElement('cod_empresa').get('SCREEN-VALUE');
    }

    public getDesRazaoSocial(): Promise<progress> {
        return this.btb962aa.findElement('des_razao_social').get('SCREEN-VALUE');
    }

    public getNomAbrev(): Promise<progress> {
        return this.btb962aa.findElement('nom_abrev').get('SCREEN-VALUE');
    }

    public getCodCgc(): Promise<progress> {
        return this.btb962aa.findElement('cod_cgc').get('SCREEN-VALUE');
    }

    public getCodBroker(): Promise<progress> {
        return this.btb962aa.findElement('cod_broker').get('SCREEN-VALUE');
    }

    public add(): void {
        this.btb962aa.findElement('bt-add').choose();
    }

    public update(): void {
        this.btb962aa.findElement('bt-mod').choose();
    }

    public delete(): void {
        this.btb962aa.findElement('bt-del').choose();

        const msg = progress.waitForWindow('(550)'); // Confirma Exclusão?
        msg.findElement('bt_ok').choose();
    }

    public goTo(): void {
        this.btb962aa.findElement('bt-go').choose();
    }

    public exit(logout = false): void {
        this.btb962aa.findElement('bt-exi').choose();
        if (logout) MenuPage.doLogout();
    }
}