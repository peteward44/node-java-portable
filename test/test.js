const postInstall = require( '../lib/postInstall.js' );
const javaPortable = require( '..' );
const chai = require( 'chai' );

describe( 'node-java-portable', () => {
	it( 'basic test', () => {
		return postInstall()
		.then( () => javaPortable() )
		.then( java => {
			chai.assert( !!java );
		} );
	} );
} );
