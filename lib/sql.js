/*
 * Push binance data to SQL database
 */

// Dependencies
const config = require('../config')
const pool = require('mysql2/promise').createPool(config.connection)

// SQL object
const sql = {}

// Create Pooling Object

sql.createTable = async function (tickers) {
  let connection
  try {
    // Create Connection
    console.log('CREATE: Connect to mySQL Database...')

    // Query Database
    const tablePromises = await Promise.all(
      tickers.map(async ticker => {
        connection = await pool.getConnection()
        const query = `CREATE TABLE IF NOT EXISTS ${ticker.symbol} 
        (\`resolution\` VARCHAR(20) NOT NULL, 
        \`time\` VARCHAR(100) NOT NULL, 
        \`open\` VARCHAR(100) NOT NULL, 
        \`close\` VARCHAR(100) NOT NULL, 
        \`high\` VARCHAR(100) NOT NULL, 
        \`low\` VARCHAR(100) NOT NULL, 
        \`volume\` VARCHAR(100) NOT NULL,
        CONSTRAINT \`unique\` PRIMARY KEY (\`resolution\` , \`time\`));`
        const result = await connection.query(query)
        await connection.release()
        return result
      })
    )
    return tablePromises
  } finally {
    console.log('CREATE: Close connection to mySQL Database...')
  }
}

sql.postData = async function (tickers) {
  let connection
  try {
    // Create Connection
    console.log('POST: Connect to mySQL Database...')

    // query Database
    const queryPromises = await Promise.all(
      tickers.map(async ticker => {
        connection = await pool.getConnection(config.connection)
        const query = sql.concatquery(ticker)
        const result = await connection.query(query)
        await connection.release()
        return result
      })
    )
    return queryPromises
  } finally {
    console.log('POST: Close connection to mySQL Database...')
  }
}

sql.getData = async function (tickers, resolution) {
  let connection
  try {
    // Create Connection
    // console.log('GET: Connect to mySQL Database...')

    // query Database
    const querriedCandles = await Promise.all(
      tickers.map(async ticker => {
        connection = await pool.getConnection(config.connection)
        const query = `SELECT * FROM ${ticker.symbol}
            WHERE resolution='${resolution}'
            ORDER BY \`time\` DESC;`
        const result = await connection.query(query)
        await connection.release()
        return result[0]
      })
    )

    return tickers.map((ticker, i) => {
      return {
        symbol: ticker.symbol,
        candles: querriedCandles[i]
      }
    })
  } finally {
    // console.log('GET: Close connection to mySQL Database...')
  }
}

sql.closeConnection = function () {
  pool.end()
}

// Private Helper Functions
sql.concatquery = function (ticker) {
  let query = `INSERT IGNORE INTO ${
    ticker.symbol
  } (resolution, \`time\`, open, close, high, low, volume) VALUES `

  // Seperate Candles
  ticker.candles.forEach(candle => {
    const values = '\n(?, ?, ?, ?, ?, ?, ?),'
    const inserts = [
      ticker.interval,
      candle[0],
      candle[1],
      candle[4],
      candle[2],
      candle[3],
      candle[5]
    ]
    query = query.concat(pool.format(values, inserts))
  })
  return query.slice(0, -1) + ';'
}

// Export Module
module.exports = sql
