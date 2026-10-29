import {readFile} from 'node:fs/promises';
export async function migrate(db) {
  const sql = await readFile(new URL('../sql/001_schema.sql', import.meta.url), 'utf8');
  await db.transaction(async tx => {
    await tx.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    if (!(await tx.query('SELECT version FROM schema_migrations WHERE version=$1', ['001'])).rows.length) {
      await tx.exec(sql);
      await tx.query('INSERT INTO schema_migrations(version) VALUES($1)', ['001']);
    }
  });
}
export async function seed(db) {
  const sql = await readFile(new URL('../sql/seed.sql', import.meta.url), 'utf8');
  await db.transaction(tx => tx.exec(sql));
}
