// modulos externos
import inquirer from "inquirer";
import chalk from "chalk";
//modulo interno
import fs from "fs";

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "\t ESCOLHA UMA OPERAÇÃO",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      console.log(`acção escolhida ${action}`);
      option(action);
    })
    .catch((erro) => {
      console.error(erro);
    });
}

//FUNÇÕES REUSO
function option(action) {
  if (action === "Criar Conta") {
    Conta();
  } else if (action === "Consultar Saldo") {
    mostraSaldo();
  } else if (action === "Depositar") {
    deposito();
  } else if (action === "Sacar") {
    sacar();
  } else if (action === "Sair") {
    console.log(chalk.bgBlue.black("OBRIGADO POR USAR O SISTEMA"));
    process.exit();
  }
}

function verificaConta(nomeConta) {
  if (!fs.existsSync(`contas/${nomeConta}.json`)) {
    console.log(
      console.log(chalk.bgRed.black(`conta ${nomeConta} inexistente`))
    );
    return false;
  }
  return true;
}

function buscaConta(nomeConta) {
  const nomeJson = fs.readFileSync(`contas/${nomeConta}.json`, {
    encoding: "utf-8",
    flag: "r",
  });
  return JSON.parse(nomeJson);
}

//CRIAR CONTA
function Conta() {
  console.log(chalk.bgGreen.black("PARABENS POR NOS ESCOLHER"));
  console.log(chalk.green("DEFINA AS OPÇÕES DA CONTA"));

  constroiConta();
}

function constroiConta() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "ESCOLHA O NOME DA CONTA",
      },
    ])
    .then((answer) => {
      const nomeConta = answer["nomeConta"];
      console.info(nomeConta);

      if (!fs.existsSync("contas")) {
        fs.mkdirSync("contas");
      }

      if (fs.existsSync(`contas/${nomeConta}.json`)) {
        console.log(
          chalk.bgRed.black("conta ja existente, escolha outro nome")
        );
        constroiConta();
        return;
      }

      fs.writeFileSync(`contas/${nomeConta}.json`, '{"saldo": 0}', (erro) => {
        console.error(erro);
      });

      console.log(chalk.green("CONTA CRIADA COM SUCESSO"));
      operation();
    })
    .catch((erro) => {
      console.error(erro);
    });
}

// SALDO
function mostraSaldo() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "QUAL NOME DA SUA CONTA?",
      },
    ])
    .then((answer) => {
      const nomeConta = answer["nomeConta"];
      if (!verificaConta(nomeConta)) {
        return mostraSaldo();
      }

      const conta = buscaConta(nomeConta);
      console.log(chalk.bgBlue.black(`saldo de R$${conta.saldo}`));

      operation();
    })
    .catch((erro) => {
      console.error(erro);
    });
}

//DEPOSITO

function deposito() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "QUAL NOME DA SUA CONTA?",
      },
    ])
    .then((answer) => {
      const nomeConta = answer["nomeConta"];

      if (!verificaConta(nomeConta)) {
        return deposito();
      }

      inquirer
        .prompt([
          {
            name: "valor",
            message: "QUAL VALOR DO DEPOSITO?",
          },
        ])
        .then((answer) => {
          const valor = answer["valor"];

          depositaValor(nomeConta, valor);

          operation();
        });
    })
    .catch((erro) => {
      console.error(erro);
    });
}

function depositaValor(nomeConta, valor) {
  const dadosConta = buscaConta(nomeConta);

  if (!valor) {
    console.log(chalk.bgRed.red.solid("OCORREU ERRO, TENTE NOVAMENTE"));
    return deposito();
  }

  dadosConta.saldo = parseInt(valor) + parseInt(dadosConta.saldo);

  fs.writeFileSync(`contas/${nomeConta}.json`, JSON.stringify(dadosConta));

  console.log(`valor  R$${valor} depositado  na conta ${nomeConta}`);
}

// SACAR

function sacar() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "QUAL NOME DA CONTA ?",
      },
    ])
    .then((answer) => {
      const conta = answer["nomeConta"];

      if (!verificaConta(conta)) {
        sacar();
      }

      inquirer
        .prompt([
          {
            name: "valor",
            message: "QUANTO DESEJA SACAR?",
          },
        ])
        .then((answer) => {
          const valor = answer["valor"];

          retiraDinheiro(conta, valor);
        })
        .catch((erro) => {
          console.error(erro);
        });
    })
    .catch((erro) => {
      console.error(erro);
    });
}

function retiraDinheiro(nomeConta, valor) {
  const dadosConta = buscaConta(nomeConta);

  if (!valor) {
    console.log(chalk.bgRed.red.solid("OCORREU ERRO, TENTE NOVAMENTE"));
    return sacar();
  }

  if (dadosConta.saldo < valor) {
    console.log(chalk.bgRed.black(`saldo ${dadosConta.saldo} insuficiente`));
    retiraDinheiro();
  } else {
    dadosConta.saldo = parseInt(dadosConta.saldo) - parseInt(valor);
    fs.writeFileSync(`contas/${nomeConta}.json`, JSON.stringify(dadosConta));

    console.log(`valor  R$${valor} removido da conta ${nomeConta}`);

    operation();
  }
}
