import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for null */
export const NullTransformer: Transformer<null> = registerTransformer<null>(
    Tags.null,
    {
        isApplicable: (value) => value === null,
        serialize: () => {},
        deserialize: () => {
            return null;
        },
    },
);
