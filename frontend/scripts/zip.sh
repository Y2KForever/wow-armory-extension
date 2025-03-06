#!/bin/bash

DIST_FOLDER="./dist"
VERSION=$(node -p "require('./package.json').version")

if [ ! -d "$DIST_FOLDER" ]; then
  echo "Dist folder does not exist."
  exit 1
fi

ZIP_NAME="dist-v$VERSION.zip"
(cd "$DIST_FOLDER" && zip -r "../releases/$ZIP_NAME" . -x "landing*" -x "*/landing*")
echo "Created zip: $ZIP_NAME"
