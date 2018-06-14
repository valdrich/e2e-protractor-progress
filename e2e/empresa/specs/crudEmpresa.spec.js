"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const btb962aa_page_1 = require("../page-objects/btb962aa.page");
const btb962ab_page_1 = require("../page-objects/btb962ab.page");
const g99xx999_page_1 = require("../page-objects/g99xx999.page");
const progress = require("../../conf/progress");
describe('CRUDEmpresa', () => {
    const btb962aaPage = new btb962aa_page_1.BTB962AA();
    const btb962abPage = new btb962ab_page_1.BTB962AB();
    const g99xx999Page = new g99xx999_page_1.G99XX999();
    const username = protractor_1.browser.params.username;
    const password = protractor_1.browser.params.password;
    const goTo = (codEmpresa) => {
        btb962aaPage.goTo();
        g99xx999Page.waitForWindow();
        g99xx999Page.setCodEmpresa(codEmpresa);
        g99xx999Page.ok();
    };
    beforeAll(() => btb962aaPage.get(username, password));
    it('deve executar o cadastro de empresa', () => {
        const btb962aa = progress.waitForWindow('btb962aa');
        protractor_1.browser.call(() => expect(btb962aa.id).not.toBeUndefined());
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
