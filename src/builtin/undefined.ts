import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for undefined */
export const UndefinedTransformer: Transformer<undefined> = registerTransformer<
    undefined
>(Tags.undefined, {
    isApplicable: (value) => typeof value === "undefined",
    serialize: () => {},
    deserialize: () => {
        return undefined;
    },
});
