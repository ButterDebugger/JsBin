import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";
import { LengthTransformer } from "../tagless/length.ts";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

/** Transformer for strings */
export const StringTransformer: Transformer<string> = registerTransformer<
    string
>(Tags.String, {
    isApplicable: (value) => typeof value === "string",
    serialize: (encoder, string) => {
        const text = textEncoder.encode(string);

        encoder.chain(LengthTransformer, text.length);
        encoder.write(text);
    },
    deserialize: (decoder) => {
        const length = decoder.chain(LengthTransformer);
        return textDecoder.decode(decoder.read(length));
    },
});
