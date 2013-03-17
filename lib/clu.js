/*jslint node: true */
"use strict";

var exec = require('child_process').exec,
	Q = require("q"),
	CLU = {};

CLU.convertOptionsToArgv = function (options) {
	var key,
		val,
		argv = [],
		options = options || {};

	for (key in options) {
		val = options[key];
		if (key.length === 1) {
			if (val === true) {
				argv.push("-" + key);
			} else if (val !== false) {
				argv.push("-" + key);
				argv.push(val);
			}
		} else {
			if (val === true) {
				argv.push("--" + key);
			} else if (val !== false) {
				argv.push("--" + key + "=" + val);
			}
		}
	}

	return argv.join(" ");
};

CLU.convertArgvToOptionsAndParams = function (argv, options, params) {
	var dashRegex = /^(-+)([^=]+)?=?(.+)/,
		options = options || {},
		params = params || [];

	argv.forEach(function (arg) {
		var dashCount = 0,
			dashRegexMatches = [],
			argName,
			argValue;

		if (dashRegex.test(arg)) {
			dashRegexMatches = dashRegex.exec(arg);
			dashCount = dashRegexMatches[1].split("-").length - 1;
			argName = dashRegexMatches[2];
			argValue = dashRegexMatches[3].replace(/^\s+|\s+$/g, '');
		}

		if (dashCount === 1) {
			if (!argName) {
				argName = argValue;
				argValue = "";
			}

			argName = argName.replace(/^\s+|\s+$/g, '');

			if (argValue === "") {
				options[argName] = true;
			} else {
				options[argName] = argValue;
			}
		} else if (dashCount === 2) {
			if (options[argName] === undefined) {
				throw new Error("Unknown option near: " + arg);
			} else if (argValue === "=") {
				throw new Error("Empty option assignment near: " + arg);
			}

			options[argName] = argValue;
		} else {
			params.push(arg);
		}
	});
};

CLU.outputIter = function (output, callback) {
	var lines = output.split("\n"),
		line;

	while (lines.length > 0) {
		line = lines[0];

		if (line === "") {
			break;
		}

		callback(line);

		lines.shift();
	}
};

CLU.exec = function (workdir, bin, args) {
	var deferred = Q.defer(),
		bash;

	if (!workdir || !bin || !args) {
		deferred.reject();
	} else {
		bash = bin + " " + args.join(" ");

		exec(bash, {
			cwd: workdir,
			maxBuffer: 500 * 1024
		}, function (error, stdout, stderr) {
			if (error) {
				deferred.reject(error);
			} else {
				deferred.resolve(stdout);
			}
		});
	}

	return deferred.promise;
};

module.exports = CLU;