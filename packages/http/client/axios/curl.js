const curl = (axiosInstance, stdout = console.log, excludePatterns = []) => {
  axiosInstance.interceptors.request.use((request) => {
    for (const pattern of excludePatterns) {
      // pattern may be either a regexp or a string, use match or includes accordingly
      const pattern_matches = pattern.constructor.name === 'RegExp' && request.url.match(pattern)
      const include_matches = pattern.constructor.name === 'String' && request.url.includes(pattern)
      const exclude = pattern_matches || include_matches
      if (!exclude) return request
    }

    let url = request.baseURL ? request.baseURL : ''
    url += request.url

    if (request.params) {
      if (typeof request.params === 'string') {
        url += '?' + request.params
      } else {
        const querystring = new URLSearchParams([...Object.entries(request.params)])
        url += '?' + querystring.toString()
      }
    }

    let curl = `curl -X ${request.method.toUpperCase()} '${url}'`

    const headers = { ...request.headers.common, ...request.headers[request.method], ...request.headers }
    for (const key of ['Accept', 'common', 'delete', 'get', 'head', 'post', 'put', 'patch']) {
      delete headers[key]
    }

    // align content-type with axios best-guess:
    // - https://github.com/axios/axios/blob/ffea03453f77a8176c51554d5f6c3c6829294649/lib/defaults.js#L51
    // - https://github.com/axios/axios/blob/ffea03453f77a8176c51554d5f6c3c6829294649/lib/defaults.js#L10
    // - https://github.com/axios/axios/blob/ffea03453f77a8176c51554d5f6c3c6829294649/lib/utils.js#L104
    let data = request.data

    if (data) {
      if (Buffer.isBuffer(data) || data.constructor.name === 'FormData') {
        headers['Content-Type'] = headers['content-type']
        delete headers['content-type']
        data = '<binary>'
      } else if (typeof data === 'object') {
        headers['Content-Type'] = 'application/jsoncharset=utf-8'
        data = JSON.stringify(data)
      } else if (data instanceof URLSearchParams) {
        headers['Content-Type'] = 'application/x-www-form-urlencodedcharset=utf-8'
        data = data.toString()
      }
    } else {
      delete headers['Content-Type']
    }

    for (const [key, value] of Object.entries(headers)) {
      curl += ` -H '${key}: ${value}'`
    }

    if (data) {
      curl += ` -d '${data}'`
    }

    request.curl = curl
    stdout(curl)

    return request
  }, Promise.reject)
}

module.exports = curl