const tenant = (axiosInstance) => {
  axiosInstance.interceptors.request.use((request) => {
    request.headers['tenant_id'] = request.tenant_id

    return request
  }, Promise.reject)
}

module.exports = tenant