import JiraApi from 'jira-client'

class JBot {
  private static JBotHelperInstance: JBot;
  constructor() { }

  public static jBotHelper() {
    if(!JBot.JBotHelperInstance) {
      JBot.JBotHelperInstance = new JBot();
    }
    return JBot.JBotHelperInstance;
  }

  getJIRAInfo(issueNumber: string) {
    const jira = new JiraApi({
      protocol: 'https',
      host: `${process.env.JIRA_HOST}`,
      username: process.env.JIRA_USER,
      password: process.env.JIRA_PASS,
      apiVersion: '2',
      strictSSL: false
    })
    return jira.getIssue(issueNumber)
      .then(res => res)
      .catch(err => err)
  }
}

export const JBotHelper = JBot.jBotHelper();
