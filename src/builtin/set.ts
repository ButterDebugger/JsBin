import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for Sets */
export const SetTransformer: Transformer<Set<unknown>> = registerTransformer<
    Set<unknown>
>(Tags.Set, {
    isApplicable: (value) => value instanceof Set,
    serialize: (encoder, set) => {
        const setIter = set.values();

        for (let i = 0; i < set.size; i++) {
            const value = setIter.next().value;

            if (i % 0xff === 0) {
                encoder.write(new Uint8Array([Math.min(set.size - i, 0xff)]));
            }

            encoder.serialize(value);
        }

        encoder.write(new Uint8Array([Tags.End])); // End of object marker
    },
    deserialize: (decoder) => {
        const set = new Set();
        let itemsLeft = 0;

        while (true) {
            if (itemsLeft === 0) {
                const extension = decoder.read(1)[0];
                if (extension === 0) break;

                itemsLeft += extension;
            }

            const value = decoder.deserialize();

            set.add(value);

            itemsLeft--;
        }

        return set;
    },
});
