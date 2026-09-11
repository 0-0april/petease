const Busboy = require('busboy');

/**
 * Parses a multipart/form-data request.
 * Returns { fields, files } where files[fieldName] = { buffer, mimetype, originalname }
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};

    const bb = Busboy({ headers: req.headers });

    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('file', (name, stream, info) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        files[name] = {
          buffer: Buffer.concat(chunks),
          mimetype: info.mimeType,
          originalname: info.filename,
        };
      });
    });

    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);

    req.pipe(bb);
  });
}

module.exports = { parseMultipart };
