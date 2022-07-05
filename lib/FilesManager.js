const fs = require("fs");

module.exports = class FilesManager {
  static dataFolderName = `data`;
  static connectionFolderName = `connection`;

  static createFolders() {
    // Create the first folder
    fs.open(`${__dirname}/../${this.dataFolderName}`, (err) => {
      if (err) {
        fs.mkdir(`${__dirname}/../${this.dataFolderName}`, (err) => {});
      }
    });

    // Create the second folder
    fs.open(`${__dirname}/../${this.dataFolderName}/${this.connectionFolderName}`, (err) => {
      if (err) {
        fs.mkdir(`${__dirname}/../${this.dataFolderName}/${this.connectionFolderName}`,
          (err) => { });
      }
    });
  }
}