const path = require( 'path' );
const fs = require( 'fs' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );
const findClosestJavaVersion = require( './findClosestJavaVersion.js' );

/**
 * Gets the versions of all relevant software on the current host
 */

function getNodeJavaVersion( nodeJavaPath ) {
	// check node-java version if it's installed alongside
	nodeJavaPath = nodeJavaPath || getNodeJavaPath();
	if ( nodeJavaPath ) {
		const pkgJson = path.join( nodeJavaPath, 'package.json' );
		if ( fs.existsSync( pkgJson ) ) {
			return JSON.parse( fs.readFileSync( pkgJson, 'utf8' ) ).version;
		}
	}
	return null;
}

function getHostVersions( nodeJavaPath ) {
	return findClosestJavaVersion()
	.then( javaVersion => {
		const nodeJavaVersion = getNodeJavaVersion( nodeJavaPath );
		return {
			node: {
				arch: process.arch,
				version: process.version,
				abi: process.versions.modules
			},
			nodeJava: {
				version: nodeJavaVersion
			},
			java: javaVersion || { dir: '' }
		};
	} );
}

module.exports = getHostVersions;
