const path = require( 'path' );
const fs = require( 'fs' );

function getNodeJavaPath() {
	// check node-java version if it's installed alongside
	const nodeJavaPath = path.join( __dirname, '..', 'java' );
	const pkgJson = path.join( nodeJavaPath, 'package.json' );
	if ( fs.existsSync( pkgJson ) ) {
		return nodeJavaPath
	}
	return '';
}

module.exports = getNodeJavaPath;
