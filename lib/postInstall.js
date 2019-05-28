const path = require( 'path' );
const fs = require( 'fs' );
const mkdirp = require( 'mkdirp' );
const getHostVersions = require( './getHostVersions.js' );

/**
 * @param {javaPortable#Options} options
 */
function postInstall( options = {} ) {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	return getHostVersions( options.nodeJavaPath )
	.then( versions => {
		const versionsPath = options.versionsJsonPath || path.join( __dirname, '..', 'versions.json' );
		const versionsDir = path.dirname( versionsPath );
		if ( !fs.existsSync( versionsDir ) ) {
			mkdirp.sync( versionsDir );
		}
		fs.writeFileSync( versionsPath, JSON.stringify( versions, null, 2 ), 'utf8' );
	} );
}

module.exports = postInstall;
