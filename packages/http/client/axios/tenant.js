const tenant = (axiosInstance) => {
  axiosInstance.interceptors.request.use((request) => {
    let tenant_id = request.headers.tenant_id

    if (tenant_id) {
      headers['tenant_id'] = tenant_id
    } else {
      console.info({ tenant_id })
    }

    return request
  }, Promise.reject)
}

module.exports = tenant