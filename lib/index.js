const fs = require( 'fs' );
const path = require( 'path' );
const os = require( 'os' );
const getVersions = require( './getVersions.js' );
const compareVersions = require( './compareVersions.js' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );
const getJavaLibPath = require( './getJavaLibPath.js' );
const findClosestJavaVersion = require( './findClosestJavaVersion.js' );

/**
 * @typedef {Object} javaPortable#Options
 * @property {boolean} [noprebuilt=false] - If the version of java, node.js etc isn't matched, don't copy over a prebuilt version of node-java and just fail instead
 * @property {boolean} [nowritejvmfile=false] - Do not overwrite the jvm_dll_path.json file if you don't want to do it write now (e.g. in a multithreaded application). Call writeJvmDllPathFile() to do this separately.
 * @property {string} [versionsJsonPath] - Use this versions.json file path
 * @property {string} [nodeJavaPath] - Use this as the path to the node-java package
 */

function getOptions( options = {} ) {
	options.nodeJavaPath = options.nodeJavaPath || getNodeJavaPath();
	options.versionsJsonPath = options.versionsJsonPath || path.join( __dirname, '..', 'versions.json' );
	return options;
}

/**
 * @param {javaPortable#Options} options
 * @returns {Promise}
 */
function prepare( options = {} ) {
	options = getOptions( options );
	const currentVersions = getVersions( options.nodeJavaPath );
	const savedVersions = JSON.parse( fs.readFileSync( options.versionsJsonPath, 'utf8' ) );
	const rejectionReasons = [];
	compareVersions( currentVersions, savedVersions, rejectionReasons );
	if ( rejectionReasons.length > 0 ) {
		throw new Error( rejectionReasons.join( "\r\n" ) );
	}
	return findClosestJavaVersion( savedVersions.java )
	.then( ( javaDir ) => {
		if ( !javaDir ) {
			throw new Error( "No valid Java installation found" );
		}
		// update JVM path stored in node-java package
		const libPath = getJavaLibPath( javaDir );
		const jvmDllPath = path.join( options.nodeJavaPath, 'build', 'jvm_dll_path.json' );
		const contents = JSON.stringify( path.delimiter + libPath );
		const jvmDir = path.dirname( jvmDllPath );
		if ( !fs.existsSync( jvmDir ) ) {
			fs.mkdirSync( jvmDir );
		}
		if ( fs.existsSync( jvmDllPath ) ) {
			const existingContents = fs.readFileSync( jvmDllPath, 'utf8' );
			if ( contents === existingContents ) {
				// file already contains optimal jvm path
				return;
			}
		}
		
		fs.writeFileSync( jvmDllPath, contents, 'utf8' );
	} );
}

function get() {
	return require( 'java' );
}

exports.prepare = prepare;
exports.get = get;
