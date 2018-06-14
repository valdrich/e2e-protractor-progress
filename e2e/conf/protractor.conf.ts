import { Config, browser, protractor } from "protractor";

export let config: Config = {
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
    defaultTimeoutInterval: 240000, // 4 minutos
    isVerbose: true
  },

  specs: ['../empresa/specs/crudEmpresa.spec.js'],

  // Define o tempo de espera para um script assíncrono finalizar sua execução antes de lançar um erro. 
  allScriptsTimeout: 11000, // timeout em milissegundos

  onPrepare: () => {
    // Lógica para permitir visualizar a execução do teste.
    const origFn = browser.driver.controlFlow().execute;

    browser.driver.controlFlow().execute = function () {
      const args = arguments;

      // Alterar abaixo o delay para permitir visualizar o andamento dos testes.
      origFn.call(browser.driver.controlFlow(), () => protractor.promise.delayed(0 /* DELAY */));
      return origFn.apply(browser.driver.controlFlow(), args);
    };

    browser.driver.manage().window().maximize();
    browser.waitForAngularEnabled(false)
    process.setMaxListeners(20); // Necessário para a execução de instancias criadas durante testes

    // Returning the promise makes Protractor wait for the reporter config
    // before executing tests.
    return browser.getProcessedConfig().then(config => {});
  },

  onComplete: () => {
    // Returning the promise makes Protractor wait for the reporter config
    // before executing tests.
    return browser.getProcessedConfig().then(config => {});
  }
};
