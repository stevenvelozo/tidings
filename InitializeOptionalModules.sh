#! /bin/bash
echo "Tidings Optional NPM Modules - Initialization"
echo ""
echo "--"
echo ""

echo "-> LaTeX"
npm install latex-file

echo "-> Graphviz"
npm install graphviz

echo "-> FFMPEG"
npm install @ffmpeg-installer/ffmpeg fluent-ffmpeg @ffprobe-installer/ffprobe
chmod +x node_modules/@ffprobe-installer/ffprobe/node_modules/@ffprobe-installer/linux-x64/ffprobe

echo "-> WKHTMLTOPDF"
npm install wkhtmltopdf-selfcontained

echo "-> PhantomJS"
npm install phantomjs-prebuilt phantom-html-to-pdf
