const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'restaurant.db');
const db = new DatabaseSync(DB_PATH);

// WAL = mejores lecturas/escrituras concurrentes -> ayuda en picos de pedidos.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA synchronous = NORMAL');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

/**
 * Helper de transacciones al estilo better-sqlite3: db.transaction(fn) devuelve
 * una funcion que ejecuta fn dentro de BEGIN/COMMIT, con ROLLBACK automatico si falla.
 */
db.transaction = function transaction(fn) {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      try { db.exec('ROLLBACK'); } catch (_) { /* noop */ }
      throw err;
    }
  };
};

module.exports = db;
