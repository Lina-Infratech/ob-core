const NodeCache = require("node-cache");

class TenantCache {
    constructor() {
        this.cache = new NodeCache();
    }
}

module.exports = new TenantCache();
