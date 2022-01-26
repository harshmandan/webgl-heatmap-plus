import type { SpecType, FloatExtensionProps } from "./types";

export default function textureFloatShims() {
	function createSourceCanvas() {
		const canvas = document.createElement("canvas");
		canvas.width = 2;
		canvas.height = 2;

		const ctx = canvas.getContext("2d");
		if (ctx) {
			const imageData = ctx.getImageData(0, 0, 2, 2);
			imageData.data.set(
				new Uint8ClampedArray([
					0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255,
				])
			);
			ctx.putImageData(imageData, 0, 0);
		}

		return canvas;
	}

	// createSourceCanvas();

	function checkFloatLinear(gl: WebGLRenderingContext, sourceType: number) {
		const program = gl.createProgram();
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);

		if (!program || !vertexShader) return false;

		gl.attachShader(program, vertexShader);
		gl.shaderSource(
			vertexShader,
			"attribute vec2 position;\nvoid main(){\n    gl_Position = vec4(position, 0.0, 1.0);\n}"
		);

		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			throw gl.getShaderInfoLog(vertexShader);
		}

		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

		if (fragmentShader) {
			gl.attachShader(program, fragmentShader);
			gl.shaderSource(
				fragmentShader,
				"uniform sampler2D source;\nvoid main(){\n    gl_FragColor = texture2D(source, vec2(1.0, 1.0));\n}"
			);

			gl.compileShader(fragmentShader);
			if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				throw gl.getShaderInfoLog(fragmentShader);
			}
		}

		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw gl.getProgramInfoLog(program);
		}
		gl.useProgram(program);

		const target = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, target);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			2,
			2,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			target,
			0
		);

		const sourceCanvas = createSourceCanvas();
		const source = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, source);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, sourceType, sourceCanvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		const vertices = new Float32Array([
			1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
		]);
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		const positionLoc = gl.getAttribLocation(program, "position");
		const sourceLoc = gl.getUniformLocation(program, "source");
		gl.enableVertexAttribArray(positionLoc);
		gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
		gl.uniform1i(sourceLoc, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		const readBuffer = new Uint8Array(4 * 4);
		gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, readBuffer);
		const result = Math.abs(readBuffer[0] - 127) < 10;

		// cleanup
		gl.deleteShader(fragmentShader);
		gl.deleteShader(vertexShader);
		gl.deleteProgram(program);
		gl.deleteBuffer(buffer);
		gl.deleteTexture(source);
		gl.deleteTexture(target);
		gl.deleteFramebuffer(framebuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.useProgram(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return result;
	}

	function checkTexture(gl: WebGLRenderingContext, targetType: number) {
		const target = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, target);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			2,
			2,
			0,
			gl.RGBA,
			targetType,
			null
		);

		const hasNoError = gl.getError() === gl.NO_ERROR; // gl.NO_ERROR === 0
		// cleanup
		gl.deleteTexture(target);
		return hasNoError ? true : false;
	}

	function checkColorBuffer(gl: WebGLRenderingContext, targetType: number) {
		const target = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, target);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			2,
			2,
			0,
			gl.RGBA,
			targetType,
			null
		);

		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			target,
			0
		);
		const check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

		// cleanup
		gl.deleteTexture(target);
		gl.deleteFramebuffer(framebuffer);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return check === gl.FRAMEBUFFER_COMPLETE ? true : false;
	}

	const shimExtensions: string[] = [];
	const shimLookup: Record<string, any> = {};
	const unshimExtensions: string[] = [];

	function checkSupport() {
		let extobj: WEBGL_color_buffer_float | OES_texture_float_linear | null;
		const canvas = document.createElement("canvas");
		let gl: WebGLRenderingContext | null = null;

		try {
			// check support for webgl
			gl = canvas.getContext("webgl");
		} catch (_e) {}

		if (!gl) {
			console.debug("WebGL not supported");
			return;
		}

		let singleFloatTexturing;
		const singleFloatExt = gl.getExtension("OES_texture_float");
		if (checkTexture(gl, gl.FLOAT)) {
			singleFloatTexturing = true;
			shimExtensions.push("OES_texture_float");
			if (singleFloatExt === null) {
				shimLookup["OES_texture_float"] = { shim: true };
			}
		} else {
			singleFloatTexturing = false;
			unshimExtensions.push("OES_texture_float");
		}

		if (singleFloatTexturing) {
			if (checkColorBuffer(gl, gl.FLOAT)) {
				shimExtensions.push("WEBGL_color_buffer_float");
				extobj = gl.getExtension("WEBGL_color_buffer_float");
				if (extobj === null) {
					shimLookup["WEBGL_color_buffer_float"] = {
						shim: true,
						RGBA32F_EXT: 0x8814,
						RGB32F_EXT: 0x8815,
						FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
						UNSIGNED_NORMALIZED_EXT: 0x8c17,
					};
				}
			} else {
				unshimExtensions.push("WEBGL_color_buffer_float");
			}

			if (checkFloatLinear(gl, gl.FLOAT)) {
				shimExtensions.push("OES_texture_float_linear");
				extobj = gl.getExtension("OES_texture_float_linear");
				if (extobj === null) {
					shimLookup["OES_texture_float_linear"] = { shim: true };
				}
			} else {
				unshimExtensions.push("OES_texture_float_linear");
			}
		}

		let halfFloatExt = gl.getExtension("OES_texture_half_float");
		let halfFloatTexturing;
		if (halfFloatExt === null) {
			if (checkTexture(gl, 0x8d61)) {
				halfFloatTexturing = true;
				shimExtensions.push("OES_texture_half_float");
				halfFloatExt = shimLookup["OES_texture_half_float"] = {
					HALF_FLOAT_OES: 0x8d61,
					shim: true,
				};
			} else {
				halfFloatTexturing = false;
				unshimExtensions.push("OES_texture_half_float");
			}
		} else {
			if (checkTexture(gl, halfFloatExt.HALF_FLOAT_OES)) {
				halfFloatTexturing = true;
				shimExtensions.push("OES_texture_half_float");
			} else {
				halfFloatTexturing = false;
				unshimExtensions.push("OES_texture_half_float");
			}
		}

		if (halfFloatTexturing && halfFloatExt) {
			if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
				shimExtensions.push("EXT_color_buffer_half_float");
				extobj = gl.getExtension("EXT_color_buffer_half_float");
				if (extobj === null) {
					shimLookup["EXT_color_buffer_half_float"] = {
						shim: true,
						RGBA16F_EXT: 0x881a,
						RGB16F_EXT: 0x881b,
						FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
						UNSIGNED_NORMALIZED_EXT: 0x8c17,
					};
				}
			} else {
				unshimExtensions.push("EXT_color_buffer_half_float");
			}

			if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
				const pushValue = shimExtensions.push("OES_texture_half_float_linear");
				extobj = gl.getExtension("OES_texture_half_float_linear");
				return extobj === null
					? (shimLookup.OES_texture_half_float_linear = { shim: true })
					: pushValue;
			} else {
				return unshimExtensions.push("OES_texture_half_float_linear");
			}
		}
	}

	if (window.WebGLRenderingContext != null) {
		checkSupport();

		const unshimLookup = unshimExtensions.reduce(
			(acc, cur) => ({ ...acc, [cur]: true }),
			{} as Record<string, any>
		);

		const getExtension = WebGLRenderingContext.prototype.getExtension;
		WebGLRenderingContext.prototype.getExtension = function (name) {
			const extobj = shimLookup[name];
			return extobj == null
				? unshimLookup[name]
					? null
					: getExtension.call(this, name)
				: extobj;
		};

		const getSupportedExtensions =
			WebGLRenderingContext.prototype.getSupportedExtensions;
		WebGLRenderingContext.prototype.getSupportedExtensions = function () {
			const supported = getSupportedExtensions.call(this);
			const result = [];
			if (supported) {
				for (const extension of supported) {
					if (unshimLookup[extension] == null) {
						result.push(extension);
					}
				}
				for (const extension of shimExtensions) {
					if (result.indexOf(extension) < 0) {
						result.push(extension);
					}
				}
			}

			return result;
		};

		return (window.WebGLRenderingContext.prototype.getFloatExtension =
			function (spec: SpecType) {
				if (spec.prefer == null) {
					spec.prefer = ["half"];
				}
				if (spec.require == null) {
					spec.require = [];
				}
				if (spec.throws == null) {
					spec.throws = true;
				}

				const singleTexture = this.getExtension("OES_texture_float");
				const halfTexture = this.getExtension("OES_texture_half_float");
				const singleFramebuffer = this.getExtension("WEBGL_color_buffer_float");
				const halfFramebuffer = this.getExtension(
					"EXT_color_buffer_half_float"
				);
				const singleLinear = this.getExtension("OES_texture_float_linear");
				const halfLinear = this.getExtension("OES_texture_half_float_linear");
				const single: FloatExtensionProps = {
					texture: singleTexture !== null,
					filterable: singleLinear !== null,
					renderable: singleFramebuffer !== null,
					score: 0,
					precision: "single",
					half: false,
					single: true,
					type: this.FLOAT,
				};
				let _ref;
				const half: FloatExtensionProps = {
					texture: halfTexture !== null,
					filterable: halfLinear !== null,
					renderable: halfFramebuffer !== null,
					score: 0,
					precision: "half",
					half: true,
					single: false,
					type:
						(_ref =
							halfTexture != null ? halfTexture.HALF_FLOAT_OES : void 0) != null
							? _ref
							: null,
				};
				const candidates: Array<typeof single> = [];
				if (single.texture) {
					candidates.push(single);
				}
				if (half.texture) {
					candidates.push(half);
				}
				const result = [];

				for (const candidate of candidates) {
					let use = true;
					const _ref1: Array<keyof typeof single> = spec.require;

					for (const name of _ref1) {
						if (candidate[name] === false) {
							use = false;
						}
					}
					if (use) {
						result.push(candidate);
					}
				}

				for (const [j, candidate] of result.entries()) {
					const _ref2: Array<keyof typeof single> = spec.prefer;

					for (const [i, preference] of _ref2.entries()) {
						const importance = Math.pow(2, spec.prefer.length - i - 1);
						if (candidate[preference]) {
							candidate.score += importance;
							result[j] = candidate;
						}
					}
				}

				result.sort((a, b) =>
					a.score === b.score ? 0 : a.score < b.score ? 1 : -1
				);

				if (!result.length) {
					if (spec.throws) {
						throw (
							"No floating point texture support that is " +
							spec.require.join(", ")
						);
					} else {
						return null;
					}
				} else {
					const finalResult = result[0];
					return {
						filterable: finalResult.filterable,
						renderable: finalResult.renderable,
						type: finalResult.type,
						precision: finalResult.precision,
						score: finalResult.score,
					};
				}
			});
	}
}
