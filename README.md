# JIRA Bot 👋
[![Deploy to Prod](https://github.com/associate-run-projects/jbot/actions/workflows/google.yml/badge.svg?branch=main)](https://github.com/associate-run-projects/jbot/actions/workflows/google.yml)

A bot that retrieves the JIRA issue details from your JIRA server.

## Usage (Commands)

- @jirabot issue-1 issue-2
  - This will fetch both issue-1 and issue-2 from the jira API configured in the .env file

## Run the sample locally
  
1. Set up the .env file with the following values
- example
```
PORT=8080
JIRA_HOST=developer.atlassian.com
JIRA_USER=serviceAccount
JIRA_PASS=serviceAccountPassword
```
2. Installation
```sh
npm install
```
3. Run on development env
```sh
npm run dev
```

## 🤝 Contributors

👤 **Deepesh Nair** [@hybridx](https://github.com/hybridx)
