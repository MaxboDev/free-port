#!/bin/bash

git fetch --tags
latestTag=$(git describe --tags `git rev-list --tags --max-count=1`)

if [[ -z "$latestTag" ]]; then
  echo "VERSION=1.0.0" >> $GITHUB_ENV
else
  echo "VERSION=$latestTag" >> $GITHUB_ENV
fi
