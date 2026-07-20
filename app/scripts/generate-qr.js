/**
 * Exporta todos los codigos QR de las mesas de un restaurante como archivos PNG
 * en la carpeta qr-exports/<slug>/, listos para imprimir.
 *
 * Uso:
 *   node scripts/generate-qr.js <slug-del-restaurante>
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const os = require('os');
const QRCode = require('qrcode');
const db = require('../server/db');

/* ---------- Auto-detectar IP local para BASE_URL ---------- */
if (!process.env.BASE_URL) {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        process.env.BASE_URL = `http://${iface.address}:${process.env.PORT || 3000}`;
        break;
      }
    }
    if (process.env.BASE_URL) break;
  }
  if (!process.env.BASE_URL) {
    process.env.BASE_URL = 'http://localhost:3000';
  }
}

const slug = process.argv[2];

if (!slug) {
  console.log('Uso: node scripts/generate-qr.js <slug-del-restaurante>');
  console.log('\nRestaurantes disponibles:');
  const all = db.prepare('SELECT slug, name FROM restaurants').all();
  all.forEach((r) => console.log(`  - ${r.slug} (${r.name})`));
  process.exit(1);
}

const restaurant = db.prepare('SELECT * FROM restaurants WHERE slug = ?').get(slug);
if (!restaurant) {
  console.log(`No existe un restaurante con slug "${slug}".`);
  process.exit(1);
}

const tables = db.prepare('SELECT * FROM tables WHERE restaurant_id = ? AND active = 1 ORDER BY table_number').all(restaurant.id);
if (tables.length === 0) {
  console.log('Este restaurante todavia no tiene mesas creadas. Crealas desde el panel de administracion (/admin).');
  process.exit(0);
}

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const outDir = path.join(__dirname, '..', 'qr-exports', slug);
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  for (const table of tables) {
    const url = `${baseUrl}/menu/${slug}/${table.qr_token}`;
    const filePath = path.join(outDir, `mesa-${table.table_number}.png`);
    await QRCode.toFile(filePath, url, { width: 800, margin: 2 });
    console.log(`Generado: ${filePath}`);
  }
  console.log(`\n✅ Listo. ${tables.length} codigos QR exportados en: ${outDir}`);
}

run();
