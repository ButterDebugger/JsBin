import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for booleans */
export const BooleanTransformer: Transformer<boolean> = registerTransformer<
    boolean
>(Tags.Boolean, {
    isApplicable: (value) => typeof value === "boolean",
    serialize: (encoder, boolean) => {
        encoder.writeByte(boolean ? 1 : 0);
    },
    deserialize: (decoder) => {
        return decoder.readByte() === 1;
    },
});
