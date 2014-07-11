var fs = require('fs');

exports.compareOutput = function (test) {
	test.expect(1);

	var input = fs.readFileSync('tmp/index.html', { encoding: 'utf8' });
	var expected = fs.readFileSync('test/expected/index.html', { encoding: 'utf8' });

  console.log(input);
  console.log(expected);
	test.equal(input, expected, "Output doesn't match expected output.");
	test.done();
};
