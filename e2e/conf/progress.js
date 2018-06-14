module.exports = (function () {

    var attributesMap = {
        screenValue: "SCREEN-VALUE"
    };

    var eventsMap = {
        choose: "CHOOSE"
    }

    var net = require('net');
    var client;
    var onData;
    var port;

    /**
     * Gerenciador de conexão com o Progress
     * @memberof Progress
     */
    function connect() {
        var server = "localhost";
        var tries = 0;

        browser.call(function () {
            return new Promise(function (resolve, reject) {
                client = new net.Socket();
                /**
                 * Realiza a conexão com o testAgent
                 * @memberof Progress
                 */
                var onConnect = function () {

                    getPort().then((port) => {

                        console.log("Trying to connecting DATASUL Test Agent at " + server + ":" + port + "...");

                        client.connect(port, server, function () {
                            console.log("DATASUL Test Agent connected.");
                            resolve();
                        });
                    });
                };

                // Receives a automation response from Progress
                client.on("data", function (data) {
                    data = data.toString().substring(2);

                    console.log("DATASUL Test Agent data received: " + data);
                    onData(data);
                });

                client.on("error", function (e) {
                    if (tries <= 3 && (e.code === "ECONNREFUSED" || e.code === "EADDRNOTAVAIL")) {
                        tries += 1;
                        setTimeout(onConnect, 3000);
                    } else {
                        //console.log("DATASUL Test Agent connection error: (" + e.message + ")");
                        reject(e);
                    }
                });

                // Release the socket connection
                client.on("close", function () {
                    console.log("DATASUL Test Agent connection closed");
                    client = undefined;
                });

                onConnect();
            });
        });
    }

    /**
     * Envia um comando ao TestAgent
     * @memberof Progress
     */
    var message = function (msg) {
        if (!client) connect();

        browser.call(function () {

            console.log("DATASUL Test Agent message sent: " + msg + ".");
            client.write(msg);
        });
    };

    var element = {
        /**
         * 
         * @memberof Progress
        */
        apply: function (value, noWait) {
            browser.call(function () {
                var wait = false;
                onData = function (data) {
                    wait = true;
                };
                message("apply|" + this.id + "|" + value + "|" + noWait);
                if (typeof noWait == "undefined" || !noWait) {
                    browser.wait(function () {
                        return wait;
                    }, 10000).catch(function () {
                        console.log("Mais de 10 segundos aguardando...");
                    });
                }
            }, this);
        },
        /**
         * Limpa o conteúdo de uma caixa de texto Progress
         * @memberof Progress
        */
        clear: function () {
            this.set("SCREEN-VALUE", "");
            return this;
        },
        /**
         * Envia um valor de tipo booleano a um elemento
         * @param {string} value Valor que será enviado
         * @memberof Progress
        */
        check: function (condition) {
            if (condition == true)
                return this.set("CHECKED", "yes");
            else
                return this.set("CHECKED", "");
        },
        select: function (value) {
            this.set("SCREEN-VALUE", value)
            this.apply("VALUE-CHANGED")
            return this;
        },
        getValue: function () {
            return new Promise((resolve) => {
                let result = this.get("SCREEN-VALUE")
                resolve(result)
            })
        },
        isChecked: function () {
            return new Promise((resolve) => {
                return this.get("CHECKED").then((value) => {
                    console.log(value)
                    if (value == 'yes')
                        resolve(true)
                    else
                        resolve(false)
                })
            })
        },
        /**
         * Envia um valor de tipo string a um elemento
         * @param {string} value Valor que será enviado
         * @memberof Progress
        */
        sendKeys: function (value) {
            return browser.call(function () {
                var callerId = this.id;

                return new Promise(function (resolve) {
                    onData = function (data) {
                        resolve();
                    };

                    switch (typeof (value)) {
                        case "object":
                            value.then(function (result) {
                                message("sendKeys|" + callerId + "|" + result);
                            });
                            break;

                        default:
                            message("sendKeys|" + callerId + "|" + value);
                            break;
                    }
                });
            }, this);
        },
        /**
         * Retorna o valor de atributo de um elemento
         * @param {string} value Valor que será retornado
         * @memberof Progress
        */
        get: function (name) {
            return browser.call(function () {
                var callerId = this.id;

                return new Promise(function (resolve, reject) {
                    onData = function (data) {
                        resolve(data);
                    };

                    message("get|" + callerId + "|" + name);
                });
            }, this);
        },
        /**
         * 
         * @param {string} value Valor que será definido
         * @memberof Progress
        */
        set: function (name, value) {
            var myResolve = undefined;
            var promise = new Promise(function (resolve, reject) {
                myResolve = resolve;
            });
            browser.call(function () {
                var wait = false;
                onData = function (data) {
                    wait = true;
                    myResolve(data);
                };
                message("set|" + this.id + "|" + name + "|" + value);
                browser.wait(function () {
                    return wait;
                }, 10000).catch(function () {
                    console.log("Mais de 10 segundos aguardando...");
                });
            }, this);
            return promise;
        },
        /**
         * Seleciona uma linha dentro de um browser
         * @param {string} value Linha que será selecionada
         * @memberof Progress
        */
        selectRow: function (value) {
            browser.call(function () {
                var wait = false;
                onData = function (data) {
                    wait = true;
                };
                message("selectRow|" + this.id + "|" + value);
                browser.wait(function () {
                    return wait;
                }, 10000).catch(function () {
                    console.log("Mais de 10 segundos aguardando...");
                });
            }, this);
        },
        /**
         * Busca por um elemento em um programa Progress
         * @memberof Progress
         * @param {string} name Elemento que será procurado
        */
        findElement: function (name) {
            var ret = Object.assign({}, element);
            browser.call(function () {
                var child = findElement(name, this.id);
                browser.call(function () {
                    ret.id = child.id;
                }, this);
            }, this);
            return ret;
        },
        /**
         * Busca por um elemento pelo seu atributo em uma janela Progress
         * @param {string} attributeName Nome do atributo do elemento
         * @param {string} attributeValue Valor do atributo do elemento
         * @memberof Progress
        */
        findElementByAttribute: function (attributeName, attributeValue) {
            var ret = Object.assign({}, element);
            browser.call(function () {
                var child = findElementByAttribute(attributeName, attributeValue, this.id);
                browser.call(function () {
                    ret.id = child.id;
                }, this);
            }, this);
            return ret;
        }
    };

    /**
     * Busca por um elemento em todas as janelas Progress
     * @param {string} name Elemento que será procurado
     * @memberof Progress
    */
    var findElement = function (name, parentID) {
        var ret = Object.assign({}, element);
        browser.call(function () {
            onData = function (data) {
                if (data === "?") {
                    fail("Elemento " + name + " não foi encontrado!");
                }
                ret.id = data;
            };
            message("findElement|" + name + "|" + parentID);
            browser.wait(function () {
                return ret.id;
            }, 10000).catch(function () {
                console.log("Mais de 10 segundos aguardando para encontrar o elemento...");
            });
        }, this);
        return ret;
    }

    /**
     * Busca por um elemento pelo seu atributo em todas as janelas Progress
     * @param {string} value Elemento que será procurado
     * @memberof Progress
    */
    var findElementByAttribute = function (attributeName, attributeValue, parentID) {
        var ret = Object.assign({}, element);
        browser.call(function () {
            onData = function (data) {
                if (data === "?") {
                    fail("Element with attribute name " + attributeName +
                        " and attribute value " + attributeValue + " not found !");
                }
                ret.id = data;
            };
            message("findElementByAttribute|" + attributeName + "|" + attributeValue + "|" + parentID);
            browser.wait(function () {
                return ret.id;
            }, 10000).catch(function () {
                console.log("Mais de 10 segundos aguardando para encontrar o elemento...");
            });
        }, this);
        return ret;
    };

    /**
     * Busca por uma janela pelo título
     * @param {string} value Elemento que será procurado
     * @memberof Progress
    */
    var findWindow = function (title) {
        var ret = Object.assign({}, element);
        browser.call(function () {
            onData = function (data) {
                if (data == '?') {
                    fail("Window " + title + " not found !");
                }
                ret.id = data;
            };
            message("findWindow|" + title);
            browser.wait(function () {
                return ret.id;
            }, 10000).catch(function () {
                console.log("A janela com o título \"" + title + "\" levou mais de 10 segundos para aparecer");
            });
        }, this);
        return ret;
    }

    // Wait for window with some title
    var waitForWindow = function (title, waitTime) {
        var ret = Object.assign({}, element);

        browser.call(function () {
            onData = function (data) {
                if (data == '?') {
                    setTimeout(function () {
                        message("findWindow|" + title);
                    }, 2000);
                } else {
                    ret.id = data;
                }
            };

            // Sleep para não sobrecarregar o servidor com verificações de presença do elemento.
            browser.sleep(2000)
            message("findWindow|" + title);

            browser.wait(function () {
                return ret.id;
            }, waitTime || 10000).catch(function () {
                fail("A janela com o título \"" + title + "\" demorou muito para aparecer");
            });
        });

        return ret;
    };

    // Query the database
    var query = function (table, where, field) {
        return browser.call(function () {
            var callerId = this.id;

            return new Promise(function (resolve, reject) {
                onData = function (data) {
                    resolve(data);
                };

                message("query|" + table + "|" + where + "|" + field);
            });
        }, this);
    };

    var setPort = function (value) {

        return new Promise((resolve) => {
            port = parseInt(value)
            resolve(true)
        });
    }

    var getPort = function () {
        return new Promise((resolve) => {
            resolve(port)
        });
    };

    // Add mapped attributes access methods
    for (attribute in attributesMap) {
        element[attribute] = function (value) {
            if (value == undefined) {
                return this.get(attributesMap[attribute]);
            } else {
                return this.set(attributesMap[attribute], value);
            }
        };
    }

    // Add mapped events apply methods
    for (event in eventsMap) {
        element[event] = function () {
            return this.apply(eventsMap[event]);
        };
    }

    // Run a program
    var run = function (value) {
        browser.call(function () {
            var wait = false;
            onData = function (data) {
                wait = true;
            };
            message("run|" + value);
            browser.wait(function () {
                return wait;
            }, 10000).catch(function () {
                console.log("Mais de 10 segundos aguardando execução do programa " + value);
            });
        }, this);
    };

    var compare = function (value, expected) {
        if (expected == value) {
            return expected;
        } else {
            fail("ERROR: Different value than expected");
        }
    }

    var failIfExists = (title, msg = "Window found!", callback = null) => {
        var prmResolve;
        var prm = new Promise((resolve, reject) => {
            prmResolve = resolve;
        })
        var ret = Object.assign({}, element);
        browser.call(() => {
            onData = (data) => {
                if (data != '?') {
                    if (callback)
                        callback();
                    prmResolve(true);
                    fail(msg);
                }
                prmResolve(false);
                ret.id = data;
            };
            message("findWindow|" + title);
            browser.wait(() => {
                return ret.id;
            }, 10000).catch((e) => {
                console.log("Window " + title + " not found ! Mais informações -> " + e);
            });
        }, this);
        return prm;
    }

    var alphabet = '0123456789abcdefghijklmnopqrtuvxyz';
    var selectDropdown = (mWindow, mDropdownElement, valueToSelect) => {
        var dropdownWindow = waitForWindow(mWindow);
        var valueHasChanged = false;
        var prm = new Promise((resolve, reject) => {
            dropdownWindow.findElement(mDropdownElement).get('SCREEN-VALUE').then((dropdownCurrentValue) => {
                asyncLoop({
                    length: alphabet.length,
                    functionToLoop: (loop, i) => {
                        setTimeout(() => {
                            if (valueHasChanged != true) {
                                console.log(valueHasChanged);
                                dropdownWindow.findElement(mDropdownElement).sendKeys(alphabet[i]);
                                browser.sleep(500).then(() => {
                                    dropdownWindow.findElement(mDropdownElement).get('SCREEN-VALUE').then((dropDownNewValue) => {
                                        console.log(dropDownNewValue + " = " + dropdownCurrentValue);
                                        if (valueToSelect != null && dropDownNewValue == valueToSelect && dropdownCurrentValue != valueToSelect ||
                                            valueToSelect == null && dropDownNewValue != dropdownCurrentValue ||
                                            valueToSelect != null && dropdownCurrentValue == valueToSelect && dropDownNewValue != dropdownCurrentValue)
                                            valueHasChanged = true;
                                    });
                                });
                            } else if (i > 32)
                                resolve(valueHasChanged);
                            loop();
                        }, 800);
                    },
                    callback: () => {
                        return true;
                    }
                });
            });
        });
        return prm;
    }

    var asyncLoop = (o) => {
        var i = -1;
        console.log("Chamou o loop");
        var loop = () => {
            console.log(i);
            i++;
            if (i == o.length) {
                o.callback();
                return;
            }
            o.functionToLoop(loop, i);
        };
        loop(); //init
    }

    var isVisible = (title) => {
        var prmResolve;
        var prm = new Promise((resolve) => {
            prmResolve = resolve;
        })
        var ret = Object.assign({}, element);
        browser.call(() => {
            onData = (data) => {
                if (data != '?') {
                    prmResolve(true);
                }
                prmResolve(false);
                ret.id = data;
            };
            message("findWindow|" + title);
            browser.wait(() => {
                return ret.id;
            }, 15000).catch((e) => {
                console.log('Janela ' + title + ' não encontrada!');
            });
        }, this);
        return prm;
    }

    return {
        findElement: findElement,
        findElementByAttribute: findElementByAttribute,
        findWindow: findWindow,
        waitForWindow: waitForWindow,
        query: query,
        run: run,
        compare: compare,
        failIfExists: failIfExists,
        getPort: getPort,
        setPort: setPort,
        selectDropdown: selectDropdown,
        isVisible: isVisible
    };

})();