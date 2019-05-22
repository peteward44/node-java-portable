const fs = require( 'fs' );
const path = require( 'path' );
const which = require( 'which' );
const getJavaVersion = require( './getJavaVersion.js' );
const getJavaVersionsFromWindowsRegistry = require( './getJavaVersionsFromWindowsRegistry.js' );

const isWindows = process.platform.indexOf('win') === 0;

function toNum( str ) {
	if ( str && str.length > 0 ) {
		return parseInt( str, 10 );
	}
	return 0;
}

function versionToNumber( v ) {
	return toNum( v.major ) * 1000000000 + toNum( v.minor ) * 1000000 + toNum( v.patch ) * 1000 + toNum( v.snapshot );
}

/**
 * @returns {number} - Number representing difference between versions
 */
function compareJavaVersions( lhs, rhs ) {
	const lhsValue = versionToNumber( lhs.version );
	const rhsValue = versionToNumber( rhs.version );
	return lhsValue - rhsValue;
}

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


function addToVersionList( versions, version, dir ) {
	if ( !versions[version] ) {
		versions[version] = [];
	}
	if ( versions[version].indexOf( home.value ) < 0 ) {
		versions[version].push( dir );
	}
}

function getEnvironmentVariableJavaVersion( javaFilename ) {
	// see if the JAVA_HOME environment variable has been set
	if ( process.env.JAVA_HOME && dirIsJavaHome( process.env.JAVA_HOME, javaFilename ) ) {
		const version = getJavaVersion( process.env.JAVA_HOME );
		return version;
	}
	return null;
}

function getPathVersion( javaFilename ) {
	try {
		const javaLoc = which.sync( javaFilename );
		if ( javaLoc ) {
			const dir = path.dirname( path.dirname( findLinkedFile( javaLoc ) ) );
			const version = getJavaVersion( dir );
			return version;
		}
	} catch ( err ) {
	}
	return null;
}

/**
 * Preferred version of Java to use. Defaults to version pointed to by JAVA_HOME env var or first Java installation in PATH.
 * @returns {Promise.<string>}
 */
function findClosestJavaVersion( version, options = {} ) {
	const javaFilename = ( options.jre ? 'java' : 'javac' ) + ( isWindows ? '.exe' : '' );

	return Promise.resolve()
	.then( () => {
		// check registry locations if in windows
		if ( isWindows && !options.skipWinReg ) {
			return getJavaVersionsFromWindowsRegistry( options );
		}
		return {};
	} )
	.then( versionMap => {
		const envVersion = getEnvironmentVariableJavaVersion( javaFilename );
		const pathVersion = getPathVersion( javaFilename );
		
		// build array of differences in version
		if ( version ) {
			const diffs = [];
			if ( envVersion ) {
				const envDiff = compareJavaVersions( envVersion, version );
				diffs.push( { version: envVersion, diff: envDiff } );
			}
			if ( pathVersion ) {
				const pathDiff = compareJavaVersions( pathVersion, version );
				diffs.push( { version: pathVersion, diff: pathDiff } );
			}
			for ( const versionName of Object.keys( versionMap ) ) {
				const versionArray = versionMap[versionName];
				for ( const regVersion of versionArray ) {
					const regDiff = compareJavaVersions( regVersion, version );
					diffs.push( { version: regVersion, diff: regDiff } );
				}
			}
			
			// then find the closest
			if ( diffs.length > 0 ) {
				let closest = diffs[0];
				for ( const diff of diffs ) {
					if ( Math.abs( diff.diff ) < Math.abs( closest.diff ) ) {
						closest = diff;
					}
				}
				return closest.version.dir;
			}
		} else {
			// check environment variable, then path version, then look in registry for latest version
			if ( envVersion ) {
				return envVersion.dir;
			}
			if ( pathVersion ) {
				return pathVersion.dir;
			}
			// find latest in version map
			let latestNum = 0;
			let latestDir = '';
			for ( const versionName of Object.keys( versionMap ) ) {
				const versionArray = versionMap[versionName];
				for ( const regVersion of versionArray ) {
					const regDiff = versionToNumber( regVersion.version );
					if ( regDiff > latestNum ) {
						latestNum = regDiff;
						latestDir = regVersion.dir;
					}
				}
			}
			if ( latestDir ) {
				return latestDir;
			}
		}
		return null;
	} );
}

module.exports = findClosestJavaVersion;
