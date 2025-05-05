import { Tags } from "../../codec.ts";
import { VarintTransformer } from "../../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../../transformer.ts";

// Pre-allocate a 8-byte buffer and a data view for number serialization
const numBuffer = new ArrayBuffer(8);
const numView = new DataView(numBuffer);
const numUint8Array = new Uint8Array(numBuffer);

/** Transformer for Float64Arrays */
export const Float64ArrayTransformer: Transformer<Float64Array> =
	registerTransformer<Float64Array>(Tags.Float64Array, {
		isApplicable: (value) => value instanceof Float64Array,
		serialize: (encoder, array) => {
			// Write the length of the array
			encoder.chain(VarintTransformer, array.length);

			// Write each 64-bit number
			for (const num of array) {
				numView.setFloat64(0, num, true);
				encoder.write(numUint8Array);
			}
		},
		deserialize: (decoder) => {
			const length = decoder.chain(VarintTransformer);
			const array = new Float64Array(length);

			// Read each 64-bit number and add it into the array
			for (let i = 0; i < length; i++) {
				const bytes = decoder.read(8);
				const view = new DataView(
					bytes.buffer,
					bytes.byteOffset,
					bytes.byteLength
				);
				array[i] = view.getFloat64(0, true);
			}

			return array;
		}
	});
