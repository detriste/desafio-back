const XLSX = require('xlsx');
const db = require('../banco');
const path = require('path');

async function importar() {
 const wb = XLSX.readFile(path.join(__dirname, '../CONTROLE DE FERRAMENTAS.xlsm'));
  const ws = wb.Sheets['BD MOVIMENTAÇÃO'];
  const dados = XLSX.utils.sheet_to_json(ws);

  console.log('Total de linhas:', dados.length);
  console.log('Primeira linha:', dados[0]);
  console.log('Segunda linha:', dados[1]);

  let importadas = 0;
  let ignoradas = 0;
for (const row of dados) {
  const codigo = row['__EMPTY_1'] ? String(row['__EMPTY_1']).trim() : null;
  const nome   = row['Movimentações'] ? String(row['Movimentações']).trim() : null;

  if (!codigo || !nome) { ignoradas++; continue; }
  
  // ignora a linha de cabeçalho
  if (codigo === 'MATERIAL') { ignoradas++; continue; }

  try {
    await db.query(
      `INSERT INTO ferramentas (codigo, nome, quantidade_estoque, entradas, saidas, estoque_final)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nome = VALUES(nome),
         quantidade_estoque = VALUES(quantidade_estoque),
         entradas = VALUES(entradas),
         saidas   = VALUES(saidas),
         estoque_final = VALUES(estoque_final)`,
      [
        codigo,
        nome,
        row['__EMPTY_2'] || 0,
        row['__EMPTY_3'] || 0,
        row['__EMPTY_4'] || 0,
        row['__EMPTY_5'] || 0,
      ]
    );
    importadas++;
  } catch (err) {
    console.error(`Erro na linha ${codigo}:`, err.message);
  }
}

  console.log(`✅ Importadas: ${importadas} | Ignoradas: ${ignoradas}`);
  process.exit();
}

importar();