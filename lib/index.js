const fs = require( 'fs' );
const path = require( 'path' );
const os = require( 'os' );
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
	return `prebuilt-${os.platform()}-${versions.node.arch}-${versions.node.abi}-${versions.java.arch}-${versions.java.version.minor}-${versions.nodeJava.version}.node`;
}

function replacePrebuiltBinary( options, currentVersions, prebuiltPath ) {
	const dest = path.join( options.nodeJavaPath, 'build', 'Release', 'nodejavabridge_bindings.node' );
	return copyFile( prebuiltPath, dest )
	.then( () => {
		// update versions.json with installed version
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( options.versionsJsonPath, JSON.stringify( currentVersions, null, 2 ), 'utf8', ( err ) => { err ? reject( err ) : resolve(); } );
		} );
	} );	
}

/**
 * @param {javaPortable#Options} options
 */
function start( options = {} ) {
	let javaDir;
	options.nodeJavaPath = options.nodeJavaPath || getNodeJavaPath();
	options.versionsJsonPath = options.versionsJsonPath || path.join( __dirname, '..', 'versions.json' );
	const savedVersions = JSON.parse( fs.readFileSync( options.versionsJsonPath, 'utf8' ) );
	return getVersions( options.nodeJavaPath )
	.then( currentVersions => {
		javaDir = currentVersions.java.dir;
		const rejectionReasons = [];
		if ( !compareVersions( currentVersions, savedVersions, rejectionReasons ) ) {
			// installed version is not compatible with system - see if we have a version we can copy over installed version that will work
			const prebuiltFilename = getPrebuiltFilename( currentVersions );
			const prebuiltPath = path.join( __dirname, '..', 'prebuilt', prebuiltFilename );
			if ( fs.existsSync( prebuiltPath ) ) {
				return replacePrebuiltBinary( options, currentVersions, prebuiltPath );
			} else {
				throw new Error( rejectionReasons.join( "\r\n" ) );
			}
		}
	} )
	.then( () => {
		// update JVM path stored in node-java package
		const libPath = getJavaLibPath( javaDir );
		return new Promise( ( resolve, reject ) => {
			const jvmDllPath = path.join( options.nodeJavaPath, 'build', 'jvm_dll_path.json' );
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
