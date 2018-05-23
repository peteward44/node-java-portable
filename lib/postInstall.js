const path = require( 'path' );
const fs = require( 'fs' );
const getVersions = require( './getVersions.js' );

/**
 * @param {javaPortable#Options} options
 */
function postInstall( options = {} ) {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	return getVersions( options.nodeJavaPath )
	.then( versions => {
		const versionsPath = options.versionsJsonPath || path.join( __dirname, '..', 'versions.json' );
		fs.writeFileSync( versionsPath, JSON.stringify( versions, null, 2 ), 'utf8' );
	} );
}

module.exports = postInstall;
