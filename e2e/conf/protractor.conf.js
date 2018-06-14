"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
exports.config = {
    framework: "jasmine2",
    capabilities: {
        browserName: "chrome",
        chromeOptions: {
            args: ["incognito", "user-data-dir=C:/temp/chrome"]
        }
    },
    directConnect: true,
    baseUrl: "http://jv-fwk-dev02:8180/totvs-menu",
    params: {
        username: "super",
        password: "super@123"
    },
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 240000,
        isVerbose: true
    },
    specs: ['../empresa/specs/crudEmpresa.spec.js'],
    allScriptsTimeout: 11000,
    onPrepare: () => {
        const origFn = protractor_1.browser.driver.controlFlow().execute;
        protractor_1.browser.driver.controlFlow().execute = function () {
            const args = arguments;
            origFn.call(protractor_1.browser.driver.controlFlow(), () => protractor_1.protractor.promise.delayed(0));
            return origFn.apply(protractor_1.browser.driver.controlFlow(), args);
        };
        protractor_1.browser.driver.manage().window().maximize();
        protractor_1.browser.waitForAngularEnabled(false);
        process.setMaxListeners(20);
        return protractor_1.browser.getProcessedConfig().then(config => { });
    },
    onComplete: () => {
        return protractor_1.browser.getProcessedConfig().then(config => { });
    }
};
