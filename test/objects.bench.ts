import { decode, encode } from "../src/index.ts";

const obj = {
	a: {
		b: {
			c: {
				d: {
					e: {
						f: {
							g: {
								h: "i"
							}
						}
					}
				}
			}
		},
		c: {
			d: {
				e: {
					f: {
						g: {
							h: "i"
						}
					}
				}
			}
		},
		d: {
			e: {
				f: {
					g: {
						h: "i"
					}
				}
			}
		},
		e: {
			f: {
				g: {
					h: "i"
				}
			}
		},
		f: {
			g: {
				h: "i"
			}
		},
		g: {
			h: "i"
		},
		h: "i"
	},
	b: {
		c: {
			d: {
				e: {
					f: {
						g: {
							h: "i"
						}
					}
				}
			}
		},
		d: {
			e: {
				f: {
					g: {
						h: "i"
					}
				}
			}
		},
		e: {
			f: {
				g: {
					h: "i"
				}
			}
		},
		f: {
			g: {
				h: "i"
			}
		},
		g: {
			h: "i"
		},
		h: "i"
	},
	c: {
		d: {
			e: {
				f: {
					g: {
						h: "i"
					}
				}
			}
		},
		e: {
			f: {
				g: {
					h: "i"
				}
			}
		},
		f: {
			g: {
				h: "i"
			}
		},
		g: {
			h: "i"
		},
		h: "i"
	},
	d: {
		e: {
			f: {
				g: {
					h: "i"
				}
			}
		},
		f: {
			g: {
				h: "i"
			}
		},
		g: {
			h: "i"
		},
		h: "i"
	},
	e: {
		f: {
			g: {
				h: "i"
			}
		},
		g: {
			h: "i"
		},
		h: "i"
	},
	f: {
		g: {
			h: "i"
		},
		h: "i"
	},
	g: {
		h: "i"
	},
	h: "i"
};

Deno.bench({
	name: "TruffleByte encode",
	group: "Nested Objects",
	fn(): void {
		encode(obj);
	}
});

const encoded = encode(obj);

Deno.bench({
	name: "TruffleByte decode",
	group: "Nested Objects",
	fn(): void {
		decode(encoded);
	}
});
