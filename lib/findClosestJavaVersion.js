const getJavaVersionArray = require( './getJavaVersionArray.js' );

function toNum( str ) {
	if ( str && str.length > 0 ) {
		return parseInt( str, 10 );
	}
	return 0;
}

function versionToNumber( v ) {
	return toNum( v.major ) * 1000000000 + toNum( v.minor ) * 1000000 + toNum( v.patch ) * 1000 + toNum( v.snapshot );
}

/**
 * @returns {number} - Number representing difference between versions
 */
function compareJavaVersions( lhs, rhs ) {
	const lhsValue = versionToNumber( lhs.version );
	const rhsValue = versionToNumber( rhs.version );
	return lhsValue - rhsValue;
}

/**
 * Preferred version of Java to use. Defaults to version pointed to by JAVA_HOME env var or first Java installation in PATH.
 * @returns {Promise.<string>}
 */
function findClosestJavaVersion( version, options = {} ) {
	return getJavaVersionArray( options )
	.then( versionArray => {
		// build array of differences in version
		if ( version ) {
			const diffs = [];
			for ( const regVersion of versionArray ) {
				const regDiff = compareJavaVersions( regVersion, { version: version } );
				diffs.push( { version: regVersion, diff: regDiff } );
			}

			// then find the closest
			if ( diffs.length > 0 ) {
				let closest = diffs[0];
				for ( const diff of diffs ) {
					if ( Math.abs( diff.diff ) < Math.abs( closest.diff ) ) {
						closest = diff;
					}
				}
				return closest.version;
			}
		} else {
			const envVersion = versionArray.find( lhs => lhs.origin === 'JAVA_HOME' );
			const pathVersion = versionArray.find( lhs => lhs.origin === 'PATH' );

			// check environment variable, then path version, then look in registry for latest version
			if ( envVersion ) {
				return envVersion;
			}
			if ( pathVersion ) {
				return pathVersion;
			}
			// find latest in version map
			let latestNum = 0;
			let latestVersion = null;
			for ( const regVersion of versionArray ) {
				const regDiff = versionToNumber( regVersion.version );
				if ( regDiff > latestNum ) {
					latestNum = regDiff;
					latestVersion = regVersion;
				}
			}
			if ( latestVersion ) {
				return latestVersion;
			}
		}
		return null;
	} );
}

module.exports = findClosestJavaVersion;
