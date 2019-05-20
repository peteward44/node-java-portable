const fs = require( 'fs' );
const path = require( 'path' );

const isWindows = process.platform.indexOf('win') === 0;


function dirIsJavaHome(dir){
	return fs.existsSync(''+dir)
		&& fs.statSync(dir).isDirectory()
		&& fs.existsSync(path.resolve(dir, 'bin', javaFilename));
}


function findInRegistry( paths ) {
	
	let prom = Promise.resolve();
	let keysFound = [];
	for ( const p of paths ) { 
		prom = prom.then( () => {
			return new Promise( ( resolve ) => {
				const key = new WinReg({ key: p });
				key.keys( (err, javaKeys) => {
					keysFound = keysFound.concat( javaKeys );
					resolve();
				} );
			} );
		} );
	}
	
	keysFound = keysFound.sort( ( a, b ) => {
		const aVer = parseFloat( a.key );
		const bVer = parseFloat( b.key );
		return bVer - aVer;
	} );
	if ( keysFound.length <= 0 ) {
		return null;
	}
	var registryJavaHome;
	keysFound[0].get( 'JavaHome', function(err,home){
		registryJavaHome = home.value; 
	} );

	return registryJavaHome;
}

function addToVersionList( versions, dir ) {
	
}

/**
 * @returns {Promise.<string>}
 */
function findClosestJavaVersion( version, options = {} ) {
	const versions = [];
	const javaFilename = ( options.allowJre ? 'java' : 'javac' ) + ( isWindows ? '.exe' : '' );

	// see if the JAVA_HOME environment variable has been set
	if ( process.env.JAVA_HOME && dirIsJavaHome( process.env.JAVA_HOME ) ) {
		addToVersionList( versions, process.env.JAVA_HOME );
	}

	return Promise.resolve()
	.then( () => {
		// check registry locations if in windows
		if ( isWindows ) {
			//java_home can be in many places
			//JDK paths
			const possibleKeyPaths = [        
				"SOFTWARE\\JavaSoft\\Java Development Kit"
			];
			//JRE paths
			if( options.allowJre ){
				possibleKeyPaths.push( "SOFTWARE\\JavaSoft\\Java Runtime Environment" );
			}

			javaHome = findInRegistry(possibleKeyPaths);
		}
	} );
}

module.exports = findClosestJavaVersion;
