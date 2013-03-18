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

var create_git_commit = function (path, empty, message) {
	var deferred = Q.defer();
	if (!empty) { empty = false; }
	if (!message) { message = false; }

	var do_commit = function () {
		var opts = {
			"allow-empty": empty,
		}

		if (message) {
			opts["m"] = "'" + message + "'";
		} else {
			opts["allow-empty-message"] = true;
		}

		var args = clu.convertOptionsToArgv(opts);

		clu.exec(path, "git commit", [args]).then(
			function () {
				deferred.resolve();
			},
			function (err) {
				deferred.reject();
			}
		);
	};

	do_commit();

	return deferred.promise;
};

var sequence = [
	function () { return create_git_repo("test/testbed/fixtures/simple"); },
	function () { return create_git_repo("test/testbed/fixtures/bare", true); },
	function () { return create_git_repo("test/testbed/fixtures/withLogs"); },
	function () { return create_git_commit("test/testbed/fixtures/withLogs", true, "1st commit."); },
	function () { return create_git_commit("test/testbed/fixtures/withLogs", true, "2nd commit."); }
];

var result = Q.resolve(create_directory("test/testbed/fixtures"));

sequence.forEach(function (f) {
	result = result.then(f);
});
