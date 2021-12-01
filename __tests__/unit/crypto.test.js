const AuthDto = require("../factory/cryptoDto")

const Crypto = require("../../packages/crypto")

describe("Crypto", () => {
  beforeEach(async () => {
    console.log(`beforeEach`)
  })

  it("should encrypt run test", async () => {
    const authDto = new AuthDto('golang')

    expect(authDto.key).toBe('golang')
  })

  xit("should decrypt with decryptJwe", async () => {
    const crypto = new Crypto()

    console.log(`Crypto`, crypto)

    expect(crypto).toBe(crypto)
  })
})
