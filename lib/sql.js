/*
 * Push binance data to SQL database
 */

// Dependencies
const mysql = require('promise-mysql')
const config = require('../config')

// SQL object
const sql = {}

sql.createTable = async function (tickers) {
  let connection
  try {
    // Create Connection
    console.log('CREATE: Connect to mySQL Database...')
    connection = await mysql.createConnection(config.connection)

    // Querry Database
    let tablePromises = []
    tickers.forEach(async ticker => {
      const querry = `CREATE TABLE IF NOT EXISTS ${ticker.symbol} 
        (\`resolution\` VARCHAR(20) NOT NULL, 
        \`time\` VARCHAR(100) NOT NULL, 
        \`open\` VARCHAR(100) NOT NULL, 
        \`close\` VARCHAR(100) NOT NULL, 
        \`high\` VARCHAR(100) NOT NULL, 
        \`low\` VARCHAR(100) NOT NULL, 
        \`volume\` VARCHAR(100) NOT NULL,
        CONSTRAINT \`unique\` PRIMARY KEY (\`resolution\` , \`time\`));`
      tablePromises.push(connection.query(querry))
    })
    return await Promise.all(tablePromises)
  } finally {
    console.log('CREATE: Close connection to mySQL Database...')
    if (connection && connection.end) connection.end()
  }
}

sql.postData = async function (tickers) {
  let connection
  try {
    // Create Connection
    console.log('POST: Connect to mySQL Database...')
    connection = await mysql.createConnection(config.connection)

    // Querry Database
    let querryPromises = []
    tickers.forEach(async ticker => {
      const querry = concatQuerry(ticker)
      querryPromises.push(connection.query(querry))
    })
    return Promise.all(querryPromises)
  } finally {
    console.log('POST: Close connection to mySQL Database...')
    if (connection && connection.end) connection.end()
  }
}

sql.getData = async function (tickers, resolution) {
  let connection
  try {
    // Create Connection
    // console.log('GET: Connect to mySQL Database...')
    connection = await mysql.createConnection(config.connection)

    // Querry Database
    let querriedCandles = []
    tickers.forEach(ticker => {
      const querry = `SELECT * FROM ${ticker.symbol}
            WHERE resolution='${resolution}'
            ORDER BY \`time\` DESC;`
      querriedCandles.push(connection.query(querry))
    })
    querriedCandles = await Promise.all(querriedCandles)
    return tickers.map((ticker, i) => {
      return {
        symbol: ticker.symbol,
        candles: querriedCandles[i]
      }
    })
  } finally {
    // console.log('GET: Close connection to mySQL Database...')
    if (connection && connection.end) connection.end()
  }
}

// Private Helper Functions
function concatQuerry (ticker) {
  let querry = `INSERT IGNORE INTO ${
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
    querry = querry.concat(mysql.format(values, inserts))
  })
  return querry.slice(0, -1) + ';'
}

// Export Module
module.exports = sql
