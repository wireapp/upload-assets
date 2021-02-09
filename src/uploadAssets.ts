import core from '@actions/core';
import github from '@actions/github';
import glob from '@actions/glob';
import fs from 'fs';
import path from 'path';

const contentLength = async (filePath: string) => (await fs.promises.stat(filePath)).size;
const readFile = async (filePath: string) => fs.promises.readFile(filePath);

async function uploadAssets() {
  try {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('Not GITHUB_TOKEN environment variable specified');
    }

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const assetPathsInput = core.getInput('asset_paths', {required: true});
    const uploadUrlInput = core.getInput('upload_url', {required: true});

    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

    const globber = await glob.create(assetPathsInput);
    const files = await globber.glob();

    core.debug(`Matching files: ${files}`);

    const browserDownloadURLs = await Promise.all(
      files.map(async filePath => {
        // Determine content-length for header to upload asset
        const contentType = 'binary/octet-stream';

        // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
        const headers = {
          'content-length': await contentLength(filePath),
          'content-type': contentType,
        };

        const name = path.basename(filePath);
        console.info(`Uploading ${name}`);

        // Upload a release asset
        // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
        // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
        const uploadedAsset = await octokit.repos.uploadReleaseAsset({
          // @ts-ignore - seems like the types are wrong.
          data: await readFile(filePath),
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
