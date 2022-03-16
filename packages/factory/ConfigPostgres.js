class ConfigPostgres {
    dialect = 'postgres';
    define = {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        pool: {
            max: 10,
        },
    }

    constructor(host, username, password, port, database) {
        this.host = host;
        this.username = username;
        this.password = password;
        this.port = port;
        this.database = database;

    }
}

module.exports = ConfigPostgres;
