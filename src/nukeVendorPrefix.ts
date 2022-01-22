export default function nukeVendorPrefix() {
	if (window.WebGLRenderingContext != null) {
		const vendors = ["WEBKIT", "MOZ", "MS", "O"];
		const vendorRe = /^WEBKIT_(.*)|MOZ_(.*)|MS_(.*)|O_(.*)/;

		const getExtension = WebGLRenderingContext.prototype.getExtension;

		WebGLRenderingContext.prototype.getExtension = function (name) {
			const match = name.match(vendorRe);
			if (match !== null) {
				name = match[1];
			}

			let extobj = getExtension.call(this, name);
			let vendor;
			if (extobj === null) {
				for (let _i = 0, _len = vendors.length; _i < _len; _i++) {
					vendor = vendors[_i];
					extobj = getExtension.call(this, vendor + "_" + name);
					if (extobj !== null) {
						return extobj;
					}
				}
				return null;
			} else {
				return extobj;
			}
		};

		const getSupportedExtensions =
			WebGLRenderingContext.prototype.getSupportedExtensions;

		return (WebGLRenderingContext.prototype.getSupportedExtensions =
			function () {
				const supported = getSupportedExtensions.call(this);
				const result = [];
				if (supported) {
					let match, extension;
					for (let _i = 0, _len = supported.length; _i < _len; _i++) {
						extension = supported[_i];
						match = extension.match(vendorRe);

						if (match !== null) {
							extension = match[1];
						}
						if (result.indexOf(extension) < 0) {
							result.push(extension);
						}
					}
				}
				return result;
			});
	}
}
