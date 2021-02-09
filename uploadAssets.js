const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');

const fs = require('fs');
const path = require('path');

async function uploadAssets() {
  try {
    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const assetPathsInput = core.getInput('asset_paths', {required: true});
    const uploadUrlInput = core.getInput('upload_url', {required: true});

    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

    const globber = await glob.create(assetPathsInput);
    const files = await globber.glob();

    core.debug(`Matching files: ${files}`);
    console.info(`Upload URL: ${uploadUrlInput}`);

    const browserDownloadURLs = await Promise.all(
      files.map(async asset => {
        // Determine content-length for header to upload asset
        const contentLength = filePath => fs.statSync(filePath).size;
        const contentType = 'binary/octet-stream';
        // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
        const headers = {
          'content-length': contentLength(asset),
          'content-type': contentType,
        };

        const name = path.basename(asset);
        console.info(`Uploading ${name}`);

        // Upload a release asset
        // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
        // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
        const uploadedAsset = await octokit.repos.uploadReleaseAsset({
          data: fs.readFileSync(asset),
          headers,
          name,
          url: uploadUrlInput,
        });

        // Get the browser_download_url for the uploaded release asset from the response
        return uploadedAsset.data.browser_download_url;
      }),
    );

    // Set the output variable for use by other actions
    // https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('browser_download_urls', JSON.stringify(browserDownloadURLs));
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

uploadAssets();
