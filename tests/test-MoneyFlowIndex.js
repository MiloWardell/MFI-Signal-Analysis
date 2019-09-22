/*
 * Test Suite for Money Flow Index
 */

// Dependencies
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert
chai.should()

const path = require('path')
const localDir = path.join(__dirname, '/../lib/')
const MFI = require(localDir + 'MoneyFlowIndex.js')
const binance = require(localDir + 'binanceAPI.js')

describe('Tests MoneyFlowIndex.js', function () {})
