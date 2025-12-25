import Database from 'better-sqlite3';
import path from 'path';

// Database path - stored in project root
const dbPath = path.join(process.cwd(), 'data', 'campus.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    department TEXT,
    studentId TEXT,
    hostelBlock TEXT,
    roomNumber TEXT,
    phoneNumber TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    lastLoginAt TEXT DEFAULT CURRENT_TIMESTAMP,
    isActive INTEGER DEFAULT 1
  );

  -- Tickets table
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketId TEXT UNIQUE NOT NULL,
    studentId TEXT NOT NULL,
    studentEmail TEXT NOT NULL,
    studentName TEXT NOT NULL,
    originalText TEXT NOT NULL,
    aiAnalysis TEXT,
    location TEXT,
    status TEXT DEFAULT 'open',
    assignedTo TEXT,
    assignedDepartment TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    resolvedAt TEXT,
    expectedResolutionDate TEXT,
    isDuplicate INTEGER DEFAULT 0,
    duplicateOf TEXT,
    relatedTickets TEXT,
    attachments TEXT,
    isAnonymous INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 2,
    statusNotes TEXT,
    FOREIGN KEY (studentId) REFERENCES users(userId)
  );

  -- Status history table
  CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketId TEXT NOT NULL,
    previousStatus TEXT,
    newStatus TEXT NOT NULL,
    changedBy TEXT,
    changedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    isAutomatic INTEGER DEFAULT 0,
    FOREIGN KEY (ticketId) REFERENCES tickets(ticketId)
  );

  -- Ticket counter
  CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0
  );

  -- Initialize counter if not exists
  INSERT OR IGNORE INTO counters (name, value) VALUES ('tickets', 0);
`);

export default db;
