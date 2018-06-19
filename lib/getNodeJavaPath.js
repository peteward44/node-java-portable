const path = require( 'path' );
const fs = require( 'fs' );

function getNodeJavaPath() {
	// check node-java version if it's installed alongside
	try {
		const nodeJavaPath = path.dirname( require.resolve( 'java' ) );
		const pkgJson = path.join( nodeJavaPath, 'package.json' );
		if ( fs.existsSync( pkgJson ) ) {
			return nodeJavaPath;
		}
	} catch ( err ) {
	}
	return '';
}

module.exports = getNodeJavaPath;
