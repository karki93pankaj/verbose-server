import fetch from '../fetch'

class KeystoneAPIClient {
  constructor (apiKey = process.env.KEYSTONE_API_KEY, endpoint = process.env.KEYSTONE_API_URL) {
    this.endpoint = endpoint
    this.apiKey = apiKey
  }

  async getFeed (feedType, params = {}) {
    try {
      let qs = ''
      for (let key in params) {
        qs += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      }
      const feedUrl = `${this.endpoint}/${feedType}?${qs}`
      const response = await fetch(feedUrl, {
        headers: {
          apiKey: this.apiKey,
        },
      })
      if (response.status !== 200) {
        console.error(`Keystone feed ${feedType} returned status: ${response.status}`)
        return null
      }
      let result = await response.json()
      return result
    } catch (error) {
      console.error(`Keystone feed ${feedType} error`, error)
      return null
    }
  }
}

export default KeystoneAPIClient
