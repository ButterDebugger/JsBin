import type { Transformer } from "../transformer.ts";

/** MSB flag to indicate that more bytes follow */
const CONTINUATION_FLAG = 0x80;
/** Mask to extract 7 data bits from a byte */
const VALUE_MASK = 0x7f;
/** Number of bits stored per byte */
const BITS_PER_BYTE = 7;
/** Minimum value requiring continuation */
const CONTINUATION_THRESHOLD = 1 << BITS_PER_BYTE;

/**
 * Transformer for integers using a variable-length quantity encoding
 *
 * Only supports unsigned integers
 * @see https://en.wikipedia.org/wiki/Variable-length_quantity
 */
export const LengthTransformer: Transformer<number> = {
    isApplicable: (value) => typeof value === "number",
    serialize: (encoder, num) => {
        let length = num;

        // Write the data bits with the continuation flag
        while (length >= CONTINUATION_THRESHOLD) {
            const byte = (length & VALUE_MASK) | CONTINUATION_FLAG;
            encoder.writeByte(byte);
            length >>>= BITS_PER_BYTE;
        }

        // Write the final byte without the continuation flag
        encoder.writeByte(length);
    },
    deserialize: (decoder) => {
        let result = 0;
        let shift = 0;
        let byte: number;

        // Read until a byte without the continuation flag is found
        do {
            byte = decoder.readByte();
            result |= (byte & VALUE_MASK) << shift;
            shift += BITS_PER_BYTE;
        } while (byte & CONTINUATION_FLAG);

        return result;
    },
};
