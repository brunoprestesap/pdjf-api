const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
const fs = require("fs");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();
const uploadMiddleware = require("./src/middlewares/uploadMiddleware.js");

const express = require("express");
const app = express();
app.use(compression());

app.use(cors());

const multer = require("multer");
const path = require("path");
const autentica = require("./src/autentica");
const createOutputFilePath = require("./src/createOutputFilePath");

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
    const credentials = autentica();

    // Create an ExecutionContext using credentials and create a new operation instance.
    const executionContext =
        PDFServicesSdk.ExecutionContext.create(credentials),
      linearizePDF = PDFServicesSdk.LinearizePDF,
      linearizePDFOperation = linearizePDF.Operation.createNew();

    // Set operation input from a source file.
    const input = PDFServicesSdk.FileRef.createFromLocalFile(inputFile);
    linearizePDFOperation.setInput(input);

    //Generating a file name
    let outputFilePath = createOutputFilePath("linearized", ".pdf");

    // Execute the operation and Save the result to the specified location.
    try {
      linearizePDFOperation
        .execute(executionContext)
        .then((result) => result.saveAsFile(outputFilePath))
        .then(() => {
          const outputFile = path.join(__dirname, outputFilePath);
          res.download(outputFile, () => {
            fs.unlink(outputFile, (err) => {
              if (err) {
                console.error("Erro ao excluir o arquivo:", err);
              } else {
                console.log("Arquivo excluído com sucesso");
              }
            });
            fs.unlink(inputFile, (err) => {
              if (err) {
                console.error("Erro ao excluir o arquivo:", err);
              } else {
                console.log("Arquivo excluído com sucesso");
              }
            });
          });
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
  } catch (err) {
    console.log("Exception encountered while executing operation", err);
  }
});

app.post("/ocr", upload.single("file"), async (req, res) => {
  const inputFile = req.file.path;

  try {
    const credentials = autentica();

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
    let outputFilePath = createOutputFilePath("ocr", "pdf");

    // Execute the operation and Save the result to the specified location.
    ocrOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        /* const outputFile = path.join(__dirname, outputFilePath); */
        const outputFile = outputFilePath;
        res.download(outputFile, () => {
          fs.unlink(outputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${outputFile} excluído com sucesso`);
            }
          });
          fs.unlink(inputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${inputFile} excluído com sucesso`);
            }
          });
        });
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
  } catch (err) {
    console.log("Exception encountered while executing operation", err);
  }
});

app.post("/export", upload.single("file"), async (req, res, next) => {
  const inputFile = req.file.path;

  const credentials = autentica();

  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
    exportPDF = PDFServicesSdk.ExportPDF,
    exportPDFOperation = exportPDF.Operation.createNew(
      exportPDF.SupportedTargetFormats.DOCX
    );

  // Set operation input from a source file
  const inputPDF = PDFServicesSdk.FileRef.createFromLocalFile(inputFile);
  exportPDFOperation.setInput(inputPDF);

  let outputFilePath = createOutputFilePath("export", "docx");

  try {
    await exportPDFOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        const outputFile = path.join(__dirname, outputFilePath);
        res.download(outputFile, () => {
          fs.unlink(outputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${outputFile} excluído com sucesso`);
            }
          });
          fs.unlink(inputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${inputFile} excluído com sucesso`);
            }
          });
        });
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
  const inputFile = req.file.path;

  const credentials = autentica();

  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
    compressPDF = PDFServicesSdk.CompressPDF,
    compressPDFOperation = compressPDF.Operation.createNew();

  // Set operation input from a source file.
  const input = PDFServicesSdk.FileRef.createFromLocalFile(inputFile);
  compressPDFOperation.setInput(input);

  // Provide any custom configuration options for the operation.
  const options = new compressPDF.options.CompressPDFOptions.Builder()
    .withCompressionLevel(
      PDFServicesSdk.CompressPDF.options.CompressionLevel.HIGH
    )
    .build();
  compressPDFOperation.setOptions(options);

  //Generating a file name
  let outputFilePath = createOutputFilePath("optimize", "pdf");

  try {
    await compressPDFOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        // Execute the operation and Save the result to the specified location.
        const outputFile = path.join(__dirname, outputFilePath);
        res.download(outputFile, () => {
          fs.unlink(outputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${outputFile} excluído com sucesso`);
            }
          });
          fs.unlink(inputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${inputFile} excluído com sucesso`);
            }
          });
        });
        console.log("Optimize Done");
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
});

app.post("/combine", uploadMiddleware, async (req, res) => {
  const files = req.files;

  const credentials = autentica();

  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
    combineFilesOperation = PDFServicesSdk.CombineFiles.Operation.createNew();

  files.forEach((file) => {
    combineFilesOperation.addInput(
      PDFServicesSdk.FileRef.createFromLocalFile(file.path)
    );
  });

  let outputFilePath = createOutputFilePath("combine", "pdf");

  try {
    await combineFilesOperation
      .execute(executionContext)
      .then((result) => result.saveAsFile(outputFilePath))
      .then(() => {
        // Execute the operation and Save the result to the specified location.
        const outputFile = path.join(__dirname, outputFilePath);
        res.download(outputFile, () => {
          fs.unlink(outputFile, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo:", err);
            } else {
              console.log(`${outputFile} excluído com sucesso`);
            }
          });
        });
        console.log("Combine Done");
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
  } catch (error) {
    console.log(error);
  }

  files.forEach((file) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Erro ao excluir o arquivo:", err);
      } else {
        console.log(`${file.path} excluído com sucesso`);
      }
    });
  });
});

app.listen(PORT, () => {
  console.log("Server listen!");
});
