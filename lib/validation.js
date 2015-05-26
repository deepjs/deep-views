/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep) {
	deep.ui = deep.ui || {};
	deep.ui.form = deep.ui.form ||  {};

	var defaultInputHandler = function(input, errors) {
		if (errors && errors.length)
			deep.$(input).addClass("error");
		else
			deep.$(input).removeClass("error");
	};

	deep.ui.form.validate = function(selector, map, schema, inputHandler) {
		var obj = {},
			map2 = deep.utils.copy(map);
		for (var i in map2) {
			var input = map2[i] = deep.$(selector).find(map2[i]),
				val = deep.$(input).val();
			deep.utils.toPath(obj, i, val, ".");
		}
		var report = deep.validate(obj, schema);
		if (!report.valid) {
			report.inputs = [];
			for (var i in map2) {
				var errors = deep.utils.fromPath(report.errorsMap, i + ".errors", ".");

				if (inputHandler !== undefined)
					inputHandler(map2[i], errors);
				else
					defaultInputHandler(map2[i], errors);
				report.inputs.push({
					input: map2[i],
					errors: errors
				});
			}
			return deep.errors.PreconditionFail("composer.dom.validate", report);
		}
		for (var i in map2)
			$(map2[i]).removeClass("error");
		return obj;
	};

	deep.ui.editInPlace = function(selector, resource, editHandler) {

	};

	return deep.ui.form;
});