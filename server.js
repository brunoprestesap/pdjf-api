const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
const fs = require("fs");
require("dotenv").config();

const express = require("express");
const app = express();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./docs");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = 3000;

app.post("/export", upload.single("file"), async (req, res, next) => {
  const INPUT = req.file.path;
  console.log(INPUT);

  const credentials =
    PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
      .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
      .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
      .build();

  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
    exportPDF = PDFServicesSdk.ExportPDF,
    exportPDFOperation = exportPDF.Operation.createNew(
      exportPDF.SupportedTargetFormats.DOCX
    );

  // Set operation input from a source file
  const inputPDF = PDFServicesSdk.FileRef.createFromLocalFile(INPUT);
  exportPDFOperation.setInput(inputPDF);

  let outputFilePath = createOutputFilePath();
  console.log(outputFilePath);

  function createOutputFilePath() {
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
    return "./docs/export" + dateString + ".docx";
  }

  try {
    await exportPDFOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        console.log("Export Done");
      })
      .catch((err) => {
        console.log("Exception encountered while executing operation", err);
      });
  } catch (err) {
    console.error("Error:", err);
  }

  const filePath = path.join(__dirname, outputFilePath)
  res.sendFile(filePath)
});

app.listen(PORT, () => {
  console.log("Server listen!");
});
