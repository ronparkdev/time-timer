const fs = require('fs')
const path = require('path')

const Spritesmith = require('spritesmith')

const removeExtension = (filename) => filename.substring(0, filename.lastIndexOf('.')) || filename

const files = fs
  .readdirSync('./images')
  .map((file) => path.resolve('./images', file))
  .filter((file) => path.extname(file).toLowerCase() === '.png')

Spritesmith.run({ src: files }, (err, result) => {
  const { image, coordinates, properties } = result

  const { width: spriteWidth, height: spriteHeight } = properties

  fs.writeFileSync('src/sprites.png', image)

  const cssText = Object.keys(coordinates)
    .map((file) => {
      const key = removeExtension(path.basename(file).replaceAll('_', '-'))
      const { x, y, width, height } = coordinates[file]

      const col = x / width
      const row = y / height

      const cols = spriteWidth / width
      const rows = spriteHeight / height

      return `
@mixin img-${key} {
  background-image: url('/sprites.png');
  background-repeat: no-repeat;
  background-position: ${(col / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%;
  background-size: ${cols * 100}% ${rows * 100}%;
}
`
    })
    .join('')

  fs.writeFileSync('src/sprite-mixin.scss', cssText)
})
