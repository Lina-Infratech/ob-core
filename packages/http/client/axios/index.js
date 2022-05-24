const axios = require('axios')
const rax = require('retry-axios')
const curl = require('./curl')
const tenant = require('./tenant')

class Axios {
    options = {
        timeout: 5000
    }

    constructor(options) {
        this.options = options
        this.bootstrap()
    }

    bootstrap() {
        const { timeout } = this.options

        this.instance = axios.create({ timeout })

        tenant(this.instance)
        curl(this.instance)

        this.instance.defaults.raxConfig = {
            instance: this.instance
        }

        rax.attach(this.instance)
    }
}

module.exports = Axios
