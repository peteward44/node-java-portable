const path = require( 'path' );
const fs = require( 'fs' );
const getVersions = require( './getVersions.js' );

function postInstall() {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	return getVersions()
	.then( versions => {
		fs.writeFileSync( path.join( __dirname, '..', 'versions.json' ), JSON.stringify( versions, null, 2 ), 'utf8' );
	} );
}

module.exports = postInstall;
