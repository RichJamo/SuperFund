export function stringToBytes32(value: string): `0x${string}` {
  // Convert the string to a byte array
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);

  // Create a new Uint8Array with a length of 32 bytes
  const bytes32 = new Uint8Array(32);

  // Copy the bytes into the 32-byte array (fits into bytes32)
  bytes32.set(bytes.slice(0, 32));

  // Convert the Uint8Array to a hexadecimal string
  const hexString = Array.from(bytes32)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  // Return the hexadecimal string with 0x prefix
  return `0x${hexString}`;
}
