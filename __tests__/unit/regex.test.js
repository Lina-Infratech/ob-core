const Regex = require("../../packages/regex");

describe("Regex", () => {
  beforeEach(async () => {
    console.log(`beforeEach`)
  });

  it("should run test", async () => {
    console.log(`Regex`, Regex)

    expect("test").toBe("test");
  });
});
