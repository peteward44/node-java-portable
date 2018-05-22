const path = require( 'path' );
const fs = require( 'fs' );
const getVersions = require( './lib/getVersions.js' );

function handleError( err ) {
	console.error( err );
	process.exit( 1 );	
}

function postInstall() {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	return getVersions()
	.then( versions => {
		fs.writeFileSync( path.join( __dirname, 'versions.json' ), JSON.stringify( versions, null, 2 ), 'utf8' );
	} )
	.catch( err => handleError( err ) );
}

postInstall();
