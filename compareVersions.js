
function compareJavaVersions( lhs, rhs ) {
	return lhs.minor === rhs.minor;
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
	if ( compareJavaVersions( lhs.java.version, rhs.java.version ) ) {
		same = false;
		if ( reasons ) {
			reasons.push( 'Invalid JRE version: Installed: ' + lhs.java.version + ', expected: ' + rhs.java.version );		
		}
	}
	return same;
}

module.exports = compareVersions;
