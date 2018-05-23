const path = require( 'path' );
const fs = require( 'fs' );

function getNodeJavaPath() {
	// check node-java version if it's installed alongside
	const nodeJavaPath = path.dirname( require.resolve( 'java' ) );
	const pkgJson = path.join( nodeJavaPath, 'package.json' );
	if ( fs.existsSync( pkgJson ) ) {
		return nodeJavaPath;
	}
	throw new Error( `java-portable could not find the node-java package! Make sure you it installed alongside java-portable` );
}

module.exports = getNodeJavaPath;
