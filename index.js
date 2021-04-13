const core = require('@actions/core');
const github = require('@actions/github');

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

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
