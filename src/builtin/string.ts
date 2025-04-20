import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";
import { VarintTransformer } from "../tagless/varint.ts";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

/** Transformer for strings */
export const StringTransformer: Transformer<string> = registerTransformer<
    string
>(Tags.String, {
    isApplicable: (value) => typeof value === "string",
    serialize: (encoder, string) => {
        const text = textEncoder.encode(string);

        encoder.chain(VarintTransformer, text.length);
        encoder.write(text);
    },
    deserialize: (decoder) => {
        const length = decoder.chain(VarintTransformer);
        return textDecoder.decode(decoder.read(length));
    },
});
