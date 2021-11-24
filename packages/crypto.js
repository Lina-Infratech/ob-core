const jose = require("node-jose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const logger = require("./logger.js");

class Crypto {
  constructor() {}

  async decryptJwe(jwe, auth) {
    // get key
    const key = await jose.JWK.asKey(auth.key, "pem").then((result) => result);

    // decode jwe header
    const jsonKey = key.toJSON(true);
    jsonKey.alg = auth.encryptionAlg;
    jsonKey.use = "enc";
    // decrypt
    const payload = await jose.JWE.createDecrypt(key)
      .decrypt(jwe)
      .then((result) => {
        return result;
      });

    const jws = jwt.decode(payload.plaintext.toString().replace(/["]+/g, ""), {
      complete: true,
    });

    return jws;
  }
  async fetchClientJwk(jwks_uri, kid) {
    const client = jwksClient({ jwksUri: jwks_uri });
    const clientKey = await client.getSigningKey(kid);
    const pemKey = clientKey.getPublicKey();
    try {
      const jwk = await jose.JWK.asKey(pemKey, "pem");
      return jwk.toJSON();
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async extractJwkFromCertificate(
    cert,
    certFormat = "x509",
    publicKeyOnly = true
  ) {
    try {
      const jwk = await jose.JWK.asKey(cert, certFormat);
      return jwk.toJSON(!publicKeyOnly);
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async createJws(payload, auth) {
    const key = await jose.JWK.asKey(auth.key, "pem").then((result) => result);

    const token = await jose.JWS.createSign(
      { format: "compact" },
      {
        key,
        header: {
          alg: auth.signingAlg,
        },
      }
    )
      .update(JSON.stringify(payload), "utf-8")
      .final()
      .then((result) => result);
    return token;
  }

  async decryptJweWithCoreKey(jwe) {
    logger.info("Decrypting jwe");
    const options = {
      method: "POST",
      data: { jwe },
      url: `https://orchestrator.dev.linaob.com.br/decrypt`,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };

    try {
      logger.info("sending orchestrator request");
      const {
        data: { jws },
      } = await axios(options);
      logger.info("decrypted");
      return jws;
    } catch (e) {
      logger.error("Axios options:", options);
      logger.error(e);
      return null;
    }
  }

  async encryptJwsWithCoreKey(jws) {
    const jwks = await auth.fetchCorePublicKey();
    const key = await jose.JWK.asKey(jwks, "json").then((result) => result);

    const token = await jose.JWE.createEncrypt({ format: "compact" }, key)
      .update(JSON.stringify(jws), "utf-8")
      .final()
      .then((result) => result);

    return token;
  }

  async fetchClientJwks(jwks_uri) {
    const jwksOptions = {
      method: "GET",
      url: jwks_uri,
    };

    try {
      const {
        data: { keys },
      } = await axios(jwksOptions);
      return keys;
    } catch (e) {
      logger.error(e);
      return null;
    }
  }
}

module.exports = Crypto;
