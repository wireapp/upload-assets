# upload-assets ![CI](https://github.com/wireapp/upload-assets/workflows/CI/badge.svg)

GitHub Action to upload multiple assets to a release.

Based on [@jedahan/upload-assets](https://github.com/jedahan/upload-assets) with a re-added upload URL and some fixes.

## Input variables

You _must_ provide `asset_paths` and `upload_url`

Paths to the assets to upload, supports glob patterns.

```yaml
asset_paths: |
  bin/*
  dist/js/*
upload_url: ...
```

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
        uses: wireapp/upload-assets@v1
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          asset_paths: |
            bin/*
            dist/js/*
```
