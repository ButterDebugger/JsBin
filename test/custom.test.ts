import { assertEquals } from "jsr:@std/assert";
import {
    decode,
    encode,
    NumberTransformer,
    registerTransformer,
} from "../src/index.ts";

class Vector2d {
    constructor(public x: number, public y: number) {}
}

registerTransformer<Vector2d>(137, {
    isApplicable: (value) => value instanceof Vector2d,
    serialize: (encoder, vector) => {
        encoder.chain(NumberTransformer, vector.x);
        encoder.chain(NumberTransformer, vector.y);
    },
    deserialize: (decoder) => {
        const x = decoder.chain(NumberTransformer);
        const y = decoder.chain(NumberTransformer);

        return new Vector2d(x, y);
    },
});

Deno.test("custom transformer", () => {
    const value = new Vector2d(1, 2);

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});
