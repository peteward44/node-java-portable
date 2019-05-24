/* eslint-disable no-console */
const path = require( 'path' );
const javaPortable = require( '..' );

const testRootDir = path.join( __dirname, '..', '_test' );
const testVersionsJsonPath = path.join( testRootDir, '_versions.json' );
const testNodeJavaPath = path.join( testRootDir, '_node-java' );

const testOptions = {
	versionsJsonPath: testVersionsJsonPath,
	nodeJavaPath: testNodeJavaPath
};

describe( 'node-java-portable', () => {
	// beforeEach( () => {
		// try {
			// if ( !fs.existsSync( testRootDir ) ) {
				// fs.mkdirSync( testRootDir );
			// }
			// if ( fs.existsSync( testVersionsJsonPath ) ) {
				// fs.unlinkSync( testVersionsJsonPath );
			// }
			// if ( !fs.existsSync( testNodeJavaPath ) ) {
				// fs.mkdirSync( testNodeJavaPath );
			// }
		// } catch ( err ) {
			// console.error( `Error deleting "${testVersionsJsonPath}"` );
			// console.error( err );
		// }
	// } );

	// it( 'post install creates versions.json which contains valid json', () => {
		// chai.assert( !fs.existsSync( testVersionsJsonPath ) );
		// return postInstall( testOptions )
		// .then( () => {
			// chai.assert( fs.existsSync( testVersionsJsonPath ) );
			// const json = JSON.parse( fs.readFileSync( testVersionsJsonPath, 'utf8' ) );
			// chai.expect( json ).to.be.a( 'object' );
		// } );
	// } );

	// it( 'basic test', () => {
		// return postInstall( testOptions )
		// .then( () => javaPortable( testOptions ) )
		// .then( java => {
			// chai.assert( !!java ); // chai.expect( java ).is( 'object' ) doesn't work
		// } );
	// } );

	it( 'getJavaVersions', () => {
	//	process.env.JAVA_HOME = 'C:\\Program Files\\Java\\jdk1.7.0_131';
		return javaPortable.getJavaVersions( testOptions )
		.then( versions => {
			console.log( JSON.stringify( versions, null, 2 ) );
		} );
	} ).timeout( 2 * 60 * 1000 );

	it( 'prepare', () => {
		process.env.JAVA_HOME = 'C:\\Program Files\\Java\\jdk1.7.0_131';
		return javaPortable.prepare( testOptions )
		.then( version => {
			console.log( JSON.stringify( version, null, 2 ) );
		} );
	} ).timeout( 2 * 60 * 1000 );
} );
