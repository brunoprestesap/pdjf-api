//Generates a string containing a directory structure and file name for the output file.
function createOutputFilePath(operation, ext) {
    let date = new Date();
    let dateString =
      date.getFullYear() +
      "-" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + date.getDate()).slice(-2) +
      "T" +
      ("0" + date.getHours()).slice(-2) +
      "-" +
      ("0" + date.getMinutes()).slice(-2) +
      "-" +
      ("0" + date.getSeconds()).slice(-2);
    return `docs\\${operation}${dateString}.${ext}`;
  }

  module.exports = createOutputFilePath