import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for BigInt */
export const BigIntTransformer: Transformer<bigint> = registerTransformer<
    bigint
>(Tags.BigInt, {
    isApplicable: (value) => typeof value === "bigint",
    serialize: (encoder, bigint) => {
        const isNegative = bigint < 0;

        encoder.writeByte(isNegative ? 1 : 0);

        let nonNegativeBigint = isNegative ? -bigint : bigint;

        if (nonNegativeBigint === 0n) {
            encoder.writeByte(0);
            return;
        }

        const payload = [];
        while (nonNegativeBigint > 0n) {
            payload.unshift(Number(nonNegativeBigint & 255n));
            nonNegativeBigint = nonNegativeBigint / 256n;
        }

        if (payload.length > 255) {
            throw new Error("Unsupported payload length.");
        }

        encoder.writeByte(payload.length);
        encoder.write(new Uint8Array(payload));
    },
    deserialize: (decoder) => {
        let bigint = 0n;
        const sign = decoder.readByte() === 1;
        const payloadLength = decoder.readByte();

        for (let i = 0; i < payloadLength; i++) {
            bigint += BigInt(decoder.readByte()) *
                256n ** BigInt(payloadLength - i - 1);
        }

        bigint = sign ? -bigint : bigint;

        return bigint;
    },
});
