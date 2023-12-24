#!/bin/bash

# Get the latest tag
git fetch --tags
latestTag=$(git describe --tags `git rev-list --tags --max-count=1`)

# If there are no tags, start with 1.0.0
if [[ -z "$latestTag" ]]; then
  echo "::set-output name=VERSION::1.0.0"
else
  # If there are tags, increment the patch version
  versionParts=(${latestTag//./ })
  patchVersion=${versionParts[2]}
  patchVersion=$((patchVersion+1))
  newVersion="${versionParts[0]}.${versionParts[1]}.$patchVersion"
  echo "VERSION=$newVersion" >> $GITHUB_STATE
fi
