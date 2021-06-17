/**
 * Takes a String and writes it into an array as UTF8 encoded bytes.
 * @private
 */
function stringToUTF8(
  input: string,
  output: Uint8Array,
  start: number,
): Uint8Array {
  let pos = start
  for (let i = 0; i < input.length; i++) {
    let charCode = input.charCodeAt(i)

    // Check for a surrogate pair.
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      const lowCharCode = input.charCodeAt(++i)
      if (isNaN(lowCharCode)) {
        throw new Error(
          `AMQJS0017E Malformed Unicode string: ${charCode} ${lowCharCode}.`,
        )
      }

      charCode = ((charCode - 0xd800) << 10) + (lowCharCode - 0xdc00) + 0x10000
    }

    if (charCode <= 0x7f) {
      output[pos++] = charCode
    } else if (charCode <= 0x7ff) {
      output[pos++] = ((charCode >> 6) & 0x1f) | 0xc0
      output[pos++] = (charCode & 0x3f) | 0x80
    } else if (charCode <= 0xffff) {
      output[pos++] = ((charCode >> 12) & 0x0f) | 0xe0
      output[pos++] = ((charCode >> 6) & 0x3f) | 0x80
      output[pos++] = (charCode & 0x3f) | 0x80
    } else {
      output[pos++] = ((charCode >> 18) & 0x07) | 0xf0
      output[pos++] = ((charCode >> 12) & 0x3f) | 0x80
      output[pos++] = ((charCode >> 6) & 0x3f) | 0x80
      output[pos++] = (charCode & 0x3f) | 0x80
    }
  }

  return output
}

/**
 * Takes a String and calculates its length in bytes when encoded in UTF8.
 * @private
 */
function lengthOfUTF8(input: string): number {
  let output = 0
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i)
    if (charCode > 0x7ff) {
      // Surrogate pair means its a 4 byte character
      if (charCode >= 0xd800 && charCode <= 0xdbff) {
        i++
        output++
      }
      output += 3
    } else if (charCode > 0x7f) {
      output += 2
    } else {
      output++
    }
  }

  return output
}

class TextEncoder {
  encode(str: string): Uint8Array {
    return stringToUTF8(str, new Uint8Array(lengthOfUTF8(str)), 0)
  }
}

export default TextEncoder
