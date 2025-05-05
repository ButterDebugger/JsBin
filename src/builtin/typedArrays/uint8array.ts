import { Tags } from "../../codec.ts";
import { VarintTransformer } from "../../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../../transformer.ts";

/** Transformer for Uint8Arrays */
export const Uint8ArrayTransformer: Transformer<Uint8Array> =
    registerTransformer<Uint8Array>(Tags.Uint8Array, {
        isApplicable: (value) => value instanceof Uint8Array,
        serialize: (encoder, array) => {
            // Write the length of the array
            encoder.chain(VarintTransformer, array.length);

            // Write the whole array at once
            encoder.write(array);
        },
        deserialize: (decoder) => {
            const length = decoder.chain(VarintTransformer);

            // Read the whole array at once
            return decoder.read(length);
        },
    });
