// Bounded loopback-only regression checks for the November 2026 compatible patches.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import express from "express";
import proxyaddr from "proxy-addr";
import qs from "qs";
const require = createRequire(import.meta.url);
for (const [name, version] of Object.entries({
  "react-router-dom": "7.18.5",
  "react-router": "7.18.5",
  "body-parser": "2.4.0",
  "proxy-addr": "2.0.8",
  qs: "6.17.1",
})) {
  assert.equal(
    require(`${name}/package.json`).version,
    version,
    `${name} must use the tested lockfile`,
  );
}
const dangerousSubnet = proxyaddr.compile("::ffff:10.0.0.0/8");
assert.equal(dangerousSubnet("203.0.113.7"), false);
assert.equal(dangerousSubnet("10.0.0.1"), false);
for (const subnet of ["10.0.0.0/8", "::ffff:10.0.0.0/104"]) {
  const trust = proxyaddr.compile(subnet);
  assert.equal(trust("10.0.0.1"), true);
  assert.equal(trust("203.0.113.7"), false);
}
const hostile = { a: [null, undefined, { toString: "non-callable" }] };
for (const options of [
  { arrayFormat: "comma" },
  { arrayFormat: "comma", encodeValuesOnly: true },
])
  assert.doesNotThrow(() => qs.stringify(hostile, options));
assert.equal(
  qs.stringify({ filters: { size: [3, 5], theme: "garden" } }),
  "filters%5Bsize%5D%5B0%5D=3&filters%5Bsize%5D%5B1%5D=5&filters%5Btheme%5D=garden",
);
assert.deepEqual(qs.parse("filters[size][0]=3&filters[size][1]=5"), {
  filters: { size: ["3", "5"] },
});

// The production realtime app does not mount a body parser or use trusted-proxy IPs.
// This isolated fixture explicitly enables a parser to exercise its patched error handling.
const app = express();
assert.equal(app.get("trust proxy"), false);
assert.equal(app.get("query parser"), "simple");
app.use(express.json());
app.post("/decode", (req, res) => res.json(req.body));
app.get("/alive", (_req, res) => res.send("alive"));
app.use((error, _req, res, _next) =>
  res.status(error.status || 400).json({ error: true }),
);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve, reject) => {
  server.once("listening", resolve);
  server.once("error", reject);
});
try {
  const url = `http://127.0.0.1:${server.address().port}`;
  const send = (body) =>
    fetch(`${url}/decode`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-encoding": "gzip",
      },
      body,
      signal: AbortSignal.timeout(3000),
    });
  const valid = gzipSync(Buffer.from('{"message":"garden"}'));
  const accepted = await send(valid);
  assert.equal(accepted.status, 200);
  assert.deepEqual(await accepted.json(), { message: "garden" });
  const rejected = await send(
    Buffer.concat([valid, Buffer.from("invalid trailing bytes")]),
  );
  assert.equal(rejected.status, 400);
  assert.deepEqual(await rejected.json(), { error: true });
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(
    await (
      await fetch(`${url}/alive`, { signal: AbortSignal.timeout(3000) })
    ).text(),
    "alive",
  );
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
console.log(
  "Publisher dependency checks passed: exact compatible versions, proxy trust boundary, qs hostile/ordinary serialization and bounded loopback compressed-body error handling/process survival.",
);
