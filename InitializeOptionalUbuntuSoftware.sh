#! /bin/bash
echo "Tidings Optional Ubuntu Module Software"
echo ""
echo "--"
echo ""

if [ "$EUID" -ne 0 ]
  then echo "This script must be ran with sudo"
  exit
fi

echo "-> Update Software"
apt-get update
echo ""

echo "-> LaTeX"
apt-get install -y texlive
echo ""

echo "-> Graphviz"
apt-get install -y graphviz 
echo ""
