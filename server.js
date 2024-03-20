const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const express = require("express");
const app = express();

app.use(cors());

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

// Rotas para operações de arquivos PDF/DOCX

app.post("/linearize", upload.single("file"), async (req, res) => {
  const inputFile = req.file.path;

  try {
    // Initial setup, create credentials instance.
    const credentials =
      PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
        .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
        .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
        .build();

    // Create an ExecutionContext using credentials and create a new operation instance.
    const executionContext =
        PDFServicesSdk.ExecutionContext.create(credentials),
      linearizePDF = PDFServicesSdk.LinearizePDF,
      linearizePDFOperation = linearizePDF.Operation.createNew();

    // Set operation input from a source file.
    const input = PDFServicesSdk.FileRef.createFromLocalFile(inputFile);
    linearizePDFOperation.setInput(input);

    //Generating a file name
    let outputFilePath = createOutputFilePath();

    // Execute the operation and Save the result to the specified location.
    try {
      linearizePDFOperation
        .execute(executionContext)
        .then((result) => result.saveAsFile(outputFilePath))
        .then(() => {
          const filePath = path.join(__dirname, outputFilePath);
          res.download(filePath);
          console.log("Linearize Done");
        })
        .catch((err) => {
          if (
            err instanceof PDFServicesSdk.Error.ServiceApiError ||
            err instanceof PDFServicesSdk.Error.ServiceUsageError
          ) {
            console.log("Exception encountered while executing operation", err);
          } else {
            console.log("Exception encountered while executing operation", err);
          }
        });
    } catch (err) {
      console.log("Exception encountered while executing operation", err);
    }

    //Generates a string containing a directory structure and file name for the output file.
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
      return "docs/linearize" + dateString + ".pdf";
    }
  } catch (err) {
    console.log("Exception encountered while executing operation", err);
  }
});

app.post("/ocr", upload.single("file"), async (req, res) => {
  const inputFile = req.file.path;

  try {
    // Initial setup, create credentials instance.
    const credentials =
      PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
        .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
        .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
        .build();

    //Create an ExecutionContext using credentials and create a new operation instance.
    const executionContext =
        PDFServicesSdk.ExecutionContext.create(credentials),
      ocrOperation = PDFServicesSdk.OCR.Operation.createNew();

    // Set operation input from a source file.
    const input = PDFServicesSdk.FileRef.createFromLocalFile(inputFile);
    ocrOperation.setInput(input);

    // Provide any custom configuration options for the operation.
    const options = new PDFServicesSdk.OCR.options.OCROptions.Builder()
      .withOcrType(
        PDFServicesSdk.OCR.options.OCRSupportedType.SEARCHABLE_IMAGE_EXACT
      )
      .withOcrLang(PDFServicesSdk.OCR.options.OCRSupportedLocale.PT_BR)
      .build();
    ocrOperation.setOptions(options);

    //Generating a file name
    let outputFilePath = createOutputFilePath();

    // Execute the operation and Save the result to the specified location.
    ocrOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        const filePath = path.join(__dirname, outputFilePath);
        res.download(filePath);
        console.log("Export Done");
      })
      .catch((err) => {
        if (
          err instanceof PDFServicesSdk.Error.ServiceApiError ||
          err instanceof PDFServicesSdk.Error.ServiceUsageError
        ) {
          console.log("Exception encountered while executing operation", err);
        } else {
          console.log("Exception encountered while executing operation", err);
        }
      });

    //Generates a string containing a directory structure and file name for the output file.
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
      return "docs/ocr" + dateString + ".pdf";
    }
  } catch (err) {
    console.log("Exception encountered while executing operation", err);
  }
});

app.post("/export", upload.single("file"), async (req, res, next) => {
  const INPUT = req.file.path;

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
    return "docs/export" + dateString + ".docx";
  }

  try {
    await exportPDFOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        const filePath = path.join(__dirname, outputFilePath);
        res.download(filePath);
        console.log("Export Done");
      })
      .catch((err) => {
        console.log("Exception encountered while executing operation", err);
      });
  } catch (err) {
    console.error("Error:", err);
  }
});

app.post("/compress", upload.single("file"), async (req, res, next) => {
  const INPUT = req.file.path;
  // Initial setup, create credentials instance.
  const credentials =
    PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
      .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
      .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
      .build();

  // Create an ExecutionContext using credentials and create a new operation instance.
  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
    compressPDF = PDFServicesSdk.CompressPDF,
    compressPDFOperation = compressPDF.Operation.createNew();

  // Set operation input from a source file.
  const input = PDFServicesSdk.FileRef.createFromLocalFile(INPUT);
  compressPDFOperation.setInput(input);

  // Provide any custom configuration options for the operation.
  const options = new compressPDF.options.CompressPDFOptions.Builder()
    .withCompressionLevel(
      PDFServicesSdk.CompressPDF.options.CompressionLevel.HIGH
    )
    .build();
  compressPDFOperation.setOptions(options);

  //Generating a file name
  let outputFilePath = createOutputFilePath();

  try {
    await compressPDFOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        // Execute the operation and Save the result to the specified location.
        const filePath = path.join(__dirname, outputFilePath);
        res.download(filePath);
      })
      .catch((err) => {
        if (
          err instanceof PDFServicesSdk.Error.ServiceApiError ||
          err instanceof PDFServicesSdk.Error.ServiceUsageError
        ) {
          console.log("Exception encountered while executing operation", err);
        } else {
          console.log("Exception encountered while executing operation", err);
        }
      });
  } catch (err) {
    console.error("Error:", err);
  }

  //Generates a string containing a directory structure and file name for the output file.
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
    return "docs/" + dateString + ".pdf";
  }
});

app.listen(PORT, () => {
  console.log("Server listen!");
});
