# upload-assets

GitHub Action to upload multiple assets to a release.

Based on [@alexellis/upload-assets](https://github.com/alexellis/upload-assets) and [@actions/upload-release-asset](https://github.com/actions/upload-release-asset), with some improvements:

* Adds globbing support for file paths (i.e. `./bin/*`)
* Finds the latest release tag for upload
* Populates content_type and paths automatically

## Input variables

You *must* provide `asset_paths`

Paths to the assets to upload, supports glob patterns.

```yaml
asset_paths: |
        bin/*
        dist/js/*
```

You *may* provide `require_tag` (defaults to `true`)

Only upload to tagged releases. Setting this to `false` will add artifacts to the latest release even if its untagged.

## Output variables

This action will populate `browser_download_urls`

`browser_download_urls` - array of urls to download any uploaded assets.

## Example

```yaml
name: publish

on:
  push:
    tags:
      - '*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master

      - name: build
        run: make

      - name: Upload release binaries
        uses: jedahan/upload-assets@0.3.1
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          asset_paths: |
                  bin/*
                  dist/js/*
```
