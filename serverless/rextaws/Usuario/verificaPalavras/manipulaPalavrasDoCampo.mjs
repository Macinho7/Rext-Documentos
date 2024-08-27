/* eslint-disable prettier/prettier */
const arrayS = ['palavras proibidas', '...'];

async function verificaCampoProibido(valor) {
  const valorA = arrayS.find((valores) => valores === valor);
  if (valorA !== undefined) {
    throw new Error('Palavra Proibida');
  } else {
    return valor;
  }
}

export { verificaCampoProibido };
