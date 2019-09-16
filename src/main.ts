import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const prMessage: string = core.getInput('pr-message');
    if (!prMessage) {
      throw new Error(
        'Action must have at least one of issue-message or pr-message set'
      );
    }
    // Get client and context
    const client: github.GitHub = new github.GitHub(
      core.getInput('repo-token', {required: true})
    );
    const context = github.context;

    if (context.payload.action !== 'opened') {
      console.log('Context: ', context);
      console.log('No issue or PR was opened, skipping');
      return;
    }

    // Do nothing if its not a pr or issue
    const isIssue: boolean = !!context.payload.issue;
    if (!isIssue && !context.payload.pull_request) {
      console.log(
        'The event that triggered this action was not a pull request or issue, skipping.'
      );
      return;
    }

    if (!context.payload.sender) {
      throw new Error('Internal error, no sender provided by GitHub');
    }
    const sender: string = context.payload.sender!.login;
    const issue: {owner: string; repo: string; number: number} = context.issue;
   
    // Do nothing if no message set for this type of contribution
    const message: string = prMessage;
    if (!message) {
      console.log('No message provided for this type of contribution');
      return;
    }

    // Add a comment to the appropriate place
    console.log(`Adding message: ${message} to pull request ${issue.number}`);

    await client.pulls.createReview({
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number,
        body: message,
        event: 'COMMENT'
      });
  } catch (error) {
    core.setFailed(error.message);
    return;
  }
}

run();
