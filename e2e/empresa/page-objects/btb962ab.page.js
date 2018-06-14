"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const progress = require("../../conf/progress");
class BTB962AB {
    waitForWindow() {
        this.btb962ab = progress.waitForWindow('btb962ab');
    }
    setCodEmpresa(codEmpresa) {
        this.btb962ab.findElement('cod_empresa').clear().sendKeys(codEmpresa);
    }
    setDesRazaoSocial(desRazaoSocial) {
        this.btb962ab.findElement('des_razao_social').clear().sendKeys(desRazaoSocial);
    }
    setNomAbrev(nomAbrev) {
        this.btb962ab.findElement('nom_abrev').clear().sendKeys(nomAbrev);
    }
    ok() {
        this.btb962ab.findElement('bt-ok').choose();
        const msg = progress.waitForWindow('(55705)');
        msg.findElement('bt_ok').choose();
    }
    save() {
        this.btb962ab.findElement('bt-save').choose();
    }
    cancel() {
        this.btb962ab.findElement('bt-cancela').choose();
    }
    help() {
        this.btb962ab.findElement('bt-ajuda').choose();
    }
}
exports.BTB962AB = BTB962AB;
