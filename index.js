const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
  try {
    const regex = new RegExp(core.getInput('regex'));
    const numApprovalsRequired = core.getInput('num-approvals-required');
    const token = core.getInput('token');
    const title =
      github.context.payload &&
      github.context.payload.pull_request &&
      github.context.payload.pull_request.title
    core.info(title)
    const toBeChecked = regex.test(title)
    if (!toBeChecked) return;
    const octokit = github.getOctokit(token);
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
      owner: github.context.payload.organization.login,
      repo: github.context.payload.repository.name,
      pull_number: github.context.payload.number
    })
    const reviews = response.data;
    let changesRequestedCount = 0;
    let approvedCount = 0;
    reviews.forEach((review) => {
        switch (review.state) {
            case "APPROVED":
                approvedCount++;
                break;
            case "CHANGES_REQUESTED":
                changesRequestedCount++;
                break;
            default:
              return;
        }
    if (approvedCount <= numApprovalsRequired) {
      core.setFailed(`This PR requires at least ${numApprovalsRequired} approvals.`);
    }
    else if (changesRequestedCount > 0) {
      core.setFailed("This PR has changes requested.");
    }
   });
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()
