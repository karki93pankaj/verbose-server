import Promise from 'bluebird'
import fetch from 'node-fetch'

fetch.Promise = Promise

export default fetch