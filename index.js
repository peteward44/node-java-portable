const fs = require( 'fs' );
const path = require( 'path' );
const getJavaVersion = require( './getJavaVersion.js' );

function verifyNodeVersion( versions ) {
	if ( versions.node.arch !== process.arch ) {
		throw new Error( 'Invalid Node.js architecture: Installed: ' + process.arch + ', expected: ' + versions.node.arch );
	}
	if ( versions.node.abi !== process.versions.modules ) {
		throw new Error( 'Invalid Node.js version: ABI version is ' + process.versions.modules + ', expected ' + versions.node.abi + '. Try using Node.js ' + versions.node.version );
	}
}

function verifyJavaVersion( versions ) {
	return getJavaVersion()
	.then( javaVersion => {
		if ( versions.java.arch !== javaVersion.arch ) {
			throw new Error( 'Invalid JRE architecture: Installed: ' + javaVersion.arch + ', expected: ' + versions.java.arch );
		}
		if ( versions.java.version !== javaVersion.version ) {
			throw new Error( 'Invalid JRE version: Installed: ' + javaVersion.version + ', expected: ' + versions.java.version );
		}
	} );
}

function start( options = {} ) {
	const versions = JSON.parse( fs.readFileSync( path.join( __dirname, 'versions.json' ), 'utf8' ) );
	return Promise.resolve()
	.then( () => verifyNodeVersion( versions ) )
	.then( () => verifyJavaVersion( versions ) )
	.then( () => {
		//return {};
		return require( 'java' );
	} );
}

module.exports = start;
