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
apt update
echo ""

echo "-> LaTeX"
apt install -y texlive
echo ""

echo "-> Graphviz"
apt install -y graphviz
echo ""

echo "Cleaning apt lists (to keep layer size down)"
rm -rf /var/lib/apt/lists/*
