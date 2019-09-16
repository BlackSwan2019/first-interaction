"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prMessage = core.getInput('pr-message');
            if (!prMessage) {
                throw new Error('Action must have at least one of issue-message or pr-message set');
            }
            // Get client and context
            const client = new github.GitHub(core.getInput('repo-token', { required: true }));
            const context = github.context;
            if (context.payload.action !== 'opened') {
                console.log('No issue or PR was opened, skipping');
                return;
            }
            // Do nothing if its not a pr or issue
            const isIssue = !!context.payload.issue;
            if (!isIssue && !context.payload.pull_request) {
                console.log('The event that triggered this action was not a pull request or issue, skipping.');
                return;
            }
            if (!context.payload.sender) {
                throw new Error('Internal error, no sender provided by GitHub');
            }
            const sender = context.payload.sender.login;
            const issue = context.issue;
        
            // Do nothing if no message set for this type of contribution
            const message = isIssue ? issueMessage : prMessage;
            if (!message) {
                console.log('No message provided for this type of contribution');
                return;
            }
            const issueType = 'pull request';
            // Add a comment to the appropriate place
            console.log('Console: ', context);
            console.log(`Adding message: ${message} to ${issueType} ${issue.number}`);

            yield client.pulls.createReview({
                owner: issue.owner,
                repo: issue.repo,
                pull_number: issue.number,
                body: message,
                event: 'COMMENT'
            });
        }
        catch (error) {
            core.setFailed(error.message);
            return;
        }
    });
}

run();
