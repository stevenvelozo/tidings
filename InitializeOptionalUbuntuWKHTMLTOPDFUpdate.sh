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

echo "-> Download wkhtmltopdf 0.12.5"
wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.trusty_amd64.deb
echo ""

echo "-> Installing wkhtmltopdf 0.12.5"
dpkg -i ./wkhtmltox_0.12.5-1.trusty_amd64.deb
apt-get install -f
dpkg -i ./wkhtmltox_0.12.5-1.trusty_amd64.deb
echo ""
