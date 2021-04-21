import { JBotHelper } from './helper';

export const resolvers = {
  Query: {
    async getJIRA(root: any, args: any, ctx: any) {
      const jiraDetails = await JBotHelper.getJIRAInfo(args.issue)
        .then((res: any) => res)
        .catch((err: any) => err);
      if (jiraDetails.statusCode === 404) {
        throw 'JIRA not found';
      } 
      return {
        summary: `${jiraDetails.fields.summary}`,
        status: `${jiraDetails.fields.status.name}`,
        reporter: `${jiraDetails.fields.reporter.name}`,
        assignee: `${jiraDetails.fields.assignee.name}`,
        priority: `${jiraDetails.fields.priority.name}`,
        url: `https://${process.env.JIRA_HOST}/browse/${jiraDetails.key}`,
      };
    }
  }
}
