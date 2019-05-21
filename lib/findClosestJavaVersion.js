const fs = require( 'fs' );
const path = require( 'path' );
const getJavaVersionsFromWindowsRegistry = require( './getJavaVersionsFromWindowsRegistry.js' );

const isWindows = process.platform.indexOf('win') === 0;


function dirIsJavaHome( dir, javaFilename ){
	return fs.existsSync(''+dir)
		&& fs.statSync(dir).isDirectory()
		&& fs.existsSync(path.resolve(dir, 'bin', javaFilename));
}


function addToVersionList( versions, version, dir ) {
	if ( !versions[version] ) {
		versions[version] = [];
	}
	if ( versions[version].indexOf( home.value ) < 0 ) {
		versions[version].push( dir );
	}
}

function getEnvironmentVariableJavaHome( versions, javaFilename ) {
	// see if the JAVA_HOME environment variable has been set
	if ( process.env.JAVA_HOME && dirIsJavaHome( process.env.JAVA_HOME, javaFilename ) ) {
		const bin = path.resolve( dir, 'bin', 'java' + ( isWindows ? '.exe' : '' ) );
		// get java version
		addToVersionList( versions, v, process.env.JAVA_HOME );
	}
}

/**
 * @returns {Promise.<string>}
 */
function findClosestJavaVersion( version, options = {} ) {
	const versions = [];
	const javaFilename = ( options.jre ? 'java' : 'javac' ) + ( isWindows ? '.exe' : '' );

	return Promise.resolve()
	.then( () => {
		// check registry locations if in windows
		if ( isWindows ) {
			return getJavaVersionsFromWindowsRegistry( options );
		}
		return {};
	} )
	.then( versions_ => {
		versions = versions_;
		return getEnvironmentVariableJavaHome( versions, javaFilename );
	} );
}

module.exports = findClosestJavaVersion;
