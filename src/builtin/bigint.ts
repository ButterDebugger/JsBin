import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** MSB flag to indicate that more bytes follow */
const CONTINUATION_FLAG = 0x80n;
/** Mask to extract 7 data bits from a byte */
const VALUE_MASK = 0x7fn;
/** Number of bits stored per byte */
const BITS_PER_BYTE = 7n;
/** Minimum value requiring continuation */
const CONTINUATION_THRESHOLD = 1n << BITS_PER_BYTE;

/**
 * Transformer for BigInt, uses variable-length quantity and zigzag encoding
 * to support positive and negative numbers
 *
 * @see https://en.wikipedia.org/wiki/Variable-length_quantity#Zigzag_encoding
 */
export const BigIntTransformer: Transformer<bigint> = registerTransformer<
    bigint
>(Tags.BigInt, {
    isApplicable: (value) => typeof value === "bigint",
    serialize: (encoder, bigint) => {
        const isNegative = bigint < 0n;
        let magnitude = isNegative ? -bigint - 1n : bigint;

        // Shift the magnitude to the left by 1 bit and add the sign bit to the LSB
        magnitude = (magnitude << 1n) | (isNegative ? 1n : 0n);

        // Write the data bits with the continuation flag
        while (magnitude >= CONTINUATION_THRESHOLD) {
            const byte = (magnitude & VALUE_MASK) | CONTINUATION_FLAG;
            encoder.writeByte(Number(byte));
            magnitude >>= BITS_PER_BYTE;
        }

        // Write the final byte without the continuation flag
        encoder.writeByte(Number(magnitude));
    },
    deserialize: (decoder) => {
        let result = 0n;
        let shift = 0n;
        let byte: bigint;

        // Read until a byte without the continuation flag is found
        do {
            byte = BigInt(decoder.readByte());
            result |= (byte & VALUE_MASK) << shift;
            shift += BITS_PER_BYTE;
        } while (byte & CONTINUATION_FLAG);

        // Check if the number is negative and remove the sign bit
        const isNegative = (result & 1n) === 1n;
        result >>= 1n;

        // Return the number with the correct sign
        return isNegative ? -result - 1n : result;
    },
});
