var exec = require('child_process').exec,
	Q = require("q"),
	CLU = {};

CLU.convertOptionsToArgv = function (options, argv) {
	var key,
		val;

	for (key in options) {
		val = options[key];
		if (key.length === 1) {
			if (val === true) {
				argv.push("-" + key);
			} else if (val === false) {} else {
				argv.push("-" + key);
				argv.push(val);
			}
		} else {
			if (val === true) {
				argv.push("--" + key);
			} else if (val === false) {} else {
				argv.push("--" + key + "=" + val);
			}
		}
	}
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
			argValue = dashRegexMatches[3];
		}
		
		if (dashCount === 1) {
			if (!argName) { argName = argValue; }

			options[argName] = true;
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

	bash = bin + " " + args.join(" ");

	exec(bash, {
		cwd: workdir,
		maxBuffer: 500*1024
	}, function (error, stdout, stderr) {
		if (error) {
			console.log(error);
			deferred.reject(error);
		} else {
			console.log(stdout);
			deferred.resolve(stdout);
		}
	});

	return deferred.promise;
};

module.exports = CLU;