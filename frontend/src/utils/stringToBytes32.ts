export function stringToBytes32(value: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);

  const bytes32 = new Uint8Array(32);

  bytes32.set(bytes.slice(0, 32));

  const hexString = Array.from(bytes32)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hexString}`;
}
