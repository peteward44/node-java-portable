const fs = require( 'fs' );
const path = require( 'path' );
const getVersions = require( './getVersions.js' );
const compareVersions = require( './compareVersions.js' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );
const getJavaLibPath = require( './getJavaLibPath.js' );

/**
 * @typedef {Object} javaPortable#Options
 * @property {string} [versionsJsonPath] - Use this versions.json file path
 * @property {string} [nodeJavaPath] - Use this as the path to the node-java package
 */

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

function replacePrebuiltBinary( nodeJavaPath, currentVersions, prebuiltPath ) {
	const dest = path.join( nodeJavaPath, 'build', 'Release', 'nodejavabridge_bindings.node' );
	return copyFile( prebuiltPath, dest )
	.then( () => {
		// update versions.json with installed version
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( versionsJsonPath, JSON.stringify( currentVersions, null, 2 ), 'utf8', ( err ) => { err ? reject( err ) : resolve(); } );
		} );
	} );	
}

/**
 * @param {javaPortable#Options} options
 */
function start( options = {} ) {
	let javaDir;
	const nodeJavaPath = options.nodeJavaPath || getNodeJavaPath();
	const versionsJsonPath = path.join( __dirname, '..', 'versions.json' );
	const savedVersions = JSON.parse( fs.readFileSync( options.versionsJsonPath || versionsJsonPath, 'utf8' ) );
	return getVersions( nodeJavaPath )
	.then( currentVersions => {
		javaDir = currentVersions.java.dir;
		const rejectionReasons = [];
		if ( !compareVersions( currentVersions, savedVersions, rejectionReasons ) ) {
			// installed version is not compatible with system - see if we have a version we can copy over installed version that will work
			const prebuiltFilename = getPrebuiltFilename( currentVersions );
			const prebuiltPath = path.join( __dirname, 'prebuilt', prebuiltFilename );
			if ( fs.existsSync( prebuiltPath ) ) {
				return replacePrebuiltBinary( nodeJavaPath, currentVersions, prebuiltPath );
			} else {
				throw new Error( rejectionReasons.join( "\r\n" ) );
			}
		}
	} )
	.then( () => {
		// update JVM path stored in node-java package
		const libPath = getJavaLibPath( javaDir );
		return new Promise( ( resolve, reject ) => {
			const jvmDllPath = path.join( nodeJavaPath, 'build', 'jvm_dll_path.json' );
			const contents = JSON.stringify( path.delimiter + libPath );
			const jvmDir = path.dirname( jvmDllPath );
			if ( !fs.existsSync( jvmDir ) ) {
				fs.mkdirSync( jvmDir );
			}
			fs.writeFile( jvmDllPath, contents, 'utf8', ( err ) => { err ? reject( err ) : resolve(); } );
		} );
	} )
	.then( () => {
		return require( 'java' );
	} );
}

module.exports = start;
