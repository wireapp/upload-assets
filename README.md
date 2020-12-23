# upload-assets

GitHub Action to upload multiple assets to a release. Based off of @alexellis/upload-release-assets.

## Features

This action aims to resolve several outstanding user requests with [@actions/upload-release-asset](https://github.com/actions/upload-release-asset).

* Getting the latest release tag for upload
* Globbing i.e. `./bin/*`
* Succinct - no need to populate content_type and a separate path input

## Built for developers by developers

<a href="https://github.com/sponsors/alexellis/">
<img alt="Sponsor this project" src="https://github.com/alexellis/alexellis/blob/master/sponsor-today.png" width="65%" height="65%">
</a>

## Input variables

You must provide:

* `asset_paths` - the paths to the assets you want to upload as a JSON array. You can use a glob pattern. For example `asset_paths: '["bin/*", "dist/js/*"]'`
* `require_tag` - (default `true`) set to false if you just want it uploaded to the latest untagged release 

## Output variables

* `browser_download_urls` - the paths to download the uploaded assets

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
        with:
          fetch-depth: 1
      - name: Make all
        run: make all
      - name: Upload release binaries
        uses: jedahan/upload-assets@0.2.4
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          asset_paths: '["./bin/release-it*"]'
```

Example taken from [this sample project](https://github.com/alexellis/release-it/blob/master/.github/workflows/publish.yaml).

## Creating a new version

Install dependencies

    npm install

Build a new version

    npm run build

## License

MIT

Any contributions must be proposed via a GitHub issue before being worked on.

You should also use `git commit -s` and follow the [DCO](https://developercertificate.org)
