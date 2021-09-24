// https://www.npmjs.com/package/node-nlp
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
          return res.json({ 'text': `Thank you for adding me. Command */help* for more information` });
        case 'MESSAGE':
          const message = {
            cards: await parseText(req.body)
          };
          return res.json(message);
        default:
          return res.json({ 'text': 'Please check your command' });
      }
    }
  } 
  catch (error) {
    console.error(error);
    return res.json({ 'text': 'Something went wrong. Please contact *associate-run-projects@redhat.com* for any questions' });
  }
});

// Start JBot functions
/**
 * Parses the text message according to what the text message is and responds accordingly
 * @param {text message from user} argumentText 
 * @returns Sanitized text which also sends the appropriate response
 */
async function parseText(body) {
  const helloTexts = ['hi', 'hello', 'hey', 'help'];
  const commands = ['comments', 'addComment'];
  const argumentText = body.message.argumentText;
  const userID = body.message.sender.email.split('@')[0];
  const regex = /\b\w*[-']\w*\b/g;
  const issueTitles = argumentText.match(regex);
  if(helloTexts.some(word => argumentText.toLowerCase().includes(word)) && !commands.some(word => argumentText.includes(word))) {
    return getHelp();
  }
  if (argumentText.includes('/comments')) {
    const comments = await jira.getComments(issueTitles[0].toUpperCase());
    return issueComments(comments, issueTitles[0], -5);
  }
  if (argumentText.includes('/assign')) {
    const assignment = await jira.updateAssignee(issueTitles[0].toUpperCase(), userID)
  }
  if (argumentText.includes('/getMyIssues')) {
    const userIssues = await jira.getUsersIssues(userID, true);
    return getIssues(userIssues.issues);
  }
  // TODO: Improvements required for addComment feature
  if (argumentText.includes('/addComment')) {
    const addedComment = await jira.addComment(issueTitles[0].toUpperCase(), `${argumentText.match(/'([^']+)'/)[1]} - added by [~${userID}]`);
  }
  return Promise.all(issueTitles.map(issue => getJIRADetails(issue.toUpperCase())));
}

/**
 * Fetches JIRA information from the JIRA server
 * @param {JIRA Issue number} issue 
 * @returns Information about the JIRA - summary, status, reporter, assignee and priority
 */
async function getJIRADetails(issue) {
  try {
    const jiraDetails = await jira.getIssue(issue).then(res => res);
    if (jiraDetails.statusCode === 404) {
      throw  `${issue} - JIRA not found`;
    }
    return messageTemplate(jiraDetails);
  } catch (error) {
    console.error(error);
    return jiraNotFound();
  }
}


function getHelp() {
  return [
      {
        "header": {
          "title": "JIRA Bot Help",
          "subtitle": "Bot for JIRA related tasks"
        },
        "sections": [
          {
            "widgets": [
              {
                "keyValue": {
                  "topLabel": "Get issues",
                  "content": `Get information about one or multiple issues`,
                  "bottomLabel": "eg. @JIRABot ONEPLAT-1 ONEPLAT-2",
                  "contentMultiline": true
                }
              },
              {
                "keyValue": {
                  "topLabel": "Assign issue",
                  "content": `Assign an issue to yourself`,
                  "bottomLabel": "eg. @JIRABot /assign",
                  "contentMultiline": true
                }
              },
              {
                "keyValue": {
                  "topLabel": "Command /help",
                  "content": 'Displays help and commands',
                  "bottomLabel": "eg. @JIRABot /help",
                  "contentMultiline": true
                }
              },
              {
                "keyValue": {
                  "topLabel": "Command /addComment",
                  "content": 'Adds a comment to the given issue',
                  "bottomLabel": "eg. @JIRABot /addComment ONEPLAT-1 'Comment'",
                  "contentMultiline": true
                }
              },
              {
                "keyValue": {
                  "topLabel": "Get My Issues",
                  "content": `Get information about users open issues`,
                  "bottomLabel": "eg. @JIRABot /getMyIssues",
                  "contentMultiline": true
                }
              },
              {
                "keyValue": {
                  "topLabel": "Command /comments",
                  "content": `Gets latest top 5 comments`,
                  "bottomLabel": "eg. @JIRABot ONEPLAT-1 /comments <issue-number(eg: ONEPLAT-1)>",
                  "contentMultiline": true
                }
              },


            ]
          },
          {
            "widgets": [
              {
                "textParagraph": {
                  "text": 'We would love contributions from you @ <a href="https://github.com/associate-run-projects/jbot">GitHub project</a>!'
                }
              }
            ]
          }
        ]
      }
    ];
}

function issueComments(comments, issueTitle, maxComments = -5) {
  if (comments.comments.length) {
    return [
      {
        "header": {
          "title": `<a target="_blank" href="https://issues.redhat.com/browse/${issueTitle.toUpperCase()}">${issueTitle.toUpperCase()}</a>`
        },
        "sections": [
          {
            "widgets": [
              ...comments.comments.slice(maxComments).map((comment, index) => {
                return {
                  "textParagraph": {
                    "text": `${index+1}. ${comment.body}`,
                  }
                };
              })
            ]
          },
        ]
      }
    ];
  }
  return {
    "sections": [
      {
        "widgets": [
          {
            "textParagraph": {
              "text": `No comments found for <a target="_blank" href="https://issues.redhat.com/browse/${issueTitle.toUpperCase()}">${issueTitle.toUpperCase()}</a>`
            }
          }
        ]
      }
    ]
  };
}

function getIssues(userIssues) {
  if (userIssues.length) {
    return userIssues.map(jiraDetails => messageTemplate(jiraDetails));
  }
  return jiraNotFound();
}


const messageTemplate = (jiraDetails) => {
  return {
    "sections": [
      {
        "widgets": [
          {
            "textParagraph": {
              "text": `<a target="_blank" href="https://issues.redhat.com/browse/${jiraDetails.key}">${jiraDetails.key} - ${jiraDetails.fields.summary}</a>`
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
    ]
  };
}


const jiraNotFound = () => {
return {
  "sections": [
    {
      "widgets": [
        {
          "textParagraph": {
            "text": 'JIRA not found'
          }
        }
      ]
    }
  ]
}
};