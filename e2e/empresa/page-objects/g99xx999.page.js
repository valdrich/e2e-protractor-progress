"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const progress = require("../../conf/progress");
class G99XX999 {
    waitForWindow() {
        this.g99xx999 = progress.waitForWindow('g99xx999');
    }
    setCodEmpresa(codEmpresa) {
        this.g99xx999.findElement('c_cod_empresa').sendKeys(codEmpresa);
    }
    ok() {
        this.g99xx999.findElement('bt-ok').choose();
    }
    cancel() {
        this.g99xx999.findElement('bt-cancela').choose();
    }
    help() {
        this.g99xx999.findElement('bt-ajuda').choose();
    }
}
exports.G99XX999 = G99XX999;
