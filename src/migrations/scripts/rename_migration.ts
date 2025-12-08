import * as fs from 'fs';
import * as path from 'path';

// Convert migration's format: YYYY-MM-DD-migration

function getNewestFile(dir: string): string | null {
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.ts'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(dir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return files.length ? files[0].name : null;
}

function main() {
  const migrationsDir = path.join(__dirname, '../src/migrations');
  const newest = getNewestFile(migrationsDir);

  if (!newest) {
    console.error('Not found any migration files');
    process.exit(1);
  }

  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  const prefix = `${yyyy}_${mm}_${dd}`;

  // Lấy phần tên sau dấu "-"
  const namePart = newest.split('-').slice(1).join('-');
  const newName = `${prefix}-${namePart}`;

  const oldPath = path.join(migrationsDir, newest);
  const newPath = path.join(migrationsDir, newName);

  fs.renameSync(oldPath, newPath);

  console.log(`Rename migration:\n${newest} → ${newName}`);
}

main();
