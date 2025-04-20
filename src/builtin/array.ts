import { Tags } from "../codec.ts";
import { LengthTransformer } from "../tagless/length.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for arrays */
export const ArrayTransformer: Transformer<unknown[]> = registerTransformer<
    unknown[]
>(Tags.Array, {
    isApplicable: (value) => Array.isArray(value),
    serialize: (encoder, array) => {
        // Write the length of the array
        encoder.chain(LengthTransformer, array.length);

        // Write each item in the array
        for (const item of array) {
            encoder.serialize(item);
        }
    },
    deserialize: (decoder) => {
        const length = decoder.chain(LengthTransformer);
        const array = new Array(length);

        // Read each item in the array
        for (let i = 0; i < length; i++) {
            array.push(decoder.deserialize());
        }

        return array;
    },
});
