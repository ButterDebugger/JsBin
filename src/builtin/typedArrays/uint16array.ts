import { Tags } from "../../codec.ts";
import { VarintTransformer } from "../../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../../transformer.ts";

// Pre-allocate a 2-byte buffer and a data view for number serialization
const numBuffer = new ArrayBuffer(2);
const numView = new DataView(numBuffer);
const numUint8Array = new Uint8Array(numBuffer);

/** Transformer for Uint16Arrays */
export const Uint16ArrayTransformer: Transformer<Uint16Array> =
	registerTransformer<Uint16Array>(Tags.Uint16Array, {
		isApplicable: (value) => value instanceof Uint16Array,
		serialize: (encoder, array) => {
			// Write the length of the array
			encoder.chain(VarintTransformer, array.length);

			// Write each 16-bit number
			for (const num of array) {
				numView.setUint16(0, num, true);
				encoder.write(numUint8Array);
			}
		},
		deserialize: (decoder) => {
			const length = decoder.chain(VarintTransformer);
			const array = new Uint16Array(length);

			// Read each 16-bit number and add it into the array
			for (let i = 0; i < length; i++) {
				const bytes = decoder.read(2);
				const view = new DataView(
					bytes.buffer,
					bytes.byteOffset,
					bytes.byteLength
				);
				array[i] = view.getUint16(0, true);
			}

			return array;
		}
	});
