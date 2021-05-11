const express = require('express');
const JiraApi = require ('jira-client');
require('dotenv').config();

const PORT = process.env.PORT || 9000;
const app = express().use(express.urlencoded({extended: false})).use(express.json());
const jira = new JiraApi({
  protocol: 'https',
  host: process.env.JIRA_HOST,
  username: process.env.JIRA_USER,
  password: process.env.JIRA_PASS,
  apiVersion: '2',
  strictSSL: false
})

app.listen(PORT, () => { console.info(`Listening on Port# - ${PORT}`); })

app.get('/', function(req, res) {
  res.send({ hello: 'there!' })
})

app.post('/', async (req, res) => {
  let message = '';
  // console.info(req.body);
  if (req.body && req.body.type) {
    switch(req.body.type) {
      case 'ADDED_TO_SPACE':
        message = `Thank you for adding me. Command \help`;
        break;
      case 'MESSAGE':
        // message = await fetchJIRAInfo(textParser(req.body.message.argumentText));
        message = await textParser(req.body.message.argumentText);
        break;
      default:
        message = 'Something went wrong. Please contact One Platform for any questions';
    }
  }
  return res.json({ 'text': JSON.stringify(message) });
});

// Start JBot functions
/**
 * Parses the text message according to what the text message is and responds accordingly
 * @param {text message from user} argumentText 
 * @returns Sanitized text which also sends the appropriate response
 */
async function textParser(argumentText) {
  const regex = /\b\w*[-']\w*\b/g;
  const issueTitles = argumentText
    .match(regex)
    .map(word => word.toUpperCase());
  const issues = await Promise.all(issueTitles.map(issue => fetchJIRAInfo(issue)));
  return issues;
}

/**
 * Fetches JIRA information from the JIRA server
 * @param {JIRA Issue number} issue 
 * @returns Information about the JIRA - summary, status, reporter, assignee and priority
 */
async function fetchJIRAInfo(issue) {
  let msg = '';
  try {
    const jiraDetails = await jira.getIssue(issue).then(res => res);
    if (jiraDetails.statusCode === 404) {
      throw 'JIRA not found';
    }
    msg = {
      summary: `${jiraDetails.fields.summary}`,
      status: `${jiraDetails.fields.status.name}`,
      reporter: `${jiraDetails.fields.reporter.name}`,
      assignee: `${jiraDetails.fields.assignee.name}`,
      priority: `${jiraDetails.fields.priority.name}`,
      url: `https://projects.engineering.redhat.com/browse/${jiraDetails.key}`,
    };
    return msg;
  } catch (error) {
    // console.error(error);
    return `Something went wrong - ${error}`;
  }
}

