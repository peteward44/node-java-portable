const spawn = require( 'child_process' ).spawn;
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

function spawnPromise( cmd, args ) {
	return new Promise( (resolve, reject) => {
		const proc = spawn( cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] } );
		let stderr = '';
		proc.stderr.on( 'data', d => {
			stderr += d.toString();
		} );
		proc.on( 'error', err => reject( err ) );
		proc.on( 'exit', () => resolve( stderr ) );
	} );
		
}

function getJavaVersion( homedir ) {
	try {
		if ( fs.existsSync( homedir ) && fs.statSync( homedir ).isDirectory() ) {
			const javaBin = path.join( homedir, 'bin', 'java' + ( os.platform() === 'win32' ? '.exe' : '' ) );
			return spawnPromise( javaBin, ['-version'] )
			.then( stderr => {
				let versionString = '';
				let arch = '64';
			/*
			java version "1.7.0_80"
			Java(TM) SE Runtime Environment (build 1.7.0_80-b15)
			Java HotSpot(TM) 64-Bit Server VM (build 24.80-b11, mixed mode)
			*/
			/*
			openjdk version "1.8.0_152-release"
			OpenJDK Runtime Environment (build 1.8.0_152-release-1136-b38)
			OpenJDK 64-Bit Server VM (build 25.152-b38, mixed mode)
			*/
				const versionMatch = stderr.match( /(java|openjdk|jdk|jre)\s+version\s+"(.*?)"/i );
				if ( versionMatch ) {
					versionString = versionMatch[2];
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
			} )
			.catch( err => {
			} );
		}
	} catch ( err ) {
	}
	return Promise.resolve( null );
}

module.exports = getJavaVersion;
