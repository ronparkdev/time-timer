const fs = require('fs')
const path = require('path')

const Spritesmith = require('spritesmith')

const removeExtension = (filename) => filename.substring(0, filename.lastIndexOf('.')) || filename

const files = fs
  .readdirSync('./images')
  .map((file) => path.resolve('./images', file))
  .filter((file) => path.extname(file).toLowerCase() === '.png')

Spritesmith.run({ src: files }, (err, result) => {
  const { image, coordinates } = result

  fs.writeFileSync('src/sprites.png', image)

  const cssText = Object.keys(coordinates)
    .map((file) => {
      const key = removeExtension(path.basename(file).replaceAll('_', '-'))
      const { x, y, width, height } = coordinates[file]

      return `
@mixin img-${key} {
  width: ${width}px;
  height: ${height}px;
  background: url('/sprites.png') ${x} ${y};
}
`
    })
    .join('')

  fs.writeFileSync('src/sprite-mixin.scss', cssText)
})
