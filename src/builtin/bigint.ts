import { Tags } from "../codec.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

/** Transformer for BigInt */
export const BigIntTransformer: Transformer<bigint> = registerTransformer<
    bigint
>(Tags.BigInt, {
    isApplicable: (value) => typeof value === "bigint",
    serialize: (encoder, bigint) => {
        encoder.write(new Uint8Array([bigint < 0 ? 1 : 0]));
        let nonNegativeBigint = bigint < 0 ? -bigint : bigint;

        if (nonNegativeBigint === 0n) {
            encoder.write(new Uint8Array([0]));
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

        encoder.write(new Uint8Array([payload.length]));
        encoder.write(new Uint8Array(payload));
    },
    deserialize: (decoder) => {
        let bigint = 0n;
        const sign = decoder.read(1)[0] === 1;
        const payloadLength = decoder.read(1)[0];

        for (let i = 0; i < payloadLength; i++) {
            bigint += BigInt(decoder.read(1)[0]) *
                256n ** BigInt(payloadLength - i - 1);
        }

        bigint = sign ? -bigint : bigint;

        return bigint;
    },
});
