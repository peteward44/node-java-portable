# java-portable

Wrapper for the node-java npm package that improves locating the JRE on the target machine and can support multiple prebuilt platform builds.

Usage:

```
const javaPortable = require( 'java-portable' );

javaPortable().then( ( java ) => {
	// 'java' is the java package object
} );
```
