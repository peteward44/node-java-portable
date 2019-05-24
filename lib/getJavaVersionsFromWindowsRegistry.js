const path = require( 'path' );
const WinReg = require( './winreg.js' );
const getJavaVersion = require( './getJavaVersion.js' );

function getAllVersionKeys( paths ) {
	let prom = Promise.resolve();
	let keysFound = [];
	for ( const p of paths ) { 
		prom = prom.then( () => {
			return new Promise( ( resolve ) => {
				const key = new WinReg({ hive: WinReg.HKLM, key: p });
				key.keys( (err, javaKeys) => {
					if ( err ) {
						resolve();
						return;
					}
					keysFound = keysFound.concat( javaKeys );
					resolve();
				} );
			} );
		} );
	}
	return prom.then( () => { return keysFound; } );
}

function alreadyInVersionArray( versionArray, homedir ) {
	const rhs = path.resolve( homedir );
	for ( const version of versionArray ) {
		if ( path.resolve( version.dir ) === rhs ) {
			return true;
		}
	}
	return false;
}

function getVersionPaths( keysFound ) {
	const versionArray = [];
	let prom = Promise.resolve();
	for ( const key of keysFound ) {
		prom = prom.then( () => {
			return new Promise( ( resolve ) => {
				key.get( 'JavaHome', ( err, home ) => {
					resolve( !err && home && home.value ? home.value : null );
				} );
			} );
		} )
		.then( dir => {
			if ( dir && !alreadyInVersionArray( versionArray, dir ) ) {
				const version = getJavaVersion( dir );
				if ( version ) {
					version.origin = 'registry';
					versionArray.push( version );
				}
			}
		} );
	}
	return prom.then( () => { return versionArray; } );

}

/**
 * @returns {Promise.<Array.<JavaVersion>>}
 */
function getJavaVersionsFromWindowsRegistry( options = {} ) {
    const possibleKeyPaths = [        
		"SOFTWARE\\JavaSoft\\Java Development Kit",
		"SOFTWARE\\JavaSoft\\JDK"
    ];
	// JRE paths
	if ( options.jre ) {
		possibleKeyPaths.push( "SOFTWARE\\JavaSoft\\Java Runtime Environment" );
		possibleKeyPaths.push( "SOFTWARE\\JavaSoft\\JRE" );
	}
	return getAllVersionKeys( possibleKeyPaths )
	.then( ( keysFound ) => getVersionPaths( keysFound ) );
}

module.exports = getJavaVersionsFromWindowsRegistry;
