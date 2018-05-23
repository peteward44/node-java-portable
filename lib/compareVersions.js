
function compareJavaVersions( lhs, rhs ) {
	return lhs.minor === rhs.minor;
}

function javaVersionToString( ver ) {
	return `${ver.major}.${ver.minor}.${ver.patch}${ver.snapshot ? '_' + ver.snapshot : '' }`;
}

function compareVersions( lhs, rhs, reasons ) {
	let same = true;
	if ( lhs.node.abi !== rhs.node.abi ) {
		same = false;
		if ( reasons ) {
			reasons.push( 'Invalid Node.js version: ABI version is ' + lhs.node.abi + ', expected ' + rhs.node.abi + '. Try using Node.js ' + rhs.node.version );
		}
	}
	if ( lhs.java.arch !== rhs.java.arch ) {
		same = false;
		if ( reasons ) {
			reasons.push( 'Invalid JRE architecture: Installed: ' + lhs.java.arch + ', expected: ' + rhs.java.arch );
		}
	}
	if ( !compareJavaVersions( lhs.java.version, rhs.java.version ) ) {
		same = false;
		if ( reasons ) {
			reasons.push( 'Invalid JRE version: Installed: ' + javaVersionToString( lhs.java.version ) + ', expected: ' + javaVersionToString( rhs.java.version ) );		
		}
	}
	if ( lhs.nodeJava.version !== rhs.nodeJava.version ) {
		same = false;
		if ( reasons ) {
			reasons.push( 'Invalid node-java version: Installed: ' + lhs.nodeJava.version + ', expected: ' + rhs.nodeJava.version );		
		}
	}
	return same;
}

module.exports = compareVersions;