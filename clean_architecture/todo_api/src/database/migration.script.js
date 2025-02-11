const fs = require("node:fs/promises");
const path = require("node:path");
const sqlite = require("node:sqlite");

const MIGRATIONS_FOLDER = path.join(__dirname, "migrations");

/**
 * Reads sql files in the migration folder and return them as an string array.
 * @returns {Promise<{migration: string, data: string}[]>}
 */
async function getMigrations() {
  const fileNames = await fs.readdir(MIGRATIONS_FOLDER);
  const migrations = [];
  for (const fileName of fileNames) {
    const migration = await fs.readFile(
      path.join(MIGRATIONS_FOLDER, fileName),
      {
        encoding: "utf8",
      },
    );
    migrations.push({ migration: fileName, data: migration.trim() });
  }
  return migrations;
}

/**
 * Apply the migrations returned by getMigrations to an sqlite.DatabaseSync Database
 */
async function migrate() {
  const db = new sqlite.DatabaseSync(
    path.join(__dirname, "..", "..", "db.sqlite"),
  );
  const migrations = await getMigrations();
  for (const migration of migrations) {
    db.exec(migration.data);
    console.log("Migrated:", migration.migration);
  }
}

migrate();
