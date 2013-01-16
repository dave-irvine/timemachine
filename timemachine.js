#!/usr/bin/env node
var options = {
	validCommitTimes: null,
	onlyForAuthor: null,
	onlyCommit: null
}, params = [];

convertArgvToOptionsAndParams(process.argv.slice(2), options, params);
function convertArgvToOptionsAndParams(argv, options, params) {
	var dashRegex = /^-+([^=]+)?=?(.+)/,
		options = options || {},
		params = params || [];

	argv.forEach(function (arg) {
		var dashCount = 0,
			dashRegexMatches = [],
			argName,
			argValue;

		if (dashRegex.test(arg)) {
			dashRegexMatches = dashRegex.exec(arg);
			dashCount = dashRegexMatches[0].split("-").length - 1;
			argName = dashRegexMatches[1];
			argValue = dashRegexMatches[2];
		}
		
		if (dashCount === 1) {
			if (!argName) { argName = argValue; }

			options[argName] = true;
		} else if (dashCount === 2) {
			if (options[argName] === undefined) {
				throw new Error("TimeMachine :: Unknown option near: " + arg);
			}
			options[argName] = argValue;
		} else {
			params.push(arg);
		}
	});
}
