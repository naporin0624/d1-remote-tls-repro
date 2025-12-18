# D1 Remote Bindings TLS Bug Reproduction

Minimal reproduction for the TLS hostname mismatch error when using Cloudflare D1 remote bindings with `getPlatformProxy`.

## The Bug

When using:
- `wrangler.toml` with `remote = true` on a D1 binding
- `getPlatformProxy({ remoteBindings: true })`

The following error occurs:

```
TLS peer's certificate is not trusted; reason = Hostname mismatch
```

## Environment

- OS: Linux (WSL2 / Ubuntu)
- Node.js: 22.x
- wrangler: 4.55.0

## Steps to Reproduce

### Prerequisites

1. Have a Cloudflare account with a D1 database
2. Update `wrangler.toml` with your:
   - `account_id`
   - `database_id`
   - `database_name`

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

## Notes

- `wrangler d1 execute --remote` works correctly
- The issue is specific to `getPlatformProxy` with remote D1 bindings
- This may be related to [workers-sdk#8087](https://github.com/cloudflare/workers-sdk/issues/8087)
