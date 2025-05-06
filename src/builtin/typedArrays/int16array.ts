import { Tags } from "../../codec.ts";
import { VarintTransformer } from "../../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../../transformer.ts";

// Pre-allocate a 2-byte buffer and a data view for number serialization
const numBuffer = new ArrayBuffer(2);
const numView = new DataView(numBuffer);
const numUint8Array = new Uint8Array(numBuffer);

/** Transformer for Int16Arrays */
export const Int16ArrayTransformer: Transformer<Int16Array> =
    registerTransformer<Int16Array>(Tags.Int16Array, {
        isApplicable: (value) => value instanceof Int16Array,
        serialize: (encoder, array) => {
            // Write the length of the array
            encoder.chain(VarintTransformer, array.length);

            // Write each 16-bit number
            for (const num of array) {
                numView.setInt16(0, num, true);
                encoder.write(numUint8Array);
            }
        },
        deserialize: (decoder) => {
            const length = decoder.chain(VarintTransformer);
            const array = new Int16Array(length);

            // Read each 16-bit number and add it into the array
            for (let i = 0; i < length; i++) {
                const bytes = decoder.read(2);
                const view = new DataView(
                    bytes.buffer,
                    bytes.byteOffset,
                    bytes.byteLength,
                );
                array[i] = view.getInt16(0, true);
            }

            return array;
        },
    });
