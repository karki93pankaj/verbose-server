import parser from 'xml2json'
import isEmpty from 'lodash/isEmpty'

import fetch from '../ingestor/libs/fetch'


function convertEmtpyObjectsToNull (json) {
  if (!json) {
    return json
  }
  Object.keys(json).forEach((key) => {
    if (isEmpty(json[key])) {
      json[key] = null
    }
  })
  return json
}

function convertHttpProtocol (json) {
  Object.keys(json).forEach((key) => {
    if (typeof json[key] === 'string') {
      json[key] = json[key]
        .replace(/http:\/\/(production-content-assets|cdn|www).ratecity.com.au/g, '//$1.ratecity.com.au')
        .replace(/http:\/\/ratecity.com.au/g, '//www.ratecity.com.au')
        .replace(/http:\/\/(\d+).gravatar.com/g, '//$1.gravatar.com')
    }
  })
  return json
}

export async function getWordpressFeedAsJson (postType, feedUrl = 'http://content.ratecity.com.au/feed/') {
  let page = 1
  let items = []
  let hasResponse = true
  do {
    const wordpressFeed = `${feedUrl}?post_type=${postType}&paged=${page++}`
    console.log(wordpressFeed, 'wordpressFeed url');
    const response = await fetch(wordpressFeed) // eslint-disable-line no-await-in-loop
    if (response.status !== 200) {
      break
    }
    const feed = await response.text() // eslint-disable-line no-await-in-loop
    const feedJson = parser.toJson(feed, {object: true})
    const _items = feedJson['rss']['channel']['item']
    /* if there is only one result, the xml parser won't make it an array */
    if (!Array.isArray(_items)) {
      items.push(_items)
    } else {
      items = items.concat(_items)
    }
  } while (hasResponse)
  return items.map((item) => {
    item = convertEmtpyObjectsToNull(item)
    item = convertHttpProtocol(item)
    return item
  })
}