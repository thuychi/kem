// using password-hash (https://www.npmjs.com/package/password-hash);
var hash = require('kem/lib/hash');

// generate code
var password = hash.generate('strong-password');

// verify password
hash.verify('strong-password', hashedPassword);

var md5 = hash.md5('text');
var sha1 = hash.sha1('text');