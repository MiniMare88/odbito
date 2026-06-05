import QRCode from 'qrcode'

/**
 * Generate a QR code as a base64 data URL
 * @param {string} data - content to encode (booking_code, subscription id, etc.)
 * @returns {Promise<string>} - data:image/png;base64,...
 */
export async function generateQR(data) {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    color: {
      dark: '#080A0E',
      light: '#FFFFFF',
    },
    width: 300,
  })
}

/**
 * Generate QR as SVG string (for embedding in HTML emails)
 */
export async function generateQRSvg(data) {
  return QRCode.toString(data, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#080A0E',
      light: '#FFFFFF',
    },
  })
}
