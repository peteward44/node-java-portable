
function compareVersions( lhs, rhs, reasons ) {
	let same = true;
	if ( lhs.node && rhs.node ) {
		if ( lhs.node.abi !== rhs.node.abi ) {
			same = false;
			if ( reasons ) {
				reasons.push( 'Invalid Node.js version: ABI version is ' + lhs.node.abi + ', expected ' + rhs.node.abi + '. Try using Node.js ' + rhs.node.version + '. You can download from https://nodejs.org/en/download/' );
			}
		}
	}
	// As node-java was installed at same time as java-portable, it's version shouldn't need to be checked but do it anyway
	if ( lhs.nodeJava && rhs.nodeJava ) {
		if ( lhs.nodeJava.version !== rhs.nodeJava.version ) {
			same = false;
			if ( reasons ) {
				reasons.push( 'Invalid node-java version: Installed: ' + lhs.nodeJava.version + ', expected: ' + rhs.nodeJava.version );
			}
		}
	}
	return same;
}

module.exports = compareVersions;
