const UNIDADES = ['', 'UN ', 'DOS ', 'TRES ', 'CUATRO ', 'CINCO ', 'SEIS ', 'SIETE ', 'OCHO ', 'NUEVE '];
const DECENAS = [
  'DIEZ ', 'ONCE ', 'DOCE ', 'TRECE ', 'CATORCE ', 'QUINCE ', 'DIECISEIS ',
  'DIECISIETE ', 'DIECIOCHO ', 'DIECINUEVE ', 'VEINTE ', 'VEINTIUN ', 'VEINTIDOS ',
  'VEINTITRES ', 'VEINTICUATRO ', 'VEINTICINCO ', 'VEINTISEIS ', 'VEINTISIETE ',
  'VEINTIOCHO ', 'VEINTINUEVE '
];
const DIEZ_DECENAS = ['', 'DIEZ ', 'VEINTE ', 'TREINTA ', 'CUARENTA ', 'CINCUENTA ', 'SESENTA ', 'SETENTA ', 'OCHENTA ', 'NOVENTA '];
const CENTENAS = ['', 'CIENTO ', 'DOSCIENTOS ', 'TRESCIENTOS ', 'CUATROCIENTOS ', 'QUINIENTOS ', 'SEISCIENTOS ', 'SETECIENTOS ', 'OCHOCIENTOS ', 'NOVECIENTOS '];

function convertirNumero(n: number): string {
  if (n === 0) return '';
  if (n < 10) return UNIDADES[n];
  if (n < 30) return DECENAS[n - 10];
  if (n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    return DIEZ_DECENAS[d] + (u > 0 ? 'Y ' + UNIDADES[u] : '');
  }
  if (n < 1000) {
    if (n === 100) return 'CIEN ';
    const c = Math.floor(n / 100);
    const resto = n % 100;
    return CENTENAS[c] + convertirNumero(resto);
  }
  if (n < 1000000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    const textoMiles = miles === 1 ? 'MIL ' : convertirNumero(miles) + 'MIL ';
    return textoMiles + convertirNumero(resto);
  }
  const millones = Math.floor(n / 1000000);
  const resto = n % 1000000;
  const textoMillones = millones === 1 ? 'UN MILLON ' : convertirNumero(millones) + 'MILLONES ';
  return textoMillones + convertirNumero(resto);
}

export function numeroALetras(cantidad: number): string {
  if (cantidad === null || cantidad === undefined) return 'CERO DOLARES CON 00/100';
  const abs = Math.abs(cantidad);
  const parteEntera = Math.floor(abs);
  const centavos = Math.round((abs - parteEntera) * 100);

  let letras = parteEntera === 0 ? 'CERO ' : convertirNumero(parteEntera);
  const centavosStr = centavos.toString().padStart(2, '0');
  return `${letras.trim()} DOLARES CON ${centavosStr}/100`;
}
