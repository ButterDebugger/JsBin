import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for arrays */
export const ArrayTransformer: Transformer<unknown[]> = registerTransformer<
    unknown[]
>(Tags.Array, {
    isApplicable: (value) => Array.isArray(value),
    serialize: (encoder, array) => {
        for (let i = 0; i < array.length; i++) {
            if (i % 0xff === 0) {
                encoder.write(
                    new Uint8Array([Math.min(array.length - i, 0xff)]),
                );
            }
            encoder.serialize(array[i]);
        }
        encoder.writeByte(Tags.End); // End of array marker
    },
    deserialize: (decoder) => {
        const array = [];
        let itemsLeft = 0;
        while (true) {
            if (itemsLeft === 0) {
                const extension = decoder.readByte();
                if (extension === 0) break;
                itemsLeft += extension;
            }
            array.push(decoder.deserialize());
            itemsLeft--;
        }
        return array;
    },
});
