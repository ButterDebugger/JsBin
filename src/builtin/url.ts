import { Tags } from "../codec.ts";
import { StringTransformer } from "./string.ts";
import { registerTransformer, type Transformer } from "../transformer.ts";

enum UrlFlags {
	Protocol = 0b00000001,
	Username = 0b00000010,
	Password = 0b00000100,
	Hostname = 0b00001000,
	Port = 0b00010000,
	Pathname = 0b00100000,
	Search = 0b01000000,
	Hash = 0b10000000
}

/** Transformer for URLs */
export const URLTransformer: Transformer<URL> = registerTransformer<URL>(
	Tags.URL,
	{
		isApplicable: (value) => value instanceof URL,
		serialize: (encoder, url) => {
			const {
				protocol,
				username,
				password,
				hostname,
				port,
				pathname,
				search,
				hash
			} = url;

			// Add a flag for what components are present
			let has = 0b00000000;
			if (protocol) has |= UrlFlags.Protocol;
			if (username) has |= UrlFlags.Username;
			if (password) has |= UrlFlags.Password;
			if (hostname) has |= UrlFlags.Hostname;
			if (port) has |= UrlFlags.Port;
			if (pathname) has |= UrlFlags.Pathname;
			if (search) has |= UrlFlags.Search; // TODO: use SearchParams instead, along with jsbin for encoding
			if (hash) has |= UrlFlags.Hash;
			encoder.writeByte(has);

			// Encode the protocol
			if (protocol) {
				switch (protocol) {
					case "https:":
						encoder.writeByte(1);
						break;
					case "http:":
						encoder.writeByte(2);
						break;
					case "wss:":
						encoder.writeByte(3);
						break;
					case "ws:":
						encoder.writeByte(4);
						break;
					case "ftp:":
						encoder.writeByte(5);
						break;
					default: {
						encoder.writeByte(0);

						encoder.chain(
							StringTransformer,
							protocol.replace(/:$/g, "")
						);
					}
				}
			}

			// Encode the username
			if (username) encoder.chain(StringTransformer, username);

			// Encode the password
			if (password) encoder.chain(StringTransformer, password);

			// Encode the hostname
			if (hostname) encoder.chain(StringTransformer, hostname);

			// Encode the port
			if (port) {
				const int = Number(port);
				if (int > 65535 || int < 0)
					throw new Error("Port out of range");

				encoder.writeByte(int >> 8);
				encoder.writeByte(int & 0xff);
			}

			// Encode the pathname
			if (pathname) encoder.chain(StringTransformer, pathname);

			// Encode the search query
			if (search) encoder.chain(StringTransformer, search);

			// Encode the hash
			if (hash) encoder.chain(StringTransformer, hash);
		},
		deserialize: (decoder) => {
			const has = decoder.readByte();
			let url = "";

			// Decode the protocol
			if (has & UrlFlags.Protocol) {
				switch (decoder.readByte()) {
					case 1:
						url += "https://";
						break;
					case 2:
						url += "http://";
						break;
					case 3:
						url += "wss://";
						break;
					case 4:
						url += "ws://";
						break;
					case 5:
						url += "ftp://";
						break;
					default: {
						url += `${decoder.chain(StringTransformer)}://`;
					}
				}
			}

			// Decode the username
			if (has & UrlFlags.Username)
				url += decoder.chain(StringTransformer);

			// Encode the password
			if (has & UrlFlags.Password)
				url += `:${decoder.chain(StringTransformer)}`;

			// Add authentication separator
			if (has & UrlFlags.Username || has & UrlFlags.Password) url += "@";

			// Decode the hostname
			if (has & UrlFlags.Hostname)
				url += decoder.chain(StringTransformer);

			// Decode the port
			if (has & UrlFlags.Port) {
				const port = (decoder.readByte() << 8) + decoder.readByte();
				url += `:${port}`;
			}

			// Decode the pathname
			if (has & UrlFlags.Pathname)
				url += decoder.chain(StringTransformer);

			// Decode the search query
			if (has & UrlFlags.Search) url += decoder.chain(StringTransformer);

			// Decode the hash
			if (has & UrlFlags.Hash) url += decoder.chain(StringTransformer);

			return new URL(url);
		}
	}
);
