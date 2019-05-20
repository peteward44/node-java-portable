var glob = require('glob');
var fs = require('fs');
var path = require('path');
var os = require('os');

// This file has been copied from original 'java' npm module to find the location to the "lib" directory it requires within the JRE

function _getCorrectSoForPlatform(soFiles){
  
  var architectureFolderNames = {
    'ia32': 'i386',
    'x64': 'amd64'
  };

  if(os.platform() != 'sunos')
    return soFiles[0];

  var requiredFolderName = architectureFolderNames[os.arch()];

  for (var i = 0; i < soFiles.length; i++) {
    var so = soFiles[i];

    if(so.indexOf('server')>0)
      if(so.indexOf(requiredFolderName)>0)
        return so;
  }

  return soFiles[0];
}

function removeDuplicateJre(filePath){
  while(filePath.indexOf('jre/jre')>=0){
    filePath = filePath.replace('jre/jre','jre');
  }
  return filePath;
}

function getCorrectSoForPlatform(soFiles){
  var so = _getCorrectSoForPlatform(soFiles);
  if (so) {
    so = removeDuplicateJre(so);
  }
  return so;
}

function getJavaLibPath( home ) {
	var dll;
	var dylib;
	var so,soFiles;
	var binary;

	dll = glob.sync('**/jvm.dll', {cwd: home})[0];
	dylib = glob.sync('**/libjvm.dylib', {cwd: home})[0];
	soFiles = glob.sync('**/libjvm.so', {cwd: home});

	if(soFiles.length>0)
	  so = getCorrectSoForPlatform(soFiles);

	binary = dll || dylib || so;
	return path.dirname( path.resolve( home, binary ) );
}

module.exports = getJavaLibPath;
