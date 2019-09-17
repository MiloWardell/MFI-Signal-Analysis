/*
 * Push binance data to SQL database
 */

// Dependencies
const mysql = require('mysql')
const config = require('../config')

// SQL object
const sql = {}

sql.createTable = function (tickers) {
  return new Promise(async (resolve, reject) => {
    let connection

    // Condense Querry
    // var querry = ``
    // tickers.forEach(ticker => {
    //   querry = querry.concat(
    //     `CREATE TABLE IF NOT EXISTS ${
    //       ticker.symbol
    //     } (symbol CHAR(10) NOT NULL); \n`
    //   )
    // })
    // console.log(querry)

    try {
      // Create Connection
      connection = mysql.createConnection(config.connection)

      // Connect
      connection.connect(err => {
        if (err) {
          throw new Error('Failed to Connect to Database', err)
        }
        console.log('CREATE: Connected to Database...')
      })

      // Querry Database
      tickers.forEach(ticker => {
        const querry = `CREATE TABLE IF NOT EXISTS ${ticker.symbol} 
        (\`resolution\` VARCHAR(20) NOT NULL, 
        \`time\` VARCHAR(100) NOT NULL, 
        \`open\` VARCHAR(100) NOT NULL, 
        \`close\` VARCHAR(100) NOT NULL, 
        \`high\` VARCHAR(100) NOT NULL, 
        \`low\` VARCHAR(100) NOT NULL, 
        \`volume\` VARCHAR(100) NOT NULL,
        CONSTRAINT \`unique\` PRIMARY KEY (\`resolution\` , \`time\`)); \n`
        connection.query(querry, err => {
          if (err) {
            throw new Error('Failed to querry data', err)
          }
          // console.log(`Sending ticker ${ticker.symbol}`)
        })
      })

      // Resolve Promise
      resolve()
    } catch (err) {
      reject(new Error('Error occurred', err))
    } finally {
      try {
        connection.end(err => {
          if (err) throw err
          console.log('CREATE: Close Connection...')
        })
      } catch (err) {
        reject(new Error('Error closing connection', err))
      }
    }
  })
}

sql.postData = function (tickers) {
  return new Promise((resolve, reject) => {
    let connection
    try {
      // Create Connection
      connection = mysql.createConnection(config.connection)

      // Connect
      connection.connect(err => {
        if (err) {
          throw new Error('Failed to Connect to Database')
        }

        console.log('POST: Connected to Database...')
      })

      // Querry Database
      tickers.forEach(ticker => {
        const querry = concatQuerry(ticker)
        connection.query(querry, err => {
          if (err) {
            throw new Error('Failed to Push Data')
          }
          // console.log(`Sending ticker ${ticker.symbol}`)
        })
      })

      // Return Result
      resolve(true)
    } catch (err) {
      reject(new Error('Error occurred', err))
    } finally {
      try {
        connection.end(err => {
          if (err) {
            throw new Error('Failed to Close Connection')
          }
          console.log('POST: Close Connection...')
        })
      } catch (err) {
        reject(new Error('Error closing connection', err))
      }
    }
  })
}

sql.getData = function (tickers, resolution) {
  return new Promise((resolve, reject) => {
    let connection
    try {
      // Create Connection
      connection = mysql.createConnection(config.connection)

      // Connect
      connection.connect(err => {
        if (err) {
          throw new Error('Failed to Connect to Database')
        }

        console.log('GET: Connected to Database...')
      })

      const querriedTickers = []
      // Querry Database
      tickers.forEach(ticker => {
        const querry = `SELECT * FROM ${ticker.symbol}
            WHERE resolution='${resolution}'
            ORDER BY \`time\` DESC;`

        querriedTickers.push(
          new Promise((resolve, reject) => {
            connection.query(querry, (err, result) => {
              if (err) {
                reject(new Error('Failed to get Data'))
              }
              // console.log(`Sending ticker ${ticker.symbol}`)

              resolve({
                symbol: ticker.symbol,
                candles: result
              })
            })
          })
        )
      })
      resolve(Promise.all(querriedTickers))
    } catch (err) {
      reject(new Error('Error occurred', err))
    } finally {
      try {
        connection.end(err => {
          if (err) {
            throw new Error('Failed to Close Connection')
          }
          console.log('GET: Close Connection...')
        })
      } catch (err) {
        reject(new Error('Error closing connection', err))
      }
    }
  })
}

// Private Helper Functions
function concatQuerry (ticker) {
  var querry = `INSERT IGNORE INTO ${
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
