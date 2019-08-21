const spawnSync = require( 'child_process' ).spawnSync;
const path = require( 'path' );
const os = require( 'os' );
const fs = require( 'fs' );

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

function getJavaVersion( homedir ) {
	try {
		if ( fs.existsSync( homedir ) && fs.statSync( homedir ).isDirectory() ) {
			const javaBin = path.join( homedir, 'bin', 'java' + ( os.platform() === 'win32' ? '.exe' : '' ) );
			const proc = spawnSync( javaBin, ['-version'], { stdio: ['ignore', 'ignore', 'pipe'] } );
			const stderr = proc.stderr.toString();
			let versionString = '';
			let arch = '64';
		/*
		java version "1.7.0_80"
		Java(TM) SE Runtime Environment (build 1.7.0_80-b15)
		Java HotSpot(TM) 64-Bit Server VM (build 24.80-b11, mixed mode)
		*/
			const versionMatch = stderr.match( /java version "(.*?)"/ );
			if ( versionMatch ) {
				versionString = versionMatch[1];
			}
			const archMatch = stderr.match( /64-Bit Server/ );
			if ( !archMatch ) {
				arch = '32';
			}

			const version = parseJavaVersion( versionString );
			if ( !version ) {
				return null;
			}

			return {
				dir: homedir,
				arch,
				version
			};
		}
	} catch ( err ) {
	}
	return null;
}

module.exports = getJavaVersion;
