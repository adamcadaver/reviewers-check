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
    if (!toBeChecked) {
      console.log("This PR title does fit the regex")
      return;
    }
    console.log("to be checked");
    const octokit = github.getOctokit(token);
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
      owner: github.context.payload.organization.login,
      repo: github.context.payload.repository.name,
      pull_number: github.context.payload.number
    })
    const reviews = response.data;
    console.log(JSON.stringify(reviews, undefined, 2));
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
    });
    console.log(`number of required approvals=${numApprovalsRequired}\nnumber of approvals=${approvedCount}\nchanges requested count=${changesRequestedCount}`)
    if (approvedCount < numApprovalsRequired) {
      const msg = `This PR requires at least ${numApprovalsRequired} approvals.`
      console.log(msg);
      core.setFailed(msg);
    }
    else if (changesRequestedCount > 0) {
      const msg = "This PR has changes requested.";
      console.log(msg);
      core.setFailed(msg);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()
