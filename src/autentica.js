const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");

function autentica() {
  return PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
    .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
    .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
    .build();
}

module.exports = autentica;
