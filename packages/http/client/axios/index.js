const axios = require('axios')
const rax = require('retry-axios')
const curl = require('./curl')
const tenant = require('./tenant')

class Axios {
    options = {
        timeout: 5000,
    }

    constructor(options) {
        this.options = options
        this.bootstrap(options)
    }

    bootstrap(options) {
        this.instance = axios.create(this.options)

        // tenant header context
        tenant(this.instance)

        // curl
        if (process.env.NODE_ENV !== 'production') {
            curl(this.instance)
        }

        // rax retry
        this.instance.defaults.raxConfig = {
            instance: this.instance
        }

        rax.attach(this.instance)
    }
}

module.exports = Axios
