import elasticsearch from 'elasticsearch'
import AgentKeepAlive from 'agentkeepalive'

const log = {
  type: 'stdio',
  level: ['error'],
}

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log,
  apiVersion: '5.6',
  createNodeAgent (connection, config) {
    return new AgentKeepAlive(Object.assign({timeout: 60 * 1000 * 3}, connection.makeAgentConfig(config)))
  },
})

module.exports = client
