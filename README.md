# D1 Remote Bindings TLS Bug Reproduction

Minimal reproduction for the TLS hostname mismatch error when using Cloudflare D1 remote bindings with `getPlatformProxy`.

## The Bug

When using:
- `wrangler.toml` with `remote = true` on a D1 binding
- Other bindings like R2 or IMAGES
- `.dev.vars` file with secrets
- `getPlatformProxy({ remoteBindings: true })`

The following error occurs:

```
TLS peer's certificate is not trusted; reason = Hostname mismatch
```

## Environment

- OS: Linux (WSL2 / Ubuntu)
- Node.js: 22.x
- wrangler: 4.55.0
- workerd: 1.20251213.0

## Steps to Reproduce

### Prerequisites

1. Have a Cloudflare account with a D1 database
2. Update `wrangler.toml` with your:
   - `account_id`
   - `database_id`
   - `database_name`
3. Create a `.dev.vars` file with any secret:
   ```
   SOME_SECRET = "test-value"
   ```

### Reproduction

```bash
# Install dependencies
pnpm install

# Test 1: Local D1 (should work)
pnpm test:local

# Test 2: Remote D1 (triggers TLS error)
pnpm test:remote
```

## Expected Behavior

`pnpm test:remote` should connect to the remote D1 database and return query results.

## Actual Behavior

`pnpm test:remote` fails with:

```
❌ Error: TLS peer's certificate is not trusted; reason = Hostname mismatch
```

## Key Finding

The TLS error is triggered by the **combination** of:
1. D1 binding with `remote = true`
2. Other bindings (R2, IMAGES) present in the config
3. `.dev.vars` file with secrets

If you only have the D1 binding (no R2/IMAGES), the error does NOT occur.

## Notes

- `wrangler d1 execute --remote` works correctly
- The issue is specific to `getPlatformProxy` with this binding combination
- This may be related to [workers-sdk#8087](https://github.com/cloudflare/workers-sdk/issues/8087) and [workers-sdk#11106](https://github.com/cloudflare/workers-sdk/issues/11106)
