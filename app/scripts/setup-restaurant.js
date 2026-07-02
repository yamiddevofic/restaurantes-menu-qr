/**
 * Crea un restaurante nuevo con su usuario administrador (y opcionalmente un usuario de cocina).
 * No hay registro publico por seguridad: solo quien tiene acceso al servidor puede crear restaurantes.
 *
 * Uso:
 *   node scripts/setup-restaurant.js
 */
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('../server/db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
const askHidden = (q) => new Promise((resolve) => {
  // Nota: para simplicidad no se oculta la contrasena en consola.
  // Para produccion seria mejor usar una libreria como 'prompts' con mascara.
  rl.question(q, resolve);
});

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('=== Crear nuevo restaurante ===\n');

  const name = (await ask('Nombre del restaurante: ')).trim();
  if (!name) {
    console.log('El nombre es obligatorio.');
    process.exit(1);
  }

  let slug = (await ask(`Slug (identificador en la URL) [${slugify(name)}]: `)).trim();
  if (!slug) slug = slugify(name);
  slug = slugify(slug);

  const existing = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(slug);
  if (existing) {
    console.log(`Ya existe un restaurante con el slug "${slug}". Elige otro.`);
    process.exit(1);
  }

  const currency = (await ask('Moneda (ISO, ej. COP, PEN, ARS) [COP]: ')).trim() || 'COP';

  const adminUsername = (await ask('Usuario admin (para el panel de administracion): ')).trim();
  const adminPassword = await askHidden('Contrasena admin (minimo 8 caracteres): ');

  if (!adminUsername || !adminPassword || adminPassword.length < 8) {
    console.log('Usuario y contrasena de admin son obligatorios (contrasena de al menos 8 caracteres).');
    process.exit(1);
  }

  const wantsKitchenUser = (await ask('¿Crear tambien un usuario de cocina separado? (s/n) [n]: ')).trim().toLowerCase();

  let kitchenUsername = null;
  let kitchenPassword = null;
  if (wantsKitchenUser === 's') {
    kitchenUsername = (await ask('Usuario cocina: ')).trim();
    kitchenPassword = await askHidden('Contrasena cocina (minimo 8 caracteres): ');
  }

  const insertRestaurant = db.prepare(
    'INSERT INTO restaurants (name, slug, currency) VALUES (?, ?, ?)'
  );
  const info = insertRestaurant.run(name, slug, currency);
  const restaurantId = info.lastInsertRowid;

  const insertUser = db.prepare(
    'INSERT INTO users (restaurant_id, username, password_hash, role) VALUES (?, ?, ?, ?)'
  );

  const adminHash = bcrypt.hashSync(adminPassword, 12);
  insertUser.run(restaurantId, adminUsername, adminHash, 'admin');

  if (kitchenUsername && kitchenPassword && kitchenPassword.length >= 8) {
    const kitchenHash = bcrypt.hashSync(kitchenPassword, 12);
    insertUser.run(restaurantId, kitchenUsername, kitchenHash, 'cocina');
  }

  console.log('\n✅ Restaurante creado con exito.');
  console.log(`   Nombre:  ${name}`);
  console.log(`   Slug:    ${slug}`);
  console.log(`   Panel admin: /admin  (usuario: ${adminUsername})`);
  console.log(`   Panel cocina: /kitchen`);
  console.log('\nSiguiente paso: entra al panel de administracion, crea las categorias, los platos');
  console.log('y las mesas. Cada mesa generara automaticamente su codigo QR para imprimir.\n');

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creando el restaurante:', err);
  process.exit(1);
});
