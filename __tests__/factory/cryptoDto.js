const faker = require("faker")

class CryptoFactory {
  constructor(auth, jwks_uri) {
    this.auth = {
      key: auth.key ? auth.key : faker.random.word(),
      encryptionAlg: auth.encryptionAlg ? auth.encryptionAlg : faker.random.word(),
      signingAlg: auth.signingAlg ? auth.signingAlg : faker.random.word()
    }
    this.jwks_uri = jwks_uri ? jwks_uri : faker.random.word(); 
  }
}

module.exports = CryptoFactory
