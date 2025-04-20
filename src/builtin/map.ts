import { Tags } from "../codec.ts";
import { LengthTransformer } from "../tagless/length.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for Maps */
export const MapTransformer: Transformer<Map<unknown, unknown>> =
    registerTransformer<Map<unknown, unknown>>(Tags.Map, {
        isApplicable: (value) => value instanceof Map,
        serialize: (encoder, map) => {
            const mapIter = map.entries();

            // Write the length of the map
            encoder.chain(LengthTransformer, map.size);

            // Write each item in the map
            for (let i = 0; i < map.size; i++) {
                const next = mapIter.next();
                if (next.done) break;

                const [key, value] = next.value;

                encoder.serialize(key);
                encoder.serialize(value);
            }
        },
        deserialize: (decoder) => {
            const map = new Map();
            const length = decoder.chain(LengthTransformer);

            // Read each item in the map
            for (let i = 0; i < length; i++) {
                const key = decoder.deserialize();
                const value = decoder.deserialize();

                map.set(key, value);
            }

            return map;
        },
    });
