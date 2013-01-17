var Commit = function(hash, author, date) {
	var commit = this;

	commit.hash = hash;
	commit.author = author;
	try {
		commit.date = new Date(date);
	} catch(e) {
		throw new Error("Commit (" + hash + ") has unparseable date: " + date);
	}
}

module.exports = Commit;