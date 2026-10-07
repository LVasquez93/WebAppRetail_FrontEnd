import { Cliente, Equipo, Usuario } from '../types/catalogos.types';

// Helper para dividir líneas respetando comillas y delimitadores (coma o punto y coma o tab)
function parsearLineasCsv(texto: string): string[][] {
  const lineas = texto.split(/\r?\n/).filter(l => l.trim().length > 0);
  return lineas.map(linea => {
    // Si contiene tabuladores (copiado directo de Excel)
    if (linea.includes('\t')) {
      return linea.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''));
    }
    // Si contiene punto y coma (formato hispano estándar de Excel)
    if (linea.includes(';') && (!linea.includes(',') || linea.split(';').length > linea.split(',').length)) {
      return linea.split(';').map(c => c.trim().replace(/^["']|["']$/g, ''));
    }
    // Formato CSV estándar por comas
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(linea)) !== null) {
      let val = match[1] || '';
      val = val.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
      matches.push(val);
      if (regex.lastIndex >= linea.length) break;
    }
    return matches.length > 0 ? matches : linea.split(',').map(c => c.trim());
  });
}

export function parsearCsvClientes(texto: string, defaultSucursalId?: number, defaultEmpresaId?: number): Partial<Cliente>[] {
  const filas = parsearLineasCsv(texto);
  if (filas.length === 0) return [];

  // Omitir encabezados si la primera fila parece contener nombres de columnas
  const primeraFila = filas[0];
  const esEncabezado = primeraFila.some(c => 
    /razon|social|cliente|contacto|telefono|correo|email|direccion|sucursal/i.test(c)
  );
  const dataFilas = esEncabezado ? filas.slice(1) : filas;

  return dataFilas
    .filter(cols => cols.length > 0 && cols[0] && cols[0].trim().length > 0)
    .map(cols => {
      // Columnas: RazonSocial, NombreComercial, ContactoPrincipal, Telefono, Correo, Direccion, SucursalId
      const razonSocial = cols[0]?.trim();
      const nombreComercial = cols[1]?.trim() || '';
      const contactoPrincipal = cols[2]?.trim() || '';
      const telefono = cols[3]?.trim() || '';
      const correo = cols[4]?.trim() || '';
      const direccion = cols[5]?.trim() || '';
      const sucursalCol = cols[6]?.trim();
      const sucursalId = sucursalCol ? Number(sucursalCol) || defaultSucursalId : defaultSucursalId;

      return {
        razonSocial,
        nombreComercial: nombreComercial || undefined,
        contactoPrincipal: contactoPrincipal || undefined,
        telefono: telefono || undefined,
        correo: correo || undefined,
        direccion: direccion || undefined,
        sucursalId: sucursalId || undefined,
        empresaId: defaultEmpresaId || undefined,
        activo: true
      };
    });
}

export function parsearCsvEquipos(texto: string, defaultSucursalId?: number, defaultEmpresaId?: number): Partial<Equipo>[] {
  const filas = parsearLineasCsv(texto);
  if (filas.length === 0) return [];

  const primeraFila = filas[0];
  const esEncabezado = primeraFila.some(c => 
    /descripcion|equipo|part|number|precio|entrega|categoria|caracteristicas/i.test(c)
  );
  const dataFilas = esEncabezado ? filas.slice(1) : filas;

  return dataFilas
    .filter(cols => cols.length > 0 && cols[0] && cols[0].trim().length > 0)
    .map(cols => {
      // Columnas: Descripcion, PartNumber, Caracteristicas, PrecioReferencial, TiempoEntrega, Categoria, SucursalId
      const descripcion = cols[0]?.trim();
      const partNumber = cols[1]?.trim() || '';
      const caracteristicas = cols[2]?.trim() || '';
      const precioStr = cols[3]?.trim()?.replace(/[$]/g, '') || '';
      const precioReferencial = precioStr ? Number(precioStr) || 0 : undefined;
      const tiempoEntregaPredeterminado = cols[4]?.trim() || 'De 5 a 6 semanas';
      const categoria = cols[5]?.trim() || 'General';
      const sucursalCol = cols[6]?.trim();
      const sucursalId = sucursalCol ? Number(sucursalCol) || defaultSucursalId : defaultSucursalId;

      return {
        descripcion,
        partNumber: partNumber || undefined,
        caracteristicas: caracteristicas || undefined,
        precioReferencial,
        tiempoEntregaPredeterminado,
        categoria,
        sucursalId: sucursalId || undefined,
        empresaId: defaultEmpresaId || undefined,
        activo: true
      };
    });
}

export function parsearCsvUsuarios(texto: string, defaultEmpresaId?: number): Partial<Usuario>[] {
  const filas = parsearLineasCsv(texto);
  if (filas.length === 0) return [];

  const primeraFila = filas[0];
  const esEncabezado = primeraFila.some(c => 
    /username|usuario|nombre|completo|correo|email|cargo|rol/i.test(c)
  );
  const dataFilas = esEncabezado ? filas.slice(1) : filas;

  return dataFilas
    .filter(cols => cols.length > 0 && cols[0] && cols[0].trim().length > 0)
    .map(cols => {
      // Columnas: Username, NombreCompleto, Correo, Cargo, Rol
      const username = cols[0]?.trim().toUpperCase();
      const nombreCompleto = cols[1]?.trim() || '';
      const correo = cols[2]?.trim() || '';
      const cargo = cols[3]?.trim() || '';
      const rol = cols[4]?.trim() || 'ROLE_VENTAS';

      return {
        username,
        nombreCompleto: nombreCompleto || username,
        correo: correo || undefined,
        cargo: cargo || undefined,
        rol,
        empresaId: defaultEmpresaId || undefined,
        activo: true
      };
    });
}

export function descargarPlantillaCsv(tipo: 'clientes' | 'equipos' | 'usuarios'): void {
  let encabezados = '';
  let ejemplos = '';
  let nombreArchivo = '';

  if (tipo === 'clientes') {
    nombreArchivo = 'plantilla_clientes.csv';
    encabezados = 'RazonSocial;NombreComercial;ContactoPrincipal;Telefono;Correo;Direccion;SucursalId\n';
    ejemplos = 'DISTRIBUIDORA SAN MIGUEL SA DE CV;DISTRIBUIDORA SM;Ing. Mario Lopez;2660-1234;ventas@dsm.com.sv;San Miguel;1\n' +
               'HOTEL MIRADOR DE ORIENTE SA DE CV;HOTEL MIRADOR;Licda. Patricia Ruiz;2661-8899;reservas@hotelmirador.sv;La Union;2\n';
  } else if (tipo === 'equipos') {
    nombreArchivo = 'plantilla_equipos.csv';
    encabezados = 'Descripcion;PartNumber;Caracteristicas;PrecioReferencial;TiempoEntrega;Categoria;SucursalId\n';
    ejemplos = 'IMPRESORA ZEBRA ZD220 TERMICA;ZD22042-D01G00EZ;Resolucion 203 dpi, Conexion USB, Impresion termica directa;285.00;Stock Inmediato;Impresoras Termicas;1\n' +
               'LECTOR HONEYWELL VOYAGER 1250G;1250G-2USB-1;Lectura laser 1D lineal con base incluida;115.00;De 2 a 3 semanas;Lectores de Codigo;2\n';
  } else {
    nombreArchivo = 'plantilla_usuarios.csv';
    encabezados = 'Username;NombreCompleto;Correo;Cargo;Rol\n';
    ejemplos = 'JPEREZ;Lic. Juan Perez;juan.perez@retail.com.sv;Ejecutivo de Ventas Senior;ROLE_VENTAS\n' +
               'MHERNANDEZ;Ing. Marcela Hernandez;marcela.hernandez@retail.com.sv;Supervisora de Operaciones;ROLE_ADMIN\n';
  }

  const contenido = '\uFEFF' + encabezados + ejemplos; // \uFEFF para que Excel reconozca acentos en UTF-8
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
