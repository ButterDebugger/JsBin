import { assertEquals } from "jsr:@std/assert";
import { decode, encode } from "../src/index.ts";

Deno.test("urls", () => {
	const urls = [
		"ws://localhost:4030/",
		"https://example.com:0/path/?query=string#hash",
		"ftp://username:password@ftp.domain.ext/folder/",
		"ftp://username@ftp.domain.ext/",
		"ftp://:password@ftp.domain.ext/",
		"wss://apple.com/",
		"https://example.com/",
		"http://example.org:8080/"
	];

	const result = decode(encode(urls));

	assertEquals(result, urls, "Decoding does not match the original value.");
});
