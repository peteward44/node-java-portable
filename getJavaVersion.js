const findJavaHome = require( 'find-java-home' );
const exec = require( 'child_process' ).exec;
const path = require( 'path' );
const os = require( 'os' );

function execJava( homedir ) {
	const javaBin = path.join( homedir, 'bin', 'java' + ( os.platform() === 'win32' ? '.exe' : '' ) );
	return new Promise( ( resolve, reject ) => {
		exec( '"' + javaBin + '" -version', function( err, stdout, stderr ) {
			let version = '';
			let arch = '64';
			if ( err ) {
				reject( err );
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
				resolve( { arch, version } );
			}
		} );
	} );
}

function getJavaVersion() {
	return new Promise( ( resolve, reject ) => {
		findJavaHome( ( err, home ) => {
			err ? reject( err ) : resolve( home );
		} );
	} )
	.then( home => execJava( home ) );
}

module.exports = getJavaVersion;
