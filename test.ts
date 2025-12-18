/**
 * Minimal reproduction for D1 remote bindings TLS hostname mismatch error
 *
 * Issue: When using getPlatformProxy with remoteBindings: true and
 * D1 binding with remote: true, a TLS certificate error occurs.
 *
 * Error message:
 *   TLS peer's certificate is not trusted; reason = Hostname mismatch
 *
 * Usage:
 *   # Test with local D1 (should work)
 *   pnpm test:local
 *
 *   # Test with remote D1 (triggers TLS error)
 *   pnpm test:remote
 */

import { getPlatformProxy } from "wrangler";

const useRemote = process.argv.includes("--remote");

console.log("=== D1 Remote Binding TLS Reproduction ===");
console.log(`Remote bindings: ${useRemote}`);
console.log("");

async function test() {
  try {
    console.log("Calling getPlatformProxy...");

    const result = await getPlatformProxy({
      configPath: "./wrangler.toml",
      remoteBindings: useRemote,
    });

    console.log("✅ getPlatformProxy succeeded!");
    console.log("Available bindings:", Object.keys(result.env));

    const d1 = (result.env as { D1?: D1Database }).D1;
    if (!d1) {
      console.log("❌ D1 binding not found");
      await result.dispose();
      return;
    }

    console.log("\n📊 Testing D1 connection...");
    const queryResult = await d1.prepare("SELECT 1 as test").first();
    console.log("Query result:", queryResult);

    if (useRemote) {
      console.log("\n✅ SUCCESS: Remote D1 connection works!");
    } else {
      console.log("\n✅ SUCCESS: Local D1 connection works!");
    }

    await result.dispose();
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Hostname mismatch")) {
        console.log("\n🐛 BUG REPRODUCED: TLS Hostname mismatch error!");
        console.log("This is the expected error when remote = true is set.");
      } else if (error.message.includes("TLS") || error.message.includes("certificate")) {
        console.log("\n🐛 TLS error detected (variant)");
      }
    }
  }
}

test();
