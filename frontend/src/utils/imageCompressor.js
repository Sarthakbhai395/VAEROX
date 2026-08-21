// Utility for compressing local PC images to lightweight, crisp Base64 Data URLs
// Prevents HTTP 431 (Header Fields Too Large) & 400 (Bad Request) errors

export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'))
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate scaling maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Export as lightweight JPEG data URL (~40-70KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }

      img.onerror = (err) => reject(err)
    }

    reader.onerror = (err) => reject(err)
  })
}
