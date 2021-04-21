import { jBot } from './helper';
import JiraApi from 'jira-client'

export const resolvers = {
  Query: {
    async getJIRA(root, args, ctx) {
      const jira = new JiraApi({
        protocol: 'https',
        host: process.env.JIRA_HOST,
        username: process.env.JIRA_USER,
        password: process.env.JIRA_PASS,
        apiVersion: '2',
        strictSSL: false
      })
      const jiraDetails = await jira.getIssue(args.issue)
        .then(res => res)
        .catch(err => err);
      if (jiraDetails.statusCode === 404) {
        throw 'JIRA not found';
      } 
      return {
        summary: `${jiraDetails.fields.summary}`,
        status: `${jiraDetails.fields.status.name}`,
        reporter: `${jiraDetails.fields.reporter.name}`,
        assignee: `${jiraDetails.fields.assignee.name}`,
        priority: `${jiraDetails.fields.priority.name}`,
        url: `https://projects.engineering.redhat.com/browse/${jiraDetails.key}`,
      };
    }
  }
}
