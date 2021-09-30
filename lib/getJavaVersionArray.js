const fs = require( 'fs' );
const path = require( 'path' );
const which = require( 'which' );
const getJavaVersion = require( './getJavaVersion.js' );
const getJavaVersionsFromWindowsRegistry = require( './getJavaVersionsFromWindowsRegistry.js' );

const isWindows = process.platform.indexOf('win') === 0;


// iterate through symbolic links until
// file is found
function findLinkedFile( file ) {
	if( !fs.lstatSync( file ).isSymbolicLink() ) {
		return file;
	}
	return findLinkedFile( fs.readlinkSync( file ) );
}

function dirIsJavaHome( dir, javaFilename ){
	return fs.existsSync(''+dir)
		&& fs.statSync(dir).isDirectory()
		&& fs.existsSync(path.resolve(dir, 'bin', javaFilename));
}


function addToVersionArray( versionArray, version ) {
	const rhsDir = path.resolve( version.dir );
	for ( let i=0; i<versionArray.length; ++i ) {
		const lhs = versionArray[i];
		if ( path.resolve( lhs.dir ) === rhsDir ) {
			// overwrite existing version, so origin = 'JAVA_HOME' or origin = 'PATH' takes priority over windows registry ones
			versionArray[i] = version;
			return;
		}
	}
	versionArray.push( version );
}

function getEnvironmentVariableJavaVersion( javaFilename ) {
	// see if the JAVA_HOME environment variable has been set
	if ( process.env.JAVA_HOME && dirIsJavaHome( process.env.JAVA_HOME, javaFilename ) ) {
		return getJavaVersion( process.env.JAVA_HOME );
	}
	return Promise.resolve( null );
}

function getPathVersion( javaFilename ) {
	try {
		const javaLoc = which.sync( javaFilename );
		if ( javaLoc ) {
			const dir = path.dirname( path.dirname( findLinkedFile( javaLoc ) ) );
			return getJavaVersion( dir );
		}
	} catch ( err ) {
	}
	return Promise.resolve( null );
}

/**
 * Gets all versions of Java installed on host.
 * @returns {Promise.<Array.<JavaVersion>>}
 */
function getJavaVersionArray( options = {} ) {
	let versionArray;
	const javaFilename = ( options.jre ? 'java' : 'javac' ) + ( isWindows ? '.exe' : '' );
	return Promise.resolve()
	.then( () => {
		// check registry locations if in windows
		if ( isWindows && !options.skipWinReg ) {
			return getJavaVersionsFromWindowsRegistry( options );
		}
		return [];
	} )
	.then( versionArray_ => {
		versionArray = versionArray_;

		return getEnvironmentVariableJavaVersion( javaFilename );
	} )
	.then( envVersion => {
		if ( envVersion ) {
			envVersion.origin = 'JAVA_HOME';
			addToVersionArray( versionArray, envVersion );
		}
		return getPathVersion( javaFilename );
	} )
	.then( pathVersion => {
		if ( pathVersion ) {
			pathVersion.origin = 'PATH';
			addToVersionArray( versionArray, pathVersion );
		}
		return versionArray;
	} );
}

module.exports = getJavaVersionArray;
