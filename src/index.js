const core = require('@actions/core')
const github = require('@actions/github')

const fs = require('fs')
const path = require('path')
const glob = require('glob')

(async () => {
  try {
    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const assetPathsInput = core.getInput('asset_paths', { required: true })

    const assetPaths = JSON.parse(assetPathsInput)
    if(!assetPaths || assetPaths.length == 0) {
      core.setFailed("asset_paths must contain a JSON array of quoted paths")
      return
    }

    console.log(`assetPaths are ${assetPaths}`)

    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

    const { owner, repo } = github.context.repo

    // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
    const latestRelease = await (async () => {
      if (core.getInput('require_tag') === 'false') {
        return await octokit.repos.getLatestRelease({
          owner,
          repo,
        })
      }

      const tagName = github.context.ref
      // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
      const tag = tagName.replace("refs/tags/", "")
      return octokit.repos.getLatestReleaseByTag({
        owner,
        repo,
        tag,
      })
    })()

    const expandPath = pathSpec => pathSpec.includes('*') ? glob.sync(pathSpec) : pathSpec
    const paths = assetPaths.flatMap(expandPath)

    console.log(`Expanded paths: ${paths}`)

    const browserDownloadURLs = paths.map(async asset => {
      // Determine content-length for header to upload asset
      const contentLength = filePath => fs.statSync(filePath).size
      const contentType = "binary/octet-stream"
      // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
      const headers = { 'content-type': contentType, 'content-length': contentLength(asset) }
  
      const name = path.basename(asset)
      console.log(`Uploading ${name}`)

      // Upload a release asset
      // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
      const uploadedAsset = await octokit.repos.uploadReleaseAsset({
        url: latestRelease.data.upload_url,
        headers,
        name,
        data: fs.readFileSync(asset)
      })
  
      // Get the browser_download_url for the uploaded release asset from the response
      return uploadedAsset.data.browser_download_url
    })

    // Set the output variable for use by other actions
    // https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('browser_download_urls', JSON.stringify(browserDownloadURLs))
  } catch (error) {
    core.setFailed(error.message)
  }
})()
