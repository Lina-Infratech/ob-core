const fs = require('fs')
const fsPromisse = require('fs').promises
const schedule = require('node-schedule')
const { exec } = require('child_process')
const axios = require('axios')
const ConfigPostgresFactory = require('../factory/configPostgresFactory')

class TenantWorker {
    constructor() {
        this.init()
    }

    init = async () => {
        schedule.scheduleJob('*/60 * * * * *', async () => {
            try {
                const path = process.cwd() + '/src/database/config/index.json'

                const { data } =
                    await axios.get(`${process.env.MS_ONBOARD_HOST}/api/v1/tenants`)

                const postgres = data
                    .map((client) => client)
                    .map((element) => element.postgres.find((element) => element.microservice === process.env.MS))
                    .filter((element) => element !== undefined)

                if (Array.isArray(postgres) && postgres.length) {
                    for await (const { hostname, username, password, port, db_name } of postgres) {

                        const current = new ConfigPostgresFactory(hostname, username, password, port, db_name)

                        if (fs.existsSync(path) == true) {
                            await fsPromisse.unlink(path)
                        }

                        await fsPromisse.writeFile(path, JSON.stringify({ current }))

                        await new Promise((resolve, reject) => {
                            const migrate = exec(
                                `sequelize db:migrate --env current`,
                                { env: process.env },
                                err => (err ? reject(err) : resolve())
                            )

                            migrate.stdout.pipe(process.stdout)
                            migrate.stderr.pipe(process.stderr)
                        })

                        await fsPromisse.unlink(path)
                    }
                }

                return
            } catch (error) {
                return console.error(error)
            }
        })
    }

}

module.exports = TenantWorker