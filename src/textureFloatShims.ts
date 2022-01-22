import type { SpecType, FloatExtensionProps } from "../types";

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

	createSourceCanvas();

	function checkFloatLinear(gl: WebGL2RenderingContext, sourceType: number) {
		const program = gl.createProgram();
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);

		if (!program || !vertexShader) return true;

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

	function checkTexture(gl: WebGL2RenderingContext, targetType: number) {
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
		if (gl.getError() === 0) {
			gl.deleteTexture(target);
			return true;
		} else {
			gl.deleteTexture(target);
			return false;
		}
	}

	function checkColorBuffer(gl: WebGL2RenderingContext, targetType: number) {
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
		gl.deleteTexture(target);
		gl.deleteFramebuffer(framebuffer);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		if (check === gl.FRAMEBUFFER_COMPLETE) {
			return true;
		} else {
			return false;
		}
	}

	const shimExtensions: string[] = [];
	const shimLookup: Record<string, any> = {};
	const unshimExtensions: string[] = [];

	function checkSupport() {
		let extobj: WEBGL_color_buffer_float | OES_texture_float_linear | null;
		const canvas = document.createElement("canvas");
		let gl: WebGL2RenderingContext | null = null;

		try {
			// check support for webgl2
			gl = canvas.getContext("webgl2");
		} catch (_e) {}

		if (gl != null) {
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
				extobj = gl.getExtension("WEBGL_color_buffer_float");
				if (extobj === null) {
					if (checkColorBuffer(gl, gl.FLOAT)) {
						shimExtensions.push("WEBGL_color_buffer_float");
						shimLookup.WEBGL_color_buffer_float = {
							shim: true,
							RGBA32F_EXT: 0x8814,
							RGB32F_EXT: 0x8815,
							FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
							UNSIGNED_NORMALIZED_EXT: 0x8c17,
						};
					} else {
						unshimExtensions.push("WEBGL_color_buffer_float");
					}
				} else {
					if (checkColorBuffer(gl, gl.FLOAT)) {
						shimExtensions.push("WEBGL_color_buffer_float");
					} else {
						unshimExtensions.push("WEBGL_color_buffer_float");
					}
				}

				extobj = gl.getExtension("OES_texture_float_linear");
				if (extobj === null) {
					if (checkFloatLinear(gl, gl.FLOAT)) {
						shimExtensions.push("OES_texture_float_linear");
						shimLookup["OES_texture_float_linear"] = { shim: true };
					} else {
						unshimExtensions.push("OES_texture_float_linear");
					}
				} else {
					if (checkFloatLinear(gl, gl.FLOAT)) {
						shimExtensions.push("OES_texture_float_linear");
					} else {
						unshimExtensions.push("OES_texture_float_linear");
					}
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
				extobj = gl.getExtension("EXT_color_buffer_half_float");
				if (extobj === null) {
					if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
						shimExtensions.push("EXT_color_buffer_half_float");
						shimLookup["EXT_color_buffer_half_float"] = {
							shim: true,
							RGBA16F_EXT: 0x881a,
							RGB16F_EXT: 0x881b,
							FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
							UNSIGNED_NORMALIZED_EXT: 0x8c17,
						};
					} else {
						unshimExtensions.push("EXT_color_buffer_half_float");
					}
				} else {
					if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
						shimExtensions.push("EXT_color_buffer_half_float");
					} else {
						unshimExtensions.push("EXT_color_buffer_half_float");
					}
				}

				extobj = gl.getExtension("OES_texture_half_float_linear");
				if (extobj === null) {
					if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
						shimExtensions.push("OES_texture_half_float_linear");
						return (shimLookup.OES_texture_half_float_linear = {
							shim: true,
						});
					} else {
						return unshimExtensions.push("OES_texture_half_float_linear");
					}
				} else {
					if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
						return shimExtensions.push("OES_texture_half_float_linear");
					} else {
						return unshimExtensions.push("OES_texture_half_float_linear");
					}
				}
			}
		}
	}

	const renderingContext = window.WebGL2RenderingContext;

	if (renderingContext != null) {
		checkSupport();
		const unshimLookup: Record<string, any> = {};

		let name;
		for (let _i = 0, _len = unshimExtensions.length; _i < _len; _i++) {
			name = unshimExtensions[_i];
			unshimLookup[name] = true;
		}

		const getExtension = WebGL2RenderingContext.prototype.getExtension;
		WebGL2RenderingContext.prototype.getExtension = function (name) {
			var extobj;
			extobj = shimLookup[name];
			if (extobj === void 0) {
				if (unshimLookup[name]) {
					return null;
				} else {
					return getExtension.call(this, name);
				}
			} else {
				return extobj;
			}
		};

		const getSupportedExtensions =
			WebGL2RenderingContext.prototype.getSupportedExtensions;
		WebGL2RenderingContext.prototype.getSupportedExtensions = function () {
			const supported = getSupportedExtensions.call(this);
			const result = [];
			if (supported) {
				let extension;
				for (let _j = 0, _len1 = supported.length; _j < _len1; _j++) {
					extension = supported[_j];
					if (unshimLookup[extension] === void 0) {
						result.push(extension);
					}
				}
				for (let _k = 0, _len2 = shimExtensions.length; _k < _len2; _k++) {
					extension = shimExtensions[_k];
					if (result.indexOf(extension) < 0) {
						result.push(extension);
					}
				}
			}

			return result;
		};

		return (renderingContext.prototype.getFloatExtension = function (
			spec: SpecType
		) {
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
			const halfFramebuffer = this.getExtension("EXT_color_buffer_half_float");
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
					(_ref = halfTexture != null ? halfTexture.HALF_FLOAT_OES : void 0) !=
					null
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

			for (let _j = 0, _len1 = candidates.length; _j < _len1; _j++) {
				const candidate = candidates[_j];
				let use = true;
				const _ref1 = spec.require;

				for (let _k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					const name = _ref1[_k] as keyof typeof single;
					if (candidate[name] === false) {
						use = false;
					}
				}
				if (use) {
					result.push(candidate);
				}
			}

			for (let _l = 0, _len3 = result.length; _l < _len3; _l++) {
				const candidate = result[_l];
				const _ref2 = spec.prefer;

				let _m;
				for (let i = (_m = 0), _len4 = _ref2.length; _m < _len4; i = ++_m) {
					const preference = _ref2[i] as keyof typeof single;
					const importance = Math.pow(2, spec.prefer.length - i - 1);

					if (candidate[preference]) {
						candidate.score += importance;
					}
				}
			}

			result.sort((a, b) => {
				if (a.score === b.score) {
					return 0;
				} else if (a.score < b.score) {
					return 1;
				} else {
					return -1;
				}
			});

			if (result.length === 0) {
				if (spec.throws) {
					throw (
						"No floating point texture support that is " +
						spec.require.join(", ")
					);
				} else {
					return null;
				}
			} else {
				const chosenResult = result[0];
				return {
					filterable: chosenResult.filterable,
					renderable: chosenResult.renderable,
					type: chosenResult.type,
					precision: chosenResult.precision,
					score: chosenResult.score,
				};
			}
		});
	}
}
