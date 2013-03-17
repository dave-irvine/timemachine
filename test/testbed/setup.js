/*jslint node: true */
"use strict";

var clu = require("../../lib/clu"),
	exec = require("child_process").exec,
	Q = require("q");

var create_directory = function (path) {
	return clu.exec(".", "mkdir", [path]).then(function (stdout) { console.log(stdout); });
};

var create_git_repo = function (path, bare) {
	if (!bare) { bare = false; }

	var args = clu.convertOptionsToArgv({
		"bare": bare
	});

	return clu.exec(".", "git init", [args, path]).then(function (stdout) { console.log(stdout); });
};

var sequence = [
	function () { return create_git_repo("test/testbed/fixtures/simple"); },
	function () { return create_git_repo("test/testbed/fixtures/bare", true); }
];

var result = Q.resolve(create_directory("test/testbed/fixtures"));

sequence.forEach(function (f) {
	result = result.then(f);
});
