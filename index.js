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
  try {
    if (req.body && req.body.type) {
      switch(req.body.type) {
        case 'ADDED_TO_SPACE':
          return res.json({ 'text': `Thank you for adding me. Command \help` });
        case 'MESSAGE':
          const message = {
            cards: await textParser(req.body.message.argumentText)
          };
          return res.json(message);
        default:
          return res.json({ 'text': 'Please check your command' });
      }
    }
  } 
  catch (error) {
      return res.json({ 'text': `Something went wrong. Please contact One Platform for any questions` });
  }
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
      throw  `${issue} - JIRA not found`;
    }
    msg = {
      "sections": [
        {
          "widgets": [
            {
              "textParagraph": {
                "text": `${jiraDetails.fields.summary}`
              }
            }
          ]
        },
        {
          "widgets": [
              {
                "keyValue": {
                  "topLabel": "Status",
                  "content": `${jiraDetails.fields.status.name}`
                  }
              },
              {
                "keyValue": {
                  "topLabel": "Priority",
                  "content": `${jiraDetails.fields.priority.name}`,
                  }
              },
              {
                "keyValue": {
                  "topLabel": "Reporter",
                  "content": `${jiraDetails.fields.reporter.name}`
                  }
              },
              {
                "keyValue": {
                  "topLabel": "Assignee",
                  "content": `${jiraDetails.fields.assignee !== null ? jiraDetails.fields.assignee.name : 'unassigned'}`,
                }
              },
          ]
        },
        {
          "widgets": [
              {
                  "buttons": [
                    {
                      "textButton": {
                        "text": "OPEN JIRA",
                        "onClick": {
                          "openLink": {
                            "url": `https://projects.engineering.redhat.com/browse/${jiraDetails.key}`,
                          }
                        }
                      }
                    }
                  ]
              }
          ]
        }
      ]
    };
    return msg;
  } catch (error) {
    return {
      "sections": [
        {
          "widgets": [
            {
              "textParagraph": {
                "text": `${error}`
              }
            }
          ]
        }
      ]
    };
  }
}

