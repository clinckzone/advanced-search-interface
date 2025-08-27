function convertStringToUTF8(buffer: NonSharedBuffer) {
  let rawData;

  // UTF-16 LE
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    rawData = buffer.toString("utf16le");
  }
  // UTF-16 BE
  else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    rawData = buffer.toString("utf16le").split("").reverse().join(""); // swap bytes
  }
  // Default to UTF-8
  else {
    rawData = buffer.toString("utf8");
  }

  return rawData;
}

export default convertStringToUTF8;
