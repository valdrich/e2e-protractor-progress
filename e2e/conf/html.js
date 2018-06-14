module.exports = (function () {

    var EC = protractor.ExpectedConditions;
    var shell = require('../../node_modules/shelljs');

    function waitForElement(locator, timeout, callback = undefined) {
        var first = true;
        browser.wait(function () {
            if (first) {
                first = false;
                if (callback) {
                    callback();
                }
            } else {
                browser.sleep(500);
            }
            return browser.isElementPresent(locator);
        }, timeout || 360000);
    };

    //implementado callback para possibilitar a execução de um comando somente após finalizar o anterior

    function waitForClick(locator, timeout, callback = undefined) {
        var wait = false;
        var element = browser.findElement(locator);
        browser.wait(function () {
            element.click().then(
                function () {
                    wait = true;
                    if (callback) {
                        callback();
                    }
                },
                function () {
                    browser.sleep(500);
                });
            return wait;
        }, timeout || 360000);
    };

    function doLogin (login = 'super', password = 'super@123') {
        return new Promise((resolve) => {
            browser.wait(EC.presenceOf($('#txtUsername')), 30000).then(() => {
                element(by.id('txtUsername')).clear().sendKeys(login).then(() => {
                    element(by.id('txtPassword')).clear().sendKeys(password).then(() => {
                        element(by.id('txtUsername')).getAttribute('value').then(function (value) {
                            expect(value).toEqual(login);
                            element(by.id('txtPassword')).getAttribute('value').then(function (value) {
                                expect(value).toEqual(password);
                                element(by.buttonText('Entrar')).click().then(() => {
                                    resolve(true);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    var doSpecificLogin = (username, password) => {

        // Efetua o login

        waitForElement(by.id('txtUsername'));
        element(by.id('txtUsername')).clear().sendKeys(username);
        element(by.id('txtPassword')).clear().sendKeys(password);
        element(by.buttonText('Entrar')).click().then(() => {
            browser.wait(EC.presenceOf($('#menu-desktop')));
        });

    };

    //recebe o locator e clica com o botão direito do mouse

    function rightClick(locator, timeout) {
        var wait = false;
        var element = browser.findElement(locator);
        browser.wait(function () {
            element.click().then(
                function () {
                    wait = true;
                    browser.actions().click(protractor.Button.RIGHT).perform();
                },
                function () {
                    browser.sleep(500);
                });
            return wait;
        }, timeout || 360000);
    };

    /* a função closeTab recebe como parametro o numero da aba na qual pretende-se fechar pelo navegador,
	por exemplo, para fechar a primeira aba do navegador envia-se como parametro o numero 0. */

    function closeWindow(i) {
        browser.getAllWindowHandles().then(function (handles) {
            browser.switchTo().window(handles[i]);
            browser.close();
        });
    };

    /* a função goToTab recebe como parametro o numero da aba na qual pretende-se abrir pelo navegador,
    por exemplo, para acessar a primeira aba do navegador envia-se como parametro o numero 0. */

    var doLogout = () => {
        var exitButton = element(by.css('.btn-logoff'));
        var confirmButton = element(by.id('msg-confirm'));
        browser.wait(EC.invisibilityOf(element.all(by.css('[ng-click="close($event)"]'))), 30000).then(() => {
            browser.wait(EC.invisibilityOf($('#loading-screen')), 10000).then(() => {
                browser.wait(EC.presenceOf(exitButton), 30000).then(() => {
                    browser.wait(EC.invisibilityOf($('#loading-screen')), 10000).then(() => {
                        browser.wait(EC.elementToBeClickable(exitButton), 5000).then(() => {
                            closePopUp().then(() => {
                                exitButton.click().then(() => {
                                    browser.wait(EC.presenceOf(confirmButton), 5000).then(() => {
                                        confirmButton.click().then(() => {
                                            browser.sleep(1000).then(() => {
                                                clearCache();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    var getRandomNumber = (max, startsWithZero = true) => {
        return Math.floor((Math.random() * max) + (startsWithZero ? 0 : 1));
    }

    var closePopUp = () => {
        console.log('Closing popups...')
        var prm = new Promise((resolve, reject) => {
            resolve(element(by.css('[ng-click="click(toaster)"]')).isPresent().then((visible) => {
                if (visible) {
                    element(by.css('[ng-click="click(toaster)"]')).click().then(() => {
                        browser.wait(EC.invisibilityOf($('[ng-click="click(toaster)"]')), 10000);
                    });
                } else {
                    console.log('Não há popups a serem fechadas!');
                }
            }))
        });
        return prm;
    }

    function closeToasters() {
        browser.wait(EC.presenceOf(element.all(by.repeater('toaster in toasters'))), 5000).then(() => {
            element.all(by.repeater('toaster in toasters')).click().then(() => {
                browser.wait(EC.stalenessOf(element.all(by.repeater('toaster in toasters'))), 5000).then(() => {
                    console.log('Notificações fechadas.');
                });
            });
        });
    }

    var generateString = (stringLength = 13) => {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < stringLength; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    /* Para o funcionamento da função execProgram é necessário passar por parâmetro o diretório do arquivo 
    que deseja executar. ATENTAR AS TECLAS DE ESCAPE. */

    var execProgram = (directory, callback = undefined) => {

        shell.exec(directory, { async: true, silent: true }, function (code, stdout, stderr) {
            if (stderr) {
                console.error(stderr);
                return;
            }
            if (callback) {
                callback();
            }
        });
    };

    var clearCache = () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
    }

    var checkOS = function (window) {

        var os = require('os');
        var osList = [
            { s: 'Windows', r: 'Windows_NT' },
            { s: 'Mac OS X', r: 'Darwin' },
            { s: 'Linux', r: 'Linux' },
            { s: 'SmartMachine', r: 'SunOS' },
        ];
        for (var id in osList) {
            var cs = osList[id];
            if (cs.r === os.type()) {
                os = cs.s;
                break;
            }
        }
        return os;
    }

    function getUserHome() {
        return process.env.HOME || process.env.USERPROFILE;
    }

    function getScriptPath() {
        return process.cwd();
    }

    var openNewWindow = () => {
        browser.executeScript('window.open()');
    }

    var changeWindow = (i) => {
        browser.getAllWindowHandles().then((handles) => {
            browser.switchTo().window(handles[i]);
        });
    }

    var startTest = (user = 'super', password = 'super@123', url = 'http://cordas:8180/menu-html/#/') => {
        return new Promise((resolve, reject) => {
            browser.get(url).then(() => {
                doLogin(user, password).then(() => {
                    resolve(true);
                });
            }, 25000);
        })
    }

    var setCheckbox = (locator, value, callback = undefined) => {
        element(locator).isSelected().then(function (selected) {
            switch (value) {
                case true:
                    if (selected) {
                        
                    } else {
                        element(locator).click().then(() => {
                            expect(element(locator).isSelected()).toBeTruthy();
                        });
                    }
                    if (callback)
                        callback();
                    break;
                case false:
                    if (selected) {
                        element(locator).click().then(() => {
                            expect(element(locator).isSelected()).toBeFalsy();
                        });
                    } else {
                    }
                    if (callback)
                        callback();
                    break;
            }
        });
    }

    return {
        waitForElement: waitForElement,
        waitForClick: waitForClick,
        doLogin: doLogin,
        closeWindow: closeWindow,
        rightClick: rightClick,
        getRandomNumber: getRandomNumber,
        doLogout: doLogout,
        closePopUp: closePopUp,
        closeToasters: closeToasters,
        generateString: generateString,
        doSpecificLogin: doSpecificLogin,
        execProgram: execProgram,
        checkOS: checkOS,
        getUserHome: getUserHome,
        getScriptPath: getScriptPath,
        openNewWindow: openNewWindow,
        changeWindow: changeWindow,
        startTest: startTest,
        clearCache: clearCache,
        setCheckbox: setCheckbox
    };

})();