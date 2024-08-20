export const parseBoolean = (value) => {
	if (typeof value === 'string') {
		value = value.toLowerCase();
	}
	if (value === true || value === 'true') {
		return true;
	} else if (value === false || value === 'false') {
		return false;
	} else {
		console.warn(
			`parseBoolean received an unexpected value: "${value}". Defaulting to false.`
		);
		return false;
	}
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VCb29sZWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvdXRpbHMvcGFyc2VCb29sZWFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxDQUFDLEtBQW1DLEVBQVcsRUFBRTtJQUM1RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQy9CLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDeEMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO1NBQU0sSUFBSSxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxPQUFPLEVBQUUsQ0FBQztRQUNqRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7U0FBTSxDQUFDO1FBQ1AsT0FBTyxDQUFDLElBQUksQ0FDWCwrQ0FBK0MsS0FBSyx5QkFBeUIsQ0FDN0UsQ0FBQztRQUVGLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBwYXJzZUJvb2xlYW4gPSAodmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQpOiBib29sZWFuID0+IHtcblx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcblx0XHR2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG5cdH1cblxuXHRpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09ICd0cnVlJykge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2UgaWYgKHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRgcGFyc2VCb29sZWFuIHJlY2VpdmVkIGFuIHVuZXhwZWN0ZWQgdmFsdWU6IFwiJHt2YWx1ZX1cIi4gRGVmYXVsdGluZyB0byBmYWxzZS5gXG5cdFx0KTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbiJdfQ==
