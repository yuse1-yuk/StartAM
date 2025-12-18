import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";

const dataDir = process.cwd();
const dbPath = path.join(dataDir, "data.sqlite");

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, "");
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  target_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS news_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export type TodoRecord = {
  id: number;
  text: string;
  target_date: string;
  created_at: string;
};

export type KeywordRecord = {
  id: number;
  keyword: string;
  created_at: string;
};

export function listTodos(fromDate: string): TodoRecord[] {
  const stmt = db.prepare(
    "SELECT * FROM todos WHERE date(target_date) >= date(?) ORDER BY date(target_date), id"
  );
  return stmt.all(fromDate) as TodoRecord[];
}

export function listTodosByDate(date: string): TodoRecord[] {
  const stmt = db.prepare(
    "SELECT * FROM todos WHERE date(target_date) = date(?) ORDER BY id"
  );
  return stmt.all(date) as TodoRecord[];
}

export function addTodo(text: string, targetDate: string): TodoRecord {
  const stmt = db.prepare(
    "INSERT INTO todos (text, target_date) VALUES (?, ?)"
  );
  const info = stmt.run(text, targetDate);
  return {
    id: Number(info.lastInsertRowid),
    text,
    target_date: targetDate,
    created_at: new Date().toISOString(),
  };
}

export function deleteTodo(id: number) {
  const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
  stmt.run(id);
}

export function listKeywords(): KeywordRecord[] {
  const stmt = db.prepare(
    "SELECT * FROM news_keywords ORDER BY created_at DESC LIMIT 50"
  );
  return stmt.all() as KeywordRecord[];
}

export function addKeyword(keyword: string): KeywordRecord {
  const stmt = db.prepare("INSERT INTO news_keywords (keyword) VALUES (?)");
  const info = stmt.run(keyword);
  return {
    id: Number(info.lastInsertRowid),
    keyword,
    created_at: new Date().toISOString(),
  };
}

export function deleteKeyword(id: number) {
  const stmt = db.prepare("DELETE FROM news_keywords WHERE id = ?");
  stmt.run(id);
}
