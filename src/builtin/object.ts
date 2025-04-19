import { Tags } from "../codec.ts";
import { StringTransformer } from "./string.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for objects */
export const ObjectTransformer: Transformer<Record<string, unknown>> =
    registerTransformer<Record<string, unknown>>(Tags.Object, {
        // @ts-ignore: It works as previously implemented; TODO: add type check for the key or value types
        isApplicable: (value) =>
            typeof value === "object" &&
            value !== null &&
            value.constructor === Object,
        serialize: (encoder, obj) => {
            const keys = Object.keys(obj);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = obj[key];

                if (i % 0xff === 0) {
                    encoder.write(
                        new Uint8Array([Math.min(keys.length - i, 0xff)]),
                    );
                }

                encoder.chain(StringTransformer, key);
                encoder.serialize(value);
            }

            encoder.write(new Uint8Array([Tags.End])); // End of object marker
        },
        deserialize: (decoder) => {
            const object: Record<string, unknown> = {};
            let itemsLeft = 0;

            while (true) {
                if (itemsLeft === 0) {
                    const extension = decoder.read(1)[0];
                    if (extension === 0) break;

                    itemsLeft += extension;
                }

                const key = decoder.chain(StringTransformer);
                const value = decoder.deserialize();

                object[key] = value;

                itemsLeft--;
            }

            return object;
        },
    });
