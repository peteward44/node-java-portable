const fs = require( 'fs' );
const path = require( 'path' );
const getVersions = require( './getVersions.js' );
const compareVersions = require( './compareVersions.js' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );
const getJavaLibPath = require( './getJavaLibPath.js' );

function copyFile(source, target) {
	var rd = fs.createReadStream(source);
	var wr = fs.createWriteStream(target);
	return new Promise(function(resolve, reject) {
		rd.on('error', reject);
		wr.on('error', reject);
		wr.on('finish', resolve);
		rd.pipe(wr);
	}).catch(function(error) {
		rd.destroy();
		wr.end();
		throw error;
	});
}

function getPrebuiltFilename( versions ) {
	return `prebuilt-${versions.node.abi}-${versions.java.minor}-${versions.nodeJava.version}.node`;
}

function replacePrebuiltBinary( currentVersions, prebuiltPath ) {
	const nodeJavaPath = getNodeJavaPath();
	const dest = path.join( nodeJavaPath, 'build', 'Release', 'nodejavabridge_bindings.node' );
	return copyFile( prebuiltPath, dest )
	.then( () => {
		// update versions.json with installed version
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( versionsJsonPath, JSON.stringify( currentVersions, null, 2 ), 'utf8', ( err ) => { err ? reject( err ) : resolve(); } );
		} );
	} );	
}

function start( options = {} ) {
	let javaDir;
	const versionsJsonPath = path.join( __dirname, '..', 'versions.json' );
	const savedVersions = JSON.parse( fs.readFileSync( versionsJsonPath, 'utf8' ) );
	return getVersions()
	.then( currentVersions => {
		javaDir = currentVersions.java.dir;
		const rejectionReasons = [];
		if ( !compareVersions( currentVersions, savedVersions, rejectionReasons ) ) {
			// installed version is not compatible with system - see if we have a version we can copy over installed version that will work
			const prebuiltFilename = getPrebuiltFilename( currentVersions );
			const prebuiltPath = path.join( __dirname, 'prebuilt', prebuiltFilename );
			if ( fs.existsSync( prebuiltPath ) ) {
				return replacePrebuiltBinary( currentVersions, prebuiltPath );
			} else {
				throw new Error( rejectionReasons.join( "\r\n" ) );
			}
		}
	} )
	.then( () => {
		// update JVM path stored in node-java package
		const libPath = getJavaLibPath( javaDir );
		const nodeJavaPath = getNodeJavaPath();
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( path.join( nodeJavaPath, 'build', 'jvm_dll_path.json' ), JSON.stringify( path.delimiter + libPath ), 'utf8', ( err ) => { err ? reject( err ) : resolve(); } );
		} );
	} )
	.then( () => {
		return require( 'java' );
	} );
}

module.exports = start;
