import { Tags } from "../../codec.ts";
import { VarintTransformer } from "../../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../../transformer.ts";

/** Transformer for Int8Arrays */
export const Int8ArrayTransformer: Transformer<Int8Array> = registerTransformer<
    Int8Array
>(Tags.Int8Array, {
    isApplicable: (value) => value instanceof Int8Array,
    serialize: (encoder, array) => {
        // Write the length of the array
        encoder.chain(VarintTransformer, array.length);

        // Write each 8-bit number into the array
        for (const byte of array) {
            encoder.writeByte(byte);
        }
    },
    deserialize: (decoder) => {
        const length = decoder.chain(VarintTransformer);
        const array = new Int8Array(length);

        // Read each 8-bit number and add it into the array
        for (let i = 0; i < length; i++) {
            array[i] = decoder.readByte();
        }

        return array;
    },
});
