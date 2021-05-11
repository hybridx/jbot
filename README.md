# JIRA Bot 👋

A jira bot which fetches JIRA issues for you and a bunch of other stuff

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
2. Install libraries using 
```sh
npm install
```
3. Run the for development.</br>
```sh
npm run dev
```

## 🤝 Contributors

👤 **Deepesh Nair** [@hybridx](https://github.com/hybridx)
