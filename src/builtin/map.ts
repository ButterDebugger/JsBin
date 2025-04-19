import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for Maps */
export const MapTransformer: Transformer<Map<unknown, unknown>> =
    registerTransformer<Map<unknown, unknown>>(Tags.Map, {
        isApplicable: (value) => value instanceof Map,
        serialize: (encoder, map) => {
            const mapIter = map.entries();

            for (let i = 0; i < map.size; i++) {
                const next = mapIter.next();
                if (next.done) break;

                const [key, value] = next.value;

                if (i % 0xff === 0) {
                    encoder.write(
                        new Uint8Array([Math.min(map.size - i, 0xff)]),
                    );
                }

                encoder.serialize(key);
                encoder.serialize(value);
            }

            encoder.writeByte(Tags.End); // End of object marker
        },
        deserialize: (decoder) => {
            const map = new Map();
            let itemsLeft = 0;

            while (true) {
                if (itemsLeft === 0) {
                    const extension = decoder.readByte();
                    if (extension === 0) break;

                    itemsLeft += extension;
                }

                const key = decoder.deserialize();
                const value = decoder.deserialize();

                map.set(key, value);

                itemsLeft--;
            }

            return map;
        },
    });
