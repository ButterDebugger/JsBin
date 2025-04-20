import { Tags } from "../codec.ts";
import { VarintTransformer } from "../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for Sets */
export const SetTransformer: Transformer<Set<unknown>> = registerTransformer<
    Set<unknown>
>(Tags.Set, {
    isApplicable: (value) => value instanceof Set,
    serialize: (encoder, set) => {
        const setIter = set.values();

        // Write the length of the set
        encoder.chain(VarintTransformer, set.size);

        // Write each item in the set
        for (let i = 0; i < set.size; i++) {
            const value = setIter.next().value;

            encoder.serialize(value);
        }
    },
    deserialize: (decoder) => {
        const set = new Set();
        const length = decoder.chain(VarintTransformer);

        // Read each item in the set
        for (let i = 0; i < length; i++) {
            const value = decoder.deserialize();

            set.add(value);
        }

        return set;
    },
});
