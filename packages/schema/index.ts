export const schema = {
  namespace: "default",
  name: "main",
  active: true,
  content: `
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    name TEXT,
    category_id INTEGER,
    author_id INTEGER,
    amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS participant_category_coefficients (
    participant_id TEXT,
    category_id TEXT,
    coefficient REAL,
    PRIMARY KEY (participant_id, category_id)
);

CREATE TABLE IF NOT EXISTS participant_expense_coefficients (
    participant_id TEXT,
    expense_id TEXT,
    coefficient REAL,
    PRIMARY KEY (participant_id, expense_id)
);

SELECT crsql_as_crr('expenses');
SELECT crsql_as_crr('categories');
SELECT crsql_as_crr('participants');
SELECT crsql_as_crr('participant_expense_coefficients');
SELECT crsql_as_crr('participant_category_coefficients');

INSERT INTO categories (id, name) VALUES ('default', 'default');
  `,
};

export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category_id: number;
  author_id: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}
