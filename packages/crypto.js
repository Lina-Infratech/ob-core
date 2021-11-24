const jose = require("node-jose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const jwksClient = require("jwks-rsa");
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

  async fetchClientJwkWithKid(jwks_uri, kid) {
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

  async fetchClientJwks(jwks_uri, use = null, kid = null) {
    if (kid) {
      return fetchClientJwkWithKid(jwks_uri, kid);
    }

    const jwksOptions = {
      method: "GET",
      url: jwks_uri,
    };

    try {
      const {
        data: { keys },
      } = await axios(jwksOptions);
      /*
      const jwks = keys.filter(remoteKey => {
        return remoteKey.use === use;
      });
      return jwks[0];
      */
      return keys;
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

  async fetchPublicKid(key) {
    const jwksUri = `https://keystore.sandbox.directory.openbankingbrasil.org.br/${process.env.ORG_ID}/application.jwks`;
    const jwksOptions = {
      method: "GET",
      url: jwksUri,
    };
    try {
      const {
        data: { keys },
      } = await axios(jwksOptions);
      const publicKey = keys.filter((remoteKey) => {
        return remoteKey.n && remoteKey.n === key.n;
      });
      return publicKey[0].kid;
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async generateJws(payload, useDirectoryKid, auth) {
    const key = await jose.JWK.asKey(auth.key, "pem").then((result) => result);

    const options = {
      key,
      header: {
        alg: auth.signingAlg,
        typ: "JWT",
      },
    };
    if (useDirectoryKid) {
      options.header.kid = await fetchPublicKid(key.toJSON(true));
    }

    const token = await jose.JWS.createSign({ format: "compact" }, options)
      .update(JSON.stringify(payload), "utf-8")
      .final()
      .then((result) => result);
    return token;
  }

  async createJwe(jws, jwkJson = null, auth) {
    let key;
    let publicKid;
    if (!jwkJson) {
      key = await jose.JWK.asKey(auth.key, "pem").then((result) => result);
      publicKid = await this.fetchPublicKid(key.toJSON(true));
    } else {
      key = await jose.JWK.asKey(JSON.stringify(jwkJson), "json").then(
        (result) => result
      );
      publicKid = key.kid;
    }

    const token = await jose.JWE.createEncrypt(
      { format: "compact" },
      {
        key,
        header: {
          kid: publicKid,
          enc: auth.encryptionAlg,
          iv: "1234567890",
        },
      }
    )
      .update(JSON.stringify(jws), "utf-8")
      .final()
      .then((result) => result);

    return token;
  }
}

module.exports = Crypto;
