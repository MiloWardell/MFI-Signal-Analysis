/*
 * Config File
 */

const environment = {}

environment.development = {
  envName: 'development',
  port: 3000,
  intervals: ['1d'],
  defaultPeriod: 14,
  updateTickers: true,

  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '12345678',
    database: 'tickers'
  }
}

environment.production = {
  envName: 'production',
  port: 5000,
  intervals: ['1d', '3d', '1w', '1M'],
  defaultPeriod: 14,
  updateTickers: true,

  connection: {
    host: '',
    user: '',
    password: '',
    database: ''
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
