const execSync = require( 'child_process' ).execSync;
const path = require( 'path' );
const os = require( 'os' );
const fs = require( 'fs' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );
const findJavaHomes = require( './findJavaHomes.js' );

/**
 * Gets the versions of all relevant software on the current host
 */

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
	try {
		if ( homedir ) {
			const javaBin = path.join( homedir, 'bin', 'java' + ( os.platform() === 'win32' ? '.exe' : '' ) );
			const stderr = execSync( '"' + javaBin + '" -version', { stdio: ['ignore', 'ignore', 'pipe'] } );
			let version = '';
			let arch = '64';
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
			return {
				dir: homedir,
				arch,
				version: parseJavaVersion( version )
			};
		}
	}
	return {
		dir: ''
	};
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
	const javaHomes = findJavaHomes();
	const javaVersion = javaHomes.length > 0 ? execJava( javaHomes[0].path ) : {};
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
		java: javaVersion
	};
}

module.exports = getVersions;
