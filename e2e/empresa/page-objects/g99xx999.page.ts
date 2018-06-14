import { browser } from 'protractor';
import * as progress from '../../conf/progress';

export class G99XX999  {
    private g99xx999;

    public waitForWindow(): void {
        this.g99xx999 = progress.waitForWindow('g99xx999');
    }

    public setCodEmpresa(codEmpresa: string) {
        this.g99xx999.findElement('c_cod_empresa').sendKeys(codEmpresa);
    }

    public ok(): void {
        this.g99xx999.findElement('bt-ok').choose();
    }

    public cancel(): void {
        this.g99xx999.findElement('bt-cancela').choose();
    }

    public help(): void {
        this.g99xx999.findElement('bt-ajuda').choose();
    }
}