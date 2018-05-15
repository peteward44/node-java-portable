const javaPortable = require( '..' );
const chai = require( 'chai' );

describe( 'node-java-portable', () => {
	it( 'basic test', () => {
		return javaPortable().then( java => {
			chai.assert( !!java );
		} );
	} );
} );
