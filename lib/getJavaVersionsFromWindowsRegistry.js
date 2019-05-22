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

function alreadyInVersionMap( versionMap, homedir ) {
	for ( const versionName of Object.keys( versionMap ) ) {
		const versionArray = versionMap[versionName];
		for ( const version of versionArray ) {
			if ( path.resolve( version.dir ) === path.resolve( homedir ) ) {
				return true;
			}
		}
	}
	return false;
}

function getVersionPaths( keysFound ) {
	const versionMap = {};
	let prom = Promise.resolve();
	for ( const key of keysFound ) {
		prom = prom.then( () => {
			return new Promise( ( resolve ) => {
				key.get( 'JavaHome', ( err, home ) => {
					if ( !err && home && home.value ) {
						let leaf = key.key;
						const index = key.key.lastIndexOf( '\\' );
						if ( index >= 0 ) {
							leaf = key.key.substr( index + 1 );
						}
						if ( !versionMap[leaf] ) {
							versionMap[leaf] = [];
						}
						if ( !alreadyInVersionMap( versionMap, home.value ) ) {
							const version = getJavaVersion( home.value );
							if ( version ) {
								versionMap[leaf].push( version );
							}
						}
					}
					resolve();
				} );
			} );
		} );
	}
	return prom.then( () => { return versionMap; } );

}

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
