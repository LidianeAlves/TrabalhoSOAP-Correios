/*
  Manual SIGEP
  https://www.correios.com.br/atendimento/developers/arquivos/manual-para-integracao-via-web-services-sigep-web
*/

const soap = require('soap');

const ATENDE_CLIENTE_WSDL = 'https://apphom.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl';

const CORREIOS_CREDENCIAIS = {
  USUARIO: 'sigep',
  SENHA: 'n5f9t8',
  COD_ADM: '17000190',
  CONTRATO: '9992157880',
  SE: '10',
  CARTAO: '0067599079',
  CNPJ: '34028316000103'
}

async function consultaCEP(cep) {
  const client = await soap.createClientAsync(ATENDE_CLIENTE_WSDL);
  return client.consultaCEPAsync({ cep: cep });
}

// Este método retorna os serviços disponíveis do contrato para um determinado cartão de postagem.
async function buscaCliente() {
  const client = await soap.createClientAsync(ATENDE_CLIENTE_WSDL);
  return client.buscaClienteAsync({
    idContrato: CORREIOS_CREDENCIAIS.CONTRATO,
    idCartaoPostagem: CORREIOS_CREDENCIAIS.CARTAO,
    usuario: CORREIOS_CREDENCIAIS.USUARIO,
    senha: CORREIOS_CREDENCIAIS.SENHA
  })
}

async function verificaDisponibilidadeServico(options) {
  const { numServico, cepOrigem, cepDestino } = options;
  const client = await soap.createClientAsync(ATENDE_CLIENTE_WSDL);
  return client.verificaDisponibilidadeServicoAsync({
    codAdministrativo: CORREIOS_CREDENCIAIS.COD_ADM,
    numeroServico: numServico,
    cepOrigem: cepOrigem,
    cepDestino: cepDestino,
    usuario: CORREIOS_CREDENCIAIS.USUARIO,
    senha: CORREIOS_CREDENCIAIS.SENHA
  });
}



async function main() {

  try {
    const resultadoCEP = await consultaCEP('35162048');
    console.log('Resultado CEP:', resultadoCEP[0].return);
  } catch (err) {
    console.log('Falha ao consultar o CEP.');
  }
  
  console.log('----------------------');

  try {
    const resultadoBuscaCliente = await buscaCliente();
    console.log('Resultado busca cliente:', resultadoBuscaCliente);
  } catch (err) {
    console.error(err);
    console.log('Falha ao consultar cliente.');
  }

  console.log('----------------------');

  try {
    // Ex: 03220, 03298.
    const resultadoVerificaDisponibilidadeServico = await verificaDisponibilidadeServico({
      numServico: '03220',
      cepOrigem: '35162048',
      cepDestino: '32241395'
    });

    const resultado = resultadoVerificaDisponibilidadeServico[0].return;

    console.log('Resultado disponibilidade serviço:');

    if (resultado === '0#') {
      console.log('O serviço está disponível para o endereço desejado.');
    } else {
      console.log(`O serviço não está disponível, motivo: ${resultado.split('#')[1]}`);
    }
  } catch (err) {
    console.log('Falha ao consultar a disponibilidade do serviço.');
  }

}

main();


