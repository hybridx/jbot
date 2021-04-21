// import JiraApi from 'jira-client'

// class JBot {
//   constructor() {
//     this.jira = new JiraApi({
//       protocol: 'https',
//       host: process.env.JIRA_HOST,
//       username: process.env.JIRA_USER,
//       password: process.env.JIRA_PASS,
//       apiVersion: '2',
//       strictSSL: false
//     })
//   }

//   getJIRAInfo(issueNumber) {
//     return this.jira.getIssue(issueNumber)
//       .then(res => res)
//       .catch(err => err)
//   }
// }

// const jbotInstance = new JBot();
// export const jBot = jbotInstance.getJIRAInfo
