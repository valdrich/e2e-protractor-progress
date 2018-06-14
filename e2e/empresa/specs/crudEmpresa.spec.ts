import { browser } from 'protractor';

import { BTB962AA } from '../page-objects/btb962aa.page';
import { BTB962AB } from '../page-objects/btb962ab.page';
import { G99XX999 } from '../page-objects/g99xx999.page';

import * as progress from '../../conf/progress';

describe('CRUDEmpresa', () => {
    const btb962aaPage = new BTB962AA();
    const btb962abPage = new BTB962AB();
    const g99xx999Page = new G99XX999();

    const username: string = browser.params.username;
    const password: string = browser.params.password;

    const goTo = (codEmpresa: string) => {
        btb962aaPage.goTo();

        g99xx999Page.waitForWindow();
        g99xx999Page.setCodEmpresa(codEmpresa);
        g99xx999Page.ok();
    };

    beforeAll(() => btb962aaPage.get(username, password));

    it('deve executar o cadastro de empresa', () => {
        const btb962aa = progress.waitForWindow('btb962aa');
        browser.call(() => expect(btb962aa.id).not.toBeUndefined());
    });

    it('Deve cadastrar a empresa', () => {
    });

    it('Deve encontrar a empresa', () => {
    });

    it('Deve permitir excluir a empresa', () => {
    });

    it('deve alertar que a empresa 999 não existe', () => {
    });

    afterAll(() => btb962aaPage.exit(true));
});
