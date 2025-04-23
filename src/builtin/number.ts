import { Tags } from "../codec.ts";
import { UnknownNumberTypeError } from "../errors.ts";
import { VarintTransformer } from "../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";
import "core-js/es/math/f16round.js";
import "core-js/proposals/float16.js";

enum NumberIds {
    // Positive Integers
    PositiveInt8 = 0, // (1-byte) 0 to 255
    PositiveInt16 = 1, // (2-bytes) 0 to 65535
    PositiveInt32 = 2, // (4-bytes) 0 to 4294967295
    PositiveInt64 = 3, // (8-bytes) 0 to Number.MAX_SAFE_INTEGER
    // Negative integers
    NegativeInt8 = 4, // (1-byte) -256 to -1
    NegativeInt16 = 5, // (2-bytes) -65536 to -1
    NegativeInt32 = 6, // (4-bytes) -4294967296 to -1
    NegativeInt64 = 7, // (8-bytes) Number.MIN_SAFE_INTEGER - 1 to -1
    // Floats
    Float16 = 8, // (2-bytes)
    Float32 = 9, // (4-bytes)
    Float64 = 10, // (8-bytes)
    // Special numbers
    NaN = 11,
    PositiveInfinity = 12,
    NegativeInfinity = 13,
}

// Pre-allocate a 8-byte buffer and a data view for number serialization
const numBuffer = new ArrayBuffer(8);
const numView = new DataView(numBuffer);
const numUint8Array = new Uint8Array(numBuffer);

/** Transformer for numbers */
export const NumberTransformer: Transformer<number> = registerTransformer(
    Tags.Number,
    {
        isApplicable: (value) => typeof value === "number",
        serialize: (encoder, num) => {
            // Check if the number is an integer and can be encoded safely without loss of precision
            if (Number.isInteger(num) && Number.isSafeInteger(num)) {
                const isNegative = num < 0;
                const absNum = isNegative ? -num - 1 : num;

                if (num >= -256 && num <= 255) {
                    // Write the number as an 8-bit integer
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt8
                            : NumberIds.PositiveInt8,
                    );

                    encoder.writeByte(absNum);
                } else if (num >= -65536 && num <= 65535) {
                    // Write the number as a 16-bit integer
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt16
                            : NumberIds.PositiveInt16,
                    );

                    numView.setUint16(0, absNum, true);
                    encoder.write(numUint8Array.subarray(0, 2));
                } else if (num >= -4294967296 && num <= 4294967295) {
                    // Write the number as a 32-bit integer
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt32
                            : NumberIds.PositiveInt32,
                    );

                    numView.setUint32(0, absNum, true);
                    encoder.write(numUint8Array.subarray(0, 4));
                } else {
                    // Write the number as a 64-bit integer
                    // NOTE: The number is in the safe integer range, only using 53 bits of the available 64 bits
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt64
                            : NumberIds.PositiveInt64,
                    );

                    numView.setBigUint64(0, BigInt(absNum), true);
                    encoder.write(numUint8Array.subarray(0, 8));
                }
            } else {
                // Otherwise, the number is a float or a special value
                // Check if the float is 16-bit, 32-bit, or 64-bit
                if (Math.f16round(num) === num) {
                    // Infinities are both considered a 16-bit float, so we'll check for them here
                    if (num === Number.POSITIVE_INFINITY) {
                        encoder.chain(
                            VarintTransformer,
                            NumberIds.PositiveInfinity,
                        );
                    } else if (num === Number.NEGATIVE_INFINITY) {
                        encoder.chain(
                            VarintTransformer,
                            NumberIds.NegativeInfinity,
                        );
                    } else {
                        // Otherwise, write the number as a 16-bit float
                        encoder.chain(VarintTransformer, NumberIds.Float16);

                        numView.setFloat16(0, num, true);
                        encoder.write(numUint8Array.subarray(0, 2));
                    }
                } else if (Math.fround(num) === num) {
                    // Write the number as a 32-bit float
                    encoder.chain(VarintTransformer, NumberIds.Float32);

                    numView.setFloat32(0, num, true);
                    encoder.write(numUint8Array.subarray(0, 4));
                } else if (Number.isNaN(num)) {
                    // NaN is the last number type to check, so we'll check for it and write it here
                    encoder.chain(VarintTransformer, NumberIds.NaN);
                } else {
                    // Otherwise, write the number as a 64-bit float
                    encoder.chain(VarintTransformer, NumberIds.Float64);

                    numView.setFloat64(0, num, true);
                    encoder.write(numUint8Array.subarray(0, 8));
                }
            }
        },
        deserialize: (decoder) => {
            const tag = decoder.chain(VarintTransformer);

            switch (tag) {
                // Floats
                case NumberIds.Float16: {
                    const bytes = decoder.read(2);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return view.getFloat16(0, true);
                }
                case NumberIds.Float32: {
                    const bytes = decoder.read(4);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return view.getFloat32(0, true);
                }
                case NumberIds.Float64: {
                    const bytes = decoder.read(8);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return view.getFloat64(0, true);
                }
                // Positive integers
                case NumberIds.PositiveInt8:
                    return decoder.readByte();
                case NumberIds.PositiveInt16: {
                    const bytes = decoder.read(2);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return view.getUint16(0, true);
                }
                case NumberIds.PositiveInt32: {
                    const bytes = decoder.read(4);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return view.getUint32(0, true);
                }
                case NumberIds.PositiveInt64: {
                    const bytes = decoder.read(8);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );

                    return Number(view.getBigUint64(0, true));
                }
                // Negative integers
                case NumberIds.NegativeInt8:
                    return -decoder.readByte() - 1;
                case NumberIds.NegativeInt16: {
                    const bytes = decoder.read(2);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return -view.getUint16(0, true) - 1;
                }
                case NumberIds.NegativeInt32: {
                    const bytes = decoder.read(4);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return -view.getUint32(0, true) - 1;
                }
                case NumberIds.NegativeInt64: {
                    const bytes = decoder.read(8);
                    const view = new DataView(
                        bytes.buffer,
                        bytes.byteOffset,
                        bytes.byteLength,
                    );
                    return -Number(view.getBigUint64(0, true)) - 1;
                }
                // Special numbers
                case NumberIds.NaN:
                    return Number.NaN;
                case NumberIds.PositiveInfinity:
                    return Number.POSITIVE_INFINITY;
                case NumberIds.NegativeInfinity:
                    return Number.NEGATIVE_INFINITY;
                default: {
                    throw new UnknownNumberTypeError(tag);
                }
            }
        },
    },
);
