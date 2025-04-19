import { Tags } from "../codec.ts";
import { NumberTransformer } from "./number.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for Dates */
export const DateTransformer: Transformer<Date> = registerTransformer<Date>(
    Tags.Date,
    {
        isApplicable: (value) => value instanceof Date,
        serialize: (encoder, date) => {
            encoder.chain(NumberTransformer, date.getTime());
        },
        deserialize: (decoder) => {
            return new Date(decoder.chain(NumberTransformer));
        },
    },
);
