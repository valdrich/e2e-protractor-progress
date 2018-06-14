# e2e-protractor-progress

Repositório do Coffee&Code sobre automação de testes E2E com o Protractor e Progress OpenEdge.

Abaixo alguns comandos que deveram ser executados pela linha de comando na pasta raíz do projeto e2e-protractor-progress:

Para realizar a instalação dos pacotes necessários para o desenvolvimento e execução dos testes basta executar o comando:

npm install

Para atualizar o driver do navegador utilizado nos testes, há um script no package.json que é possível utilizar pelo comando:

npm run update

Feito isso, para executar os testes do Datasul configurados no arquivo e2e/conf/protractor-conf.js - pode ser executado o seguinte comando na raíz do projeto:

npm run test
