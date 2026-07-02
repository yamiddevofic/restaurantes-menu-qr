/**
 * Crea un restaurante de demostracion "Sabor del Pueblo" con categorias, platos y 5 mesas,
 * para que puedas probar el sistema completo de inmediato.
 *
 * Uso: node scripts/seed-demo.js
 * Usuario admin:  demo / demo1234
 * Usuario cocina: cocina / cocina1234
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../server/db');

const SLUG = 'sabor-del-pueblo';

function run() {
  const existing = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(SLUG);
  if (existing) {
    console.log(`El restaurante demo "${SLUG}" ya existe. No se creo nada nuevo.`);
    console.log(`Visita /admin con usuario "demo" y contrasena "demo1234".`);
    process.exit(0);
  }

  const restaurantId = db.prepare(
    'INSERT INTO restaurants (name, slug, currency) VALUES (?, ?, ?)'
  ).run('Sabor del Pueblo', SLUG, 'COP').lastInsertRowid;

  db.prepare('INSERT INTO users (restaurant_id, username, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(restaurantId, 'demo', bcrypt.hashSync('demo1234', 12), 'admin');
  db.prepare('INSERT INTO users (restaurant_id, username, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(restaurantId, 'cocina', bcrypt.hashSync('cocina1234', 12), 'cocina');

  const insertCat = db.prepare('INSERT INTO categories (restaurant_id, name, sort_order) VALUES (?, ?, ?)');
  const catEntradas = insertCat.run(restaurantId, 'Entradas', 0).lastInsertRowid;
  const catFuertes = insertCat.run(restaurantId, 'Platos fuertes', 1).lastInsertRowid;
  const catBebidas = insertCat.run(restaurantId, 'Bebidas', 2).lastInsertRowid;
  const catPostres = insertCat.run(restaurantId, 'Postres', 3).lastInsertRowid;

  const insertItem = db.prepare(
    `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const items = [
    [catEntradas, 'Empanadas (x3)', 'Empanadas de carne con aji casero', 8000, 0],
    [catEntradas, 'Patacones con hogao', 'Platano verde frito con hogao criollo', 10000, 1],
    [catFuertes, 'Bandeja paisa', 'Frijoles, arroz, carne molida, chicharron, huevo, arepa', 28000, 0],
    [catFuertes, 'Mojarra frita', 'Con patacon, arroz y ensalada', 26000, 1],
    [catFuertes, 'Sancocho de gallina', 'Porcion grande, incluye arroz y aguacate', 22000, 2],
    [catBebidas, 'Limonada natural', 'Jarra para compartir', 9000, 0],
    [catBebidas, 'Gaseosa', '400ml', 4500, 1],
    [catBebidas, 'Cerveza', 'Nacional 330ml', 6000, 2],
    [catPostres, 'Flan de caramelo', '', 6000, 0],
    [catPostres, 'Obleas', 'Con arequipe y queso', 5000, 1],
  ];
  items.forEach((i) => insertItem.run(restaurantId, ...i));

  const insertTable = db.prepare('INSERT INTO tables (restaurant_id, table_number, qr_token) VALUES (?, ?, ?)');
  for (let n = 1; n <= 5; n++) {
    insertTable.run(restaurantId, String(n), crypto.randomBytes(16).toString('hex'));
  }

  console.log('✅ Restaurante demo creado.');
  console.log(`   Slug: ${SLUG}`);
  console.log('   Admin:   usuario "demo"   / contrasena "demo1234"');
  console.log('   Cocina:  usuario "cocina" / contrasena "cocina1234"');
  console.log('\nEntra a /admin para ver el menu y descargar los codigos QR de las 5 mesas.');
}

run();
