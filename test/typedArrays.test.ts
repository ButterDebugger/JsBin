import { assertEquals } from "jsr:@std/assert";
import { decode, encode } from "../src/index.ts";

Deno.test("Uint8Array", () => {
    const value = new Uint8Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Int8Array", () => {
    const value = new Int8Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i - 500;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});
