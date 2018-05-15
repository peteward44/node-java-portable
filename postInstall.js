const path = require( 'path' );
const fs = require( 'fs' );
const getJavaVersion = require( './getJavaVersion.js' );

function handleError( err ) {
	console.error( err );
	process.exit( 1 );	
}

function postInstall() {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	getJavaVersion()
	.then( javaVersion => {
		const result = {
			java: javaVersion,
			node: {
				arch: process.arch,
				version: process.version,
				abi: process.versions.modules
			}
		};
		fs.writeFileSync( path.join( __dirname, 'versions.json' ), JSON.stringify( result, null, 2 ), 'utf8' );
	} )
	.catch( err => handleError( err ) );
}

postInstall();
