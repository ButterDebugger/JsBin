import { Tags } from "../codec.ts";
import { VarintTransformer } from "../tagless/varint.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

enum NumberIds {
    NaN = 0,
    PositiveInfinity = 1,
    NegativeInfinity = 2,
    // Integers
    PositiveInt8 = 3,
    PositiveInt16 = 4,
    PositiveInt32 = 5,
    PositiveInt64 = 6,
    NegativeInt8 = 7,
    NegativeInt16 = 8,
    NegativeInt32 = 9,
    NegativeInt64 = 10,
    // Floats
    Float16 = 11,
    Float32 = 12,
    Float64 = 13,
}

/** Transformer for numbers */
export const NumberTransformer: Transformer<number> = registerTransformer(
    Tags.Number,
    {
        isApplicable: (value) => typeof value === "number",
        serialize: (encoder, num) => {
            // Check if the number is an integer
            if (Number.isInteger(num) && num <= Number.MAX_SAFE_INTEGER) {
                const isNegative = num < 0;
                const absNum = isNegative ? -num : num;

                if (absNum <= 0xff) {
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt8
                            : NumberIds.PositiveInt8,
                    );

                    encoder.writeByte(absNum);
                } else if (absNum <= 0xffff) {
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt16
                            : NumberIds.PositiveInt16,
                    );

                    const buffer = new ArrayBuffer(2);
                    const view = new DataView(buffer);
                    view.setUint16(0, absNum, true);
                    encoder.write(new Uint8Array(buffer));
                } else if (absNum <= 0xffffffff) {
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt32
                            : NumberIds.PositiveInt32,
                    );

                    const buffer = new ArrayBuffer(4);
                    const view = new DataView(buffer);
                    view.setUint32(0, absNum, true);
                    encoder.write(new Uint8Array(buffer));
                } else {
                    // Otherwise, the integer is under the min safe integer threshold
                    encoder.chain(
                        VarintTransformer,
                        isNegative
                            ? NumberIds.NegativeInt64
                            : NumberIds.PositiveInt64,
                    );

                    const buffer = new ArrayBuffer(8);
                    const view = new DataView(buffer);
                    view.setBigUint64(0, BigInt(absNum), true);
                    encoder.write(new Uint8Array(buffer));
                }
            } else {
                // Otherwise, the number is a float
                // Check if the float is 16-bit, 32-bit, or 64-bit
                if (Math.f16round(num) === num) {
                    // Infinities are both considered a float16, so check for them here
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
                        // Otherwise, write the number as a float16
                        encoder.chain(VarintTransformer, NumberIds.Float16);

                        const buffer = new ArrayBuffer(2);
                        const view = new DataView(buffer);
                        view.setFloat16(0, num, true);
                        encoder.write(new Uint8Array(buffer));
                    }
                } else if (Math.fround(num) === num) {
                    encoder.chain(VarintTransformer, NumberIds.Float32);

                    const buffer = new ArrayBuffer(4);
                    const view = new DataView(buffer);
                    view.setFloat32(0, num, true);
                    encoder.write(new Uint8Array(buffer));
                } else {
                    // Nan is considered a float64, so check for it here
                    if (Number.isNaN(num)) {
                        encoder.chain(VarintTransformer, NumberIds.NaN);
                    } else {
                        // Otherwise, write the number as a float64
                        encoder.chain(VarintTransformer, NumberIds.Float64);

                        const buffer = new ArrayBuffer(8);
                        const view = new DataView(buffer);
                        view.setFloat64(0, num, true);
                        encoder.write(new Uint8Array(buffer));
                    }
                }
            }
        },
        deserialize: (decoder) => {
            const tag = decoder.chain(VarintTransformer);

            switch (tag) {
                case NumberIds.NaN:
                    return Number.NaN;
                case NumberIds.PositiveInfinity:
                    return Number.POSITIVE_INFINITY;
                case NumberIds.NegativeInfinity:
                    return Number.NEGATIVE_INFINITY;
                case NumberIds.Float16: {
                    const bytes = decoder.read(2);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return view.getFloat16(0, true);
                }
                case NumberIds.Float32: {
                    const bytes = decoder.read(4);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return view.getFloat32(0, true);
                }
                case NumberIds.Float64: {
                    const bytes = decoder.read(8);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return view.getFloat64(0, true);
                }
                case NumberIds.PositiveInt8:
                    return decoder.readByte();
                case NumberIds.PositiveInt16: {
                    const bytes = decoder.read(2);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return view.getUint16(0, true);
                }
                case NumberIds.PositiveInt32: {
                    const bytes = decoder.read(4);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return view.getUint32(0, true);
                }
                case NumberIds.PositiveInt64: {
                    const bytes = decoder.read(8);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return Number(view.getBigUint64(0, true));
                }
                case NumberIds.NegativeInt8:
                    return -decoder.readByte();
                case NumberIds.NegativeInt16: {
                    const bytes = decoder.read(2);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return -view.getUint16(0, true);
                }
                case NumberIds.NegativeInt32: {
                    const bytes = decoder.read(4);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return -view.getUint32(0, true);
                }
                case NumberIds.NegativeInt64: {
                    const bytes = decoder.read(8);
                    const buffer = new Uint8Array(bytes).buffer;
                    const view = new DataView(buffer);
                    return -Number(view.getBigUint64(0, true));
                }
                default: {
                    throw new Error(`Unexpected number identifier '${tag}'.`);
                }
            }
        },
    },
);
