# Gitlab Roadmap Export

Export a CSV file of all epics for a Gitlab group, by parent epic title (version.)

## Instructions

```
$ npm install
$ TOKEN=<GITLAB_PERSONAL_TOKEN> GROUP_ID=<GITLAB_GROUP_ID> [WORKING_DAYS_PER_WEEK=<INT>] node index.js roadmap_version_1 [roadmap_version_2] [...]
```

_Note: Use a `./.env` file to store env vars for credentials and configuration settings._