import { Tags } from "../codec.ts";
import { StringTransformer } from "./string.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for URLs */
export const URLTransformer: Transformer<URL> = registerTransformer<URL>(
    Tags.URL,
    {
        isApplicable: (value) => value instanceof URL,
        serialize: (encoder, url) => {
            encoder.chain(StringTransformer, url.href);
        },
        deserialize: (decoder) => {
            return new URL(decoder.chain(StringTransformer));
        },
    },
);
