import sleep from 'sleep-promise'
import { filter, keysIn, startsWith, head, forEach } from 'lodash'

import client from './elasticSearch'
import _entityTypes from './entityTypes'
import { ES_INDEX_PREFIX, environment } from '../config'

export default client
export const entityTypes = _entityTypes

async function checkIndexCounts (oldIndexName, newIndexName, alias, ignoreIndexCheck = false) {
  if (environment !== 'production' || ignoreIndexCheck) {
    return
  }
  const oldCount = (await client.count({index: oldIndexName})).count

  // 1s delay to avoid AWS Elasticsearch returns 503 service unavailable
  await sleep(1000)

  const newCount = (await client.count({index: newIndexName})).count
  if (oldCount < 1) {
    return
  }
  const difference = oldCount - newCount
  const ratio = difference / oldCount
  if (ratio > 0.05 && difference > 5) {
    throw new Error(`Replacing index ${oldIndexName} would result in document count going from ${oldCount} to ${newCount}.  Run with IGNORE_INDEX_CHECK=true to force this ingest to run`)
  }
}

export function deleteIndex (index) {
  client.indices.delete({ index })
}

export async function updateElasticSearchAlias (alias, index, ignoreIndexCheck) {
  let currentIndex = ''
  try {
    currentIndex = await client.indices.getAlias({index: alias})
    currentIndex = head(keysIn(currentIndex))
  } catch (e) {
    currentIndex = ''
  }
  try {
    const actions = [{add: {index, alias}}]
    if (currentIndex !== '') {
      actions.push({
        remove: {index: currentIndex, alias},
      })
      await checkIndexCounts(currentIndex, index, alias, ignoreIndexCheck)
    }
    const { acknowledged } = await client.indices.updateAliases({
      body: { actions },
    })
    if (acknowledged) {
      let previousIndices = await client.indices.getAlias()
      previousIndices = filter(keysIn(previousIndices), (previousIndex) => startsWith(previousIndex, `${alias}-`) && previousIndex !== index)

      forEach(previousIndices, (previousIndex) => deleteIndex(previousIndex))
    }
  } catch (error) {
     console.error(`Failed to updateAliases ${alias}`, error)
  }
}

function requestPromise (index, type, body) {
  return new Promise((resolve, reject) => bulkRequest(index, type, body, { resolve, reject }))
    .catch((errors) => console.log(errors)) // eslint-disable-line
}

function bulkRequest (index, type, body, { resolve, reject }, retries = 0) {
  return client.bulk({
    index,
    type,
    requestTimeout: 60 * 1000 * 3,
    body,
  }).then((resp) => {
    if (!resp.errors) return resolve()
    if (retries >= 3) return reject(resp.items.map((item) => item.index.error).filter((error) => !!error))
    bulkRequest(index, type, body, { resolve, reject }, ++retries)
  })
}

export async function importData (index, typeName, data, idField, batchSize = 100) {
  let requestBody = []
  let insertRequests = []
  for (let i = 0; i < data.length;) {
    if (idField && data[i][idField]) {
      requestBody.push({
        index: {
          _id: data[i][idField],
        },
      })
    } else {
      requestBody.push({index: {}})
    }
    requestBody.push(data[i])
    i++

    if (i % batchSize === 0) {
      insertRequests.push(requestPromise(index, typeName, requestBody))
      requestBody = []
    }
  }

  if (requestBody.length > 0) {
    insertRequests.push(requestPromise(index, typeName, requestBody))
  }
  await Promise.all(insertRequests)
  await client.indices.refresh({ index })
}

export function getIndexTimestampSuffix () {
  let _date = new Date().toString().replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '-').toLowerCase()
  let randomSuffix = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
  return `${_date}-${randomSuffix}`
}

export function generateIndexName (entityType, indexPrefix = ES_INDEX_PREFIX) {
  const aliasName = `${indexPrefix}-${entityType}`
  const indexName = `${aliasName}-${getIndexTimestampSuffix()}`

  return {
    aliasName,
    indexName,
  }
}
