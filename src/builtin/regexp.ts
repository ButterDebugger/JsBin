import { Tags } from "../codec.ts";
import { StringTransformer } from "./string.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for RegExp */
export const RegExpTransformer: Transformer<RegExp> = registerTransformer<
    RegExp
>(Tags.RegExp, {
    isApplicable: (value) => value instanceof RegExp,
    serialize: (encoder, regex) => {
        encoder.chain(StringTransformer, regex.source);
        encoder.chain(StringTransformer, regex.flags);
    },
    deserialize: (decoder) => {
        return new RegExp(
            decoder.chain(StringTransformer),
            decoder.chain(StringTransformer),
        );
    },
});
