/*jslint node: true */
"use strict";

var chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
	Commit = require("../lib/commit"),
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
					expect(commits[0]).to.be.an.instanceOf(Commit);
					done();
				}
			);
		});
	});

	describe("applyCommitFilter()", function () {
		it("should filter to a single commit when passed a hash as an 'onlyCommit' filter", function (done) {
			var expectCommit;
			repository = new Repository("test/testbed/fixtures/withLogs");

			repository.loadLog().then(
				function () {
					expectCommit = repository.commits[0];

					repository.applyCommitFilter({
						onlyCommit: expectCommit.hash
					});

					expect(repository.commits).to.have.length(1);
					done();
				}
			);
		});

		it("should throw an error when passed a hash as an 'onlyCommit' filter and no commits match", function (done) {
			repository = new Repository("test/testbed/fixtures/withLogs");

			repository.loadLog().then(
				function () {
					expect(function () {
						repository.applyCommitFilter({
							onlyCommit: "abcdefg12345"
						});
					}).to.throws();

					done();
				}
			);
		});

		it("should filter multiple commits when passed multiple hashes as a 'withHashes' filter", function (done) {
			repository = new Repository("test/testbed/fixtures/withLogs");

			repository.loadLog().then(
				function () {
					var hashes = [];
					hashes.push(repository.commits[0].hash);
					hashes.push(repository.commits[1].hash);

					repository.applyCommitFilter({
						withHashes: hashes
					});

					expect(repository.commits).to.have.length(2);
					done();
				}
			);
		});


		it("should throw an error when passed multiple hashes as a 'withHashes' filter and no commits match", function (done) {
			repository = new Repository("test/testbed/fixtures/withLogs");

			repository.loadLog().then(
				function () {
					expect(function () {
						repository.applyCommitFilter({
							withHashes: ["abcd1234", "abcd5678"]
						});
					}).to.throws();

					done();
				}
			);
		});

		it("should filter to multiple commits when passed an author name as an 'onlyForAuthor' filter", function (done) {
			var expectCommit;
			repository = new Repository("test/testbed/fixtures/withLogs");

			repository.loadLog().then(
				function () {
					expectCommit = repository.commits[0];

					repository.applyCommitFilter({
						onlyForAuthor: expectCommit.author
					});

					expect(repository.commits).to.have.length(2);
					done();
				}
			);
		});

		it("should throw an error when passed an author name as an 'onlyForAuthor' filter and no commits match", function (done) {
			repository = new Repository("test/testbed/fixtures/withLogs");

			repository.loadLog().then(
				function () {
					expect(function () {
						repository.applyCommitFilter({
							onlyForAuthor: "abcdefg12345"
						});
					}).to.throws();

					done();
				}
			);
		});
	});
});