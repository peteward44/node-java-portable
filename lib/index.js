const fs = require( 'fs' );
const path = require( 'path' );
const mkdirp = require( 'mkdirp' );
const getHostVersions = require( './getHostVersions.js' );
const compareVersions = require( './compareVersions.js' );
const getNodeJavaPath = require( './getNodeJavaPath.js' );
const getJavaLibPath = require( './getJavaLibPath.js' );
const findClosestJavaVersion = require( './findClosestJavaVersion.js' );
const getJavaVersionArray = require( './getJavaVersionArray.js' );

/**
 * @typedef {Object} javaPortable#Options
 * @property {boolean} [jre=true] - Include Java Runtime Environments as well as the Development Environments
 * @property {string} [versionsJsonPath] - Use this versions.json file path
 * @property {string} [nodeJavaPath] - Use this as the path to the node-java package
 * @property {JavaVersion} [fallback] - If the versions.json file doesn't exist (the one created at installation), use this version to get the closest installed version
 */

function getOptions( options = {} ) {
	options.jre = options.jre === false ? false : true;
	options.nodeJavaPath = options.nodeJavaPath || getNodeJavaPath();
	options.versionsJsonPath = options.versionsJsonPath || path.join( __dirname, '..', 'versions.json' );
	return options;
}

function getClosestJavaVersion( version, options = {} ) {
	options = getOptions( options );
	return findClosestJavaVersion( version, options );
}

/**
 * @param {javaPortable#Options} options
 * @returns {Promise.<Array.<JavaVersion>>}
 */
function getJavaVersions( options = {} ) {
	options = getOptions( options );
	return getJavaVersionArray( options );
}

/**
 * @param {javaPortable#Options} options
 * @returns {Promise.<JavaVersion>} - Version of Java that npm "java" module will use
 */
function prepare( options = {} ) {
	options = getOptions( options );
	const currentVersions = getHostVersions( options.nodeJavaPath );
	const savedVersions = fs.existsSync( options.versionsJsonPath ) ? JSON.parse( fs.readFileSync( options.versionsJsonPath, 'utf8' ) ) : null;
	if ( savedVersions ) {
		const rejectionReasons = [];
		compareVersions( currentVersions, savedVersions, rejectionReasons );
		if ( rejectionReasons.length > 0 ) {
			throw new Error( rejectionReasons.join( "\r\n" ) );
		}
	}
	let closest = null;
	if ( savedVersions && savedVersions.java ) {
		closest = savedVersions.java;
	} else if ( options.fallback ) {
		closest = { version: options.fallback };
	}
	return findClosestJavaVersion( closest, options )
	.then( ( version ) => {
		if ( !version ) {
			throw new Error( "No valid Java installation found" );
		}
		const javaDir = version.dir;
		// update JVM path stored in node-java package
		const libPath = getJavaLibPath( javaDir );
		const jvmDllPath = path.join( options.nodeJavaPath, 'build', 'jvm_dll_path.json' );
		const contents = JSON.stringify( path.delimiter + libPath );
		const jvmDir = path.dirname( jvmDllPath );
		if ( !fs.existsSync( jvmDir ) ) {
			mkdirp.sync( jvmDir );
		}
		if ( fs.existsSync( jvmDllPath ) ) {
			const existingContents = fs.readFileSync( jvmDllPath, 'utf8' );
			if ( contents === existingContents ) {
				// file already contains optimal jvm path
				return version;
			}
		}
		
		fs.writeFileSync( jvmDllPath, contents, 'utf8' );
		return version;
	} );
}

function get() {
	return require( 'java' );
}

exports.getClosestJavaVersion = getClosestJavaVersion;
exports.getJavaVersions = getJavaVersions;
exports.prepare = prepare;
exports.get = get;
