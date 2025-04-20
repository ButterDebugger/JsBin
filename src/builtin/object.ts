import { Tags } from "../codec.ts";
import { StringTransformer } from "./string.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";
import { LengthTransformer } from "../tagless/length.ts";

/** Transformer for objects */
export const ObjectTransformer: Transformer<Record<string, unknown>> =
    registerTransformer<Record<string, unknown>>(Tags.Object, {
        isApplicable: (value): value is Record<string, unknown> =>
            typeof value === "object" &&
            value !== null &&
            value.constructor === Object,
        serialize: (encoder, obj) => {
            const keys = Object.keys(obj);

            // Write the length of the object
            encoder.chain(LengthTransformer, keys.length);

            // Write each item in the object
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = obj[key];

                encoder.chain(StringTransformer, key);
                encoder.serialize(value);
            }
        },
        deserialize: (decoder) => {
            const object: Record<string, unknown> = {};
            const length = decoder.chain(LengthTransformer);

            // Read each item in the object
            for (let i = 0; i < length; i++) {
                const key = decoder.chain(StringTransformer);
                const value = decoder.deserialize();

                object[key] = value;
            }

            return object;
        },
    });
