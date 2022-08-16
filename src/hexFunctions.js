export const fromHex = (hex) => Buffer.from(hex, "hex");
export const toHex = (bytes) => Buffer.from(bytes).toString("hex");
export const toByteArray = (name) => Buffer.from(name, "utf8");