const findJavaHome = require( 'find-java-home' );
const exec = require( 'child_process' ).exec;
const path = require( 'path' );
const os = require( 'os' );
const fs = require( 'fs' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );


function parseJavaVersion( ver ) {
	const m = ver.match( /^(\d+)\.(\d+)\.(\d+)_?(\d*)$/ );
	if ( m ) {
		return {
			major: m[1],
			minor: m[2],
			patch: m[3],
			snapshot: m[4]
		};
	}
	return null;
}

function execJava( homedir ) {
	if ( !homedir ) {
		return Promise.resolve( {
			dir: ''
		} );
	}
	const javaBin = path.join( homedir, 'bin', 'java' + ( os.platform() === 'win32' ? '.exe' : '' ) );
	return new Promise( ( resolve ) => {
		exec( '"' + javaBin + '" -version', function( err, stdout, stderr ) {
			let version = '';
			let arch = '64';
			if ( err ) {
				resolve( {
					dir: ''
				} );
			} else {
	/*
	java version "1.7.0_80"
	Java(TM) SE Runtime Environment (build 1.7.0_80-b15)
	Java HotSpot(TM) 64-Bit Server VM (build 24.80-b11, mixed mode)
	*/
				const versionMatch = stderr.match( /java version "(.*?)"/ );
				if ( versionMatch ) {
					version = versionMatch[1];
				}
				const archMatch = stderr.match( /64-Bit Server/ );
				if ( !archMatch ) {
					arch = '32';
				}
				resolve( {
					dir: homedir,
					arch,
					version: parseJavaVersion( version )
				} );
			}
		} );
	} );
}

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

function getVersions( nodeJavaPath ) {
	return new Promise( ( resolve ) => {
		findJavaHome( ( err, home ) => {
			resolve( err ? '' : home );
		} );
	} )
	.then( home => execJava( home ) )
	.then( javaVersions => {
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
			java: javaVersions
		};
	} );
}

module.exports = getVersions;
