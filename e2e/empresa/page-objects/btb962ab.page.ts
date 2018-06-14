import * as progress from '../../conf/progress';

export class BTB962AB {
    private btb962ab;

    public waitForWindow(): void {
        this.btb962ab = progress.waitForWindow('btb962ab');
    }

    public setCodEmpresa(codEmpresa: string): void {
        this.btb962ab.findElement('cod_empresa').clear().sendKeys(codEmpresa);
    }

    public setDesRazaoSocial(desRazaoSocial: string): void {
        this.btb962ab.findElement('des_razao_social').clear().sendKeys(desRazaoSocial);
    }

    public setNomAbrev(nomAbrev: string): void {
        this.btb962ab.findElement('nom_abrev').clear().sendKeys(nomAbrev);
    }

    public ok(): void {
        this.btb962ab.findElement('bt-ok').choose();

        const msg = progress.waitForWindow('(55705)'); // É preciso reiniciar o servidor!
        msg.findElement('bt_ok').choose();
    }

    public save(): void {
        this.btb962ab.findElement('bt-save').choose();
    }

    public cancel(): void {
        this.btb962ab.findElement('bt-cancela').choose();
    }

    public help(): void {
        this.btb962ab.findElement('bt-ajuda').choose();
    }
}