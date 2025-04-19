import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for numbers */
export const NumberTransformer: Transformer<number> = registerTransformer(
    Tags.Number,
    {
        isApplicable: (value) => typeof value === "number",
        serialize: (encoder, num) => {
            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setFloat64(0, num, true);
            encoder.write(new Uint8Array(buffer));
        },
        deserialize: (decoder) => {
            const nums = decoder.read(8);
            const buffer = new Uint8Array(nums).buffer;
            const view = new DataView(buffer);
            return view.getFloat64(0, true);
        },
    },
);
