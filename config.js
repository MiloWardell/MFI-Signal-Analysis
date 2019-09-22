/*
 * Config File
 */

const environment = {}

environment.development = {
  // Money Flow Index
  intervals: ['1d'], // Max 3 intervals to avoid rate limit
  defaultPeriod: 14,
  updateTickers: true,

  // Accuracy Metric
  futureCandlesLength: 5,

  // MySQL Connection
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: process.env.SQL_PASSWORD || '12345678',
    database: 'tickers',
    port: 3306
  }
}

environment.production = {
  // Money Flow Index
  intervals: ['1d', '3d', '4h'], // Max 3 intervals to avoid rate limit
  defaultPeriod: 14,
  updateTickers: true,

  // Accuracy Metric
  futureCandlesLength: 5,

  // MySQL Connection
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: process.env.SQL_PASSWORD || '12345678',
    database: 'tickers',
    port: 3306
  }
}

// Determine which environment was passed as a command-line argument
var currentEnvironment =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : ''

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport =
  typeof environment[currentEnvironment] === 'object'
    ? environment[currentEnvironment]
    : environment.development

// Export the module
module.exports = environmentToExport
