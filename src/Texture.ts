type Params = {
	channels?: string;
	type?: number;
};

export default class Texture {
	private channels: number;
	private type: number;
	private chancount: number;
	public target: number;
	public handle: WebGLTexture | null;
	private width: number;
	private height: number;

	constructor(private gl: WebGL2RenderingContext, params: Params | null) {
		if (params == null) {
			params = {};
		}

		let _ref = params.channels;
		let _ref1 = params.type;
		this.channels = this.gl[
			(_ref != null
				? _ref
				: "rgba"
			).toUpperCase() as keyof WebGL2RenderingContextBase
		] as number;

		if (typeof params.type === "number") {
			this.type = params.type;
		} else {
			this.type = this.gl[
				(_ref1 != null
					? `${_ref1}`
					: "unsigned_byte"
				).toUpperCase() as keyof WebGL2RenderingContextBase
			] as number;
		}

		switch (this.channels) {
			case this.gl.RGBA:
				this.chancount = 4;
				break;
			case this.gl.RGB:
				this.chancount = 3;
				break;
			case this.gl.LUMINANCE_ALPHA:
				this.chancount = 2;
				break;
			default:
				this.chancount = 1;
		}

		this.target = this.gl.TEXTURE_2D;
		this.handle = this.gl.createTexture();
		this.width = 0;
		this.height = 0;
	}

	destroy() {
		return this.gl.deleteTexture(this.handle);
	}

	bind(unit: string | number) {
		if (unit == null || typeof unit !== "number") {
			unit = 0;
		}
		if (unit > 15) {
			throw "Texture unit too large: " + unit;
		}
		this.gl.activeTexture(this.gl.TEXTURE0 + unit);
		this.gl.bindTexture(this.target, this.handle);
		return this;
	}

	setSize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.gl.texImage2D(
			this.target,
			0,
			this.channels,
			this.width,
			this.height,
			0,
			this.channels,
			this.type,
			null
		);
		return this;
	}

	upload(data: TexImageSource) {
		this.width = data.width;
		this.height = data.height;
		this.gl.texImage2D(
			this.target,
			0,
			this.channels,
			this.channels,
			this.type,
			data
		);
		return this;
	}

	linear() {
		this.gl.texParameteri(
			this.target,
			this.gl.TEXTURE_MAG_FILTER,
			this.gl.LINEAR
		);
		this.gl.texParameteri(
			this.target,
			this.gl.TEXTURE_MIN_FILTER,
			this.gl.LINEAR
		);
		return this;
	}

	nearest() {
		this.gl.texParameteri(
			this.target,
			this.gl.TEXTURE_MAG_FILTER,
			this.gl.NEAREST
		);
		this.gl.texParameteri(
			this.target,
			this.gl.TEXTURE_MIN_FILTER,
			this.gl.NEAREST
		);
		return this;
	}

	clampToEdge() {
		this.gl.texParameteri(
			this.target,
			this.gl.TEXTURE_WRAP_S,
			this.gl.CLAMP_TO_EDGE
		);
		this.gl.texParameteri(
			this.target,
			this.gl.TEXTURE_WRAP_T,
			this.gl.CLAMP_TO_EDGE
		);
		return this;
	}

	repeat() {
		this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
		this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
		return this;
	}
}
