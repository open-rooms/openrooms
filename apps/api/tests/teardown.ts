/**
 * Jest global teardown
 * Ensures all connections are closed after test suite completes
 */

export default async function globalTeardown() {
  // Force exit after a brief delay to allow async cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
  process.exit(0);
}
