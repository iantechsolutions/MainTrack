function _arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0); // ??? no debería pasar nunca que bytes[i] sea undef
  }
  return window.btoa(binary);
}

export const fileBase64 = async (file: File): Promise<string> => {
  return _arrayBufferToBase64(await file.arrayBuffer());
};
