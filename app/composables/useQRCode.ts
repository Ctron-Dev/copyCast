import QRCodeStyling from 'qr-code-styling'

interface QRCodeOptions {
  width?: number
  height?: number
  data: string
  margin?: number
  image?: string
  dotsColor?: string
  cornersSquareColor?: string
  cornersDotColor?: string
  backgroundColor?: string
}

export const useQRCode = () => {
  const generateQRCode = (options: QRCodeOptions) => {
    const {
      width = 300,
      height = 300,
      data,
      margin = 10,
      image,
      dotsColor = '#000000',
      cornersSquareColor = '#000000',
      cornersDotColor = '#000000',
      backgroundColor = '#ffffff'
    } = options

    const qrCode = new QRCodeStyling({
      width,
      height,
      data,
      margin,
      image, // Add logo image
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'Q'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0
      },
      dotsOptions: {
        type: 'rounded',
        color: dotsColor
      },
      backgroundOptions: {
        color: backgroundColor
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: cornersSquareColor
      },
      cornersDotOptions: {
        type: 'dot',
        color: cornersDotColor
      }
    })

    return qrCode
  }

  const downloadQRCode = (qrCode: QRCodeStyling, fileName: string = 'qr-code') => {
    qrCode.download({
      name: fileName,
      extension: 'png'
    })
  }

  return {
    generateQRCode,
    downloadQRCode
  }
}
