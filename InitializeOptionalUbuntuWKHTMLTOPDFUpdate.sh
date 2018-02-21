#! /bin/bash
echo "Tidings Optional Ubuntu WKHTML Dependency Module Software"
echo ""
echo "--"
echo ""

if [ "$EUID" -ne 0 ]
  then echo "This script must be ran with sudo"
  exit
fi

mkdir supportlibraries
cd supportlibraries

echo "-> Download wkhtmltopdf 0.12.4"
wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.4/wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
echo ""

echo "-> Uncompressing wkhtmltopdf 0.12.4"
tar xvf wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
echo ""

echo "-> Copying updated binary to prebuilt node module (for self-referenced libraries in the tidings folder)"
cp wkhtmltox/bin/wkhtmltopdf ../node_modules/wkhtmltopdf-selfcontained/wkhtmltopdf-amd64

echo "-> Copying updated binary to prebuilt node module (for peer-referenced libraries)"
cp wkhtmltox/bin/wkhtmltopdf ../../wkhtmltopdf-selfcontained/wkhtmltopdf-amd64

echo ""
