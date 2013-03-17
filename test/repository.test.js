/*jslint node: true */
"use strict";

var chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
	sinonChai = require("sinon-chai"),
	Repository = require("../lib/repository"),
	expect = chai.expect,
	sinon = require("sinon"),
	Q = require("q");

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe("Repository", function () {
	var repository;

	describe("loadLog()", function () {
		it("should return a Promise", function () {
			repository = new Repository("test/testbed/fixtures/bare", true);
			var promise = repository.loadLog();

			expect(promise).to.be.an.instanceOf(Q.makePromise);
			promise.catch(function () {});
		});

		it("should reject its promise if using an empty repository", function (done) {
			repository = new Repository("test/testbed/fixtures/simple");

			var promise = repository.loadLog();

			expect(promise).to.be.rejected.with(Error).and.notify(done);
		});

		it("should not reject its promise if using a repository with at least 1 log", function (done) {
			repository = new Repository("test/testbed/fixtures/withLogs");

			var promise = repository.loadLog();

			expect(promise).to.be.fulfilled.and.notify(done);
		});

		it("should resolve its promise with an array of Commits", function (done) {
			repository = new Repository("test/testbed/fixtures/withLogs");

			var promise = repository.loadLog().then(
				function (commits) {
					expect(commits).to.be.an('array');
					done();
				}
			);
		});
	});
});