const postInstall = require( './lib/postInstall.js' );

function handleError( err ) {
	console.error( err );
	process.exit( 1 );	
}

function install() {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	return postInstall()
	.catch( err => handleError( err ) );
}

install();
