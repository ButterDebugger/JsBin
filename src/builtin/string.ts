import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";
import { VarintTransformer } from "../tagless/varint.ts";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

// String content buffer cache for small strings
const STRING_CACHE_SIZE = 64;
const stringCache: Record<string, Uint8Array> = {};
let cacheEntries = 0;

/** Transformer for strings */
export const StringTransformer: Transformer<string> = registerTransformer<
    string
>(Tags.String, {
    isApplicable: (value) => typeof value === "string",
    serialize: (encoder, string) => {
        // Use cache for small, frequently used strings
        if (string.length < STRING_CACHE_SIZE) {
            let encoded = stringCache[string];
            if (!encoded) {
                encoded = textEncoder.encode(string);
                if (cacheEntries < 100) {
                    stringCache[string] = encoded;
                    cacheEntries++;
                }
            }
            encoder.chain(VarintTransformer, encoded.length);
            encoder.write(encoded);
            return;
        }

        const text = textEncoder.encode(string);
        encoder.chain(VarintTransformer, text.length);
        encoder.write(text);
    },
    deserialize: (decoder) => {
        const length = decoder.chain(VarintTransformer);
        if (length === 0) return "";
        return textDecoder.decode(decoder.read(length));
    },
});
