const WinReg = require( './winreg.js' );

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
						if ( versionMap[leaf].indexOf( home.value ) < 0 ) {
							versionMap[leaf].push( home.value );
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
      "SOFTWARE\\JavaSoft\\Java Development Kit"
    ];
	// JRE paths
	if ( options.jre ) {
		possibleKeyPaths.push( "SOFTWARE\\JavaSoft\\Java Runtime Environment" );
	}
	return getAllVersionKeys( possibleKeyPaths )
	.then( ( keysFound ) => getVersionPaths( keysFound ) );
}

module.exports = getJavaVersionsFromWindowsRegistry;
