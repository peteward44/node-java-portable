const postInstall = require( './lib/postInstall.js' );


function install() {
	// record version of node.js and JDK / JRE, which is then used to check when executing the actual module
	try {
		postInstall();
	}
	catch( err ) {
		console.error( err );
		process.exit( 1 );
	}
}

install();
