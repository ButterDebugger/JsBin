import { Tags } from "../../codec.ts";
import { VarintTransformer } from "../../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../../transformer.ts";

// Pre-allocate a 4-byte buffer and a data view for number serialization
const numBuffer = new ArrayBuffer(4);
const numView = new DataView(numBuffer);
const numUint8Array = new Uint8Array(numBuffer);

/** Transformer for Float32Arrays */
export const Float32ArrayTransformer: Transformer<Float32Array> =
	registerTransformer<Float32Array>(Tags.Float32Array, {
		isApplicable: (value) => value instanceof Float32Array,
		serialize: (encoder, array) => {
			// Write the length of the array
			encoder.chain(VarintTransformer, array.length);

			// Write each 32-bit number
			for (const num of array) {
				numView.setFloat32(0, num, true);
				encoder.write(numUint8Array);
			}
		},
		deserialize: (decoder) => {
			const length = decoder.chain(VarintTransformer);
			const array = new Float32Array(length);

			// Read each 32-bit number and add it into the array
			for (let i = 0; i < length; i++) {
				const bytes = decoder.read(4);
				const view = new DataView(
					bytes.buffer,
					bytes.byteOffset,
					bytes.byteLength
				);
				array[i] = view.getFloat32(0, true);
			}

			return array;
		}
	});
