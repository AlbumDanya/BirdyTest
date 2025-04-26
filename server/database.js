// server/database.js
const sqlite3 = require('sqlite3').verbose();
let db;

function initDB() {
  db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
      console.error('Error opening DB:', err);
    } else {
      console.log('Connected to SQLite.');
      db.run(`
        CREATE TABLE IF NOT EXISTS scores (
          userId TEXT,
          username TEXT,
          score INTEGER,
          createdAt INTEGER
        )
      `);
    }
  });
}

function saveScore(userId, username, score) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO scores (userId, username, score, createdAt)
      VALUES (?, ?, ?, ?) 
    `, [userId, username, score, Date.now()],
    function(err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function getTopScores(limit = 5) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT userId, username, MAX(score) as score
      FROM scores
      GROUP BY userId
      ORDER BY score DESC
      LIMIT ?
    `, [limit],
    (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  initDB,
  saveScore,
  getTopScores
};
