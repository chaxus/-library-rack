bin=./node_modules/.bin
$bin/rollup -c ./rollup.config.js -i main.js  --file dist/bundle.js
$bin/rollup -c ./rollup.config.js -i ./lib/create.js  --file dist/lib/create.js
$bin/rollup -c ./rollup.config.js -i ./lib/Generator.js  --file dist/lib/Generator.js
$bin/rollup -c ./rollup.config.js -i ./lib/http.js  --file dist/lib/http.js