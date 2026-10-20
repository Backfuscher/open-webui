// Curated directory of remote MCP servers ("Browse connectors").
//
// Every endpoint, auth method and docs link was verified against the vendor's
// documentation on 2026-10-20. Only servers that speak Streamable HTTP are listed,
// because that is the only MCP transport the Open WebUI backend supports.

import type { CatalogConnector, ConnectorCategory } from './types';

// Date the endpoints and auth methods below were last checked.
export const CATALOG_VERIFIED_AT = '2026-10-20';

export const CATEGORIES: { id: ConnectorCategory; label: string }[] = [
	{ id: 'productivity', label: 'Productivity' },
	{ id: 'communication', label: 'Communication' },
	{ id: 'developer', label: 'Developer tools' },
	{ id: 'docs', label: 'Docs & knowledge' },
	{ id: 'search', label: 'Search & web' },
	{ id: 'data', label: 'Data & finance' },
	{ id: 'commerce', label: 'Payments & commerce' },
	{ id: 'design', label: 'Design & websites' }
];

export const CATALOG: CatalogConnector[] = [
	// Productivity
	{
		id: 'airtable',
		name: 'Airtable',
		publisher: 'Airtable',
		category: 'productivity',
		tagline: 'Read and write records, manage bases and comment on rows',
		description:
			'Read, create and update records in Airtable bases, change table schemas and work with record comments. Each person signs in with their own Airtable account, or an admin can connect a shared personal access token.',
		url: 'https://mcp.airtable.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Personal access token',
			keyUrl: 'https://airtable.com/create/tokens'
		},
		docsUrl: 'https://airtable.com/developers/agents/mcp/getting-started',
		examples: [
			'List the rows in my Content Calendar base that are due this week',
			'Add a record to the Leads table for Acme Corp with status Contacted',
			'Which fields does the Inventory table have, and what types are they?'
		]
	},
	{
		id: 'asana',
		name: 'Asana',
		publisher: 'Asana',
		category: 'productivity',
		tagline: 'Find, create and update tasks, projects and goals',
		description:
			'Search and manage Asana tasks, projects, goals and portfolios in plain language. Each person signs in with their own Asana account. Asana does not support dynamic client registration, so an admin must first create an MCP app in the Asana developer console.',
		url: 'https://mcp.asana.com/v2/mcp',
		auth: {
			type: 'oauth_static',
			setupUrl: 'https://app.asana.com/0/my-apps',
			serverUrl: 'https://app.asana.com'
		},
		docsUrl: 'https://developers.asana.com/docs/using-asanas-mcp-server',
		examples: [
			'What tasks are assigned to me in Asana that are due this week?',
			'Create a task in the Website Redesign project to review the new homepage copy',
			'Summarize the status of our Q4 goals and flag anything at risk'
		],
		setupNote:
			'Admin: create an MCP app in the Asana developer console, register the redirect URL shown here, and allow your workspaces under Manage distribution.'
	},
	{
		id: 'atlassian',
		name: 'Atlassian',
		publisher: 'Atlassian',
		category: 'productivity',
		tagline: 'Search and update Jira issues, Confluence pages and Compass components',
		description:
			"Work with Jira issues, Confluence pages and Compass through Atlassian's Rovo MCP server. Each person signs in with their own Atlassian account. API-key access works only after an org admin turns it on.",
		url: 'https://mcp.atlassian.com/v2/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Service account API key',
			keyUrl:
				'https://support.atlassian.com/atlassian-rovo-mcp-server/docs/configuring-authentication-via-api-token'
		},
		docsUrl:
			'https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/',
		examples: [
			'Show my open Jira issues in the PLAT project sorted by priority',
			'Create a Jira bug for the login timeout and link it to the auth epic',
			'Find the Confluence page about our on-call process and summarize it'
		],
		popular: true,
		setupNote:
			'An Atlassian org admin may need to add your Open WebUI domain in the Rovo MCP server domain settings.'
	},
	{
		id: 'box',
		name: 'Box',
		publisher: 'Box',
		category: 'productivity',
		tagline: 'Search, read and organize files, and ask Box AI about documents',
		description:
			'Search, read and organize Box files and folders, and use Box AI to answer questions about documents or extract data. Each person signs in with their own Box account. A Box admin must first enable the Box MCP server integration to get a client ID and secret.',
		url: 'https://mcp.box.com',
		auth: { type: 'oauth_static', setupUrl: 'https://developer.box.com/guides/box-mcp/remote/' },
		docsUrl: 'https://developer.box.com/guides/box-mcp/remote/',
		examples: [
			'Find the latest signed vendor contract in Box and summarize the payment terms',
			'List the files in the Marketing/2026 folder that changed this month',
			'Ask Box AI for the renewal date in the Acme master agreement'
		],
		setupNote:
			'A Box admin must enable the MCP integration in the Admin Console and register the redirect URL shown in the dialog.'
	},
	{
		id: 'clickup',
		name: 'ClickUp',
		publisher: 'ClickUp',
		category: 'productivity',
		tagline: 'Create and update tasks, docs and comments, and log time',
		description:
			'Create, search and update ClickUp tasks, docs and comments, and track time. Each person signs in with their own ClickUp account; API keys and personal tokens are not accepted.',
		url: 'https://mcp.clickup.com/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server',
		examples: [
			'What ClickUp tasks are overdue in the Engineering space?',
			'Create a task in the Sprint 42 list to fix the export bug and assign it to me',
			'Log 2 hours on the API documentation task for today'
		]
	},
	{
		id: 'dropbox',
		name: 'Dropbox',
		publisher: 'Dropbox',
		category: 'productivity',
		tagline: 'Browse, search and manage files, folders and shared links',
		description:
			'Browse, search, read and organize Dropbox files, folders and shared links. Each person signs in with their own Dropbox account. Dropbox allows dynamic registration only for a few trusted clients, so an admin must create a scoped-access app in the Dropbox App Console.',
		url: 'https://mcp.dropbox.com/mcp',
		auth: {
			type: 'oauth_static',
			setupUrl: 'https://help.dropbox.com/integrations/connect-dropbox-mcp-server'
		},
		docsUrl: 'https://help.dropbox.com/integrations/connect-dropbox-mcp-server',
		examples: [
			'Find the Q3 budget spreadsheet in my Dropbox',
			'Create a shared link for the Brand Assets folder',
			'What files were added to the Clients/Acme folder this week?'
		],
		setupNote:
			'An admin must create a Dropbox scoped-access app and register the redirect URL shown in the dialog.'
	},
	{
		id: 'google-calendar',
		name: 'Google Calendar',
		publisher: 'Google',
		category: 'productivity',
		tagline: 'Check your schedule, create events and find meeting times',
		description:
			"List, search, create and update Google Calendar events and suggest times when people are free. Each person signs in with their own Google account. The server is part of Google's Workspace Developer Preview, and an admin must create an OAuth client in Google Cloud.",
		url: 'https://calendarmcp.googleapis.com/mcp/v1',
		auth: {
			type: 'oauth_static',
			setupUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
			scope:
				'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.events.freebusy'
		},
		docsUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
		examples: [
			'What meetings do I have tomorrow?',
			'Find a 30-minute slot next week when Anna and I are both free',
			'Move my Friday 1:1 with Sam to 3 pm'
		],
		popular: true,
		setupNote:
			'Developer Preview only. An admin must create a Google Cloud OAuth client and register the redirect URL shown in the dialog.'
	},
	{
		id: 'google-drive',
		name: 'Google Drive',
		publisher: 'Google',
		category: 'productivity',
		tagline: 'Search, read, create and copy files in Google Drive',
		description:
			"Search, read, create and copy files in Google Drive. Each person signs in with their own Google account. The server is part of Google's Workspace Developer Preview, and an admin must create an OAuth client in Google Cloud.",
		url: 'https://drivemcp.googleapis.com/mcp/v1',
		auth: {
			type: 'oauth_static',
			setupUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
			scope:
				'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file'
		},
		docsUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
		examples: [
			'Find the latest version of the product roadmap doc in my Drive',
			'Summarize the meeting notes Maria shared with me yesterday',
			'Create a doc named Team offsite ideas with a short agenda outline'
		],
		setupNote:
			'Developer Preview only. An admin must create a Google Cloud OAuth client and register the redirect URL shown in the dialog.'
	},
	{
		id: 'granola',
		name: 'Granola',
		publisher: 'Granola',
		category: 'productivity',
		tagline: 'Search meeting notes and transcripts for decisions and action items',
		description:
			'Search your Granola meeting notes and transcripts and pull out decisions, action items and follow-ups. Each person signs in with their own Granola account. On the free plan, only personal notes from the last 30 days are available.',
		url: 'https://mcp.granola.ai/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://docs.granola.ai/help-center/sharing/integrations/mcp',
		examples: [
			'What action items came out of my meetings this week?',
			"Summarize what we decided about pricing in Tuesday's leadership sync",
			'Draft a follow-up email for my call with the Acme team'
		]
	},
	{
		id: 'hubspot',
		name: 'HubSpot',
		publisher: 'HubSpot',
		category: 'productivity',
		tagline: 'Look up and update contacts, companies, deals and tickets',
		description:
			'Read and update HubSpot CRM records such as contacts, companies, deals and tickets. Each person signs in with their own HubSpot account and sees only what their HubSpot permissions allow. HubSpot does not support dynamic client registration, so an admin must create an MCP connector first.',
		url: 'https://mcp.hubspot.com',
		auth: {
			type: 'oauth_static',
			setupUrl:
				'https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server'
		},
		docsUrl:
			'https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server',
		examples: [
			'Which deals in the Enterprise pipeline are expected to close this month?',
			'Show the recent activity for our contacts at Acme Corp',
			'Create a support ticket for Globex about the failed invoice sync'
		],
		setupNote:
			'An admin must create an MCP connector under Development in HubSpot and register the redirect URL shown in the dialog.'
	},
	{
		id: 'linear',
		name: 'Linear',
		publisher: 'Linear',
		category: 'productivity',
		tagline: 'Find, create and update issues, projects and cycles',
		description:
			'Search, create and update Linear issues, projects, cycles and comments. Each person signs in with their own Linear account, or an admin can connect a shared Linear API key.',
		url: 'https://mcp.linear.app/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Linear API key',
			keyUrl: 'https://linear.app/docs/mcp'
		},
		docsUrl: 'https://linear.app/docs/mcp',
		examples: [
			'What issues are assigned to me in the current cycle?',
			'Create a high-priority bug in the Mobile team for the crash on app launch',
			'Summarize the progress of the Onboarding v2 project'
		],
		popular: true
	},
	{
		id: 'miro',
		name: 'Miro',
		publisher: 'Miro',
		category: 'productivity',
		tagline: 'Read boards and create diagrams, docs, tables and sticky notes',
		description:
			'Read Miro boards and add content such as diagrams, docs, tables and sticky notes. Each person signs in with their own Miro account and picks a team during sign-in.',
		url: 'https://mcp.miro.com/',
		auth: { type: 'oauth' },
		docsUrl: 'https://developers.miro.com/docs/connecting-to-miro-mcp',
		examples: [
			'Summarize the sticky notes on our Retro board',
			'Create a flowchart of our signup process on the Product board',
			'Turn the ideas on the Brainstorm board into a prioritized table'
		]
	},
	{
		id: 'monday',
		name: 'monday.com',
		publisher: 'monday.com',
		category: 'productivity',
		tagline: 'Query and update boards, items and dashboards',
		description:
			'Query and update monday.com boards, items and dashboards. Each person signs in with their own monday.com account, or an admin can connect a personal API token.',
		url: 'https://mcp.monday.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Personal API token',
			keyUrl: 'https://developer.monday.com/api-reference/docs/integrate-with-monday-mcp'
		},
		docsUrl: 'https://developer.monday.com/api-reference/docs/integrate-with-monday-mcp',
		examples: [
			'Which items on the Marketing Campaigns board are stuck?',
			'Add an item to the Bugs board for the broken checkout button',
			'Give me a status summary of all items due this week across my boards'
		],
		setupNote: 'A monday.com account admin must approve the connection and its redirect URL.'
	},
	{
		id: 'notion',
		name: 'Notion',
		publisher: 'Notion',
		category: 'productivity',
		tagline: 'Search, create and update pages and databases',
		description:
			'Search, read, create and update pages and databases in your Notion workspace. Each person signs in with their own Notion account. On Business and Enterprise plans, a workspace owner can instead create an MCP token to share.',
		url: 'https://mcp.notion.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Notion MCP token',
			keyUrl: 'https://developers.notion.com/docs/get-started-with-mcp'
		},
		docsUrl: 'https://developers.notion.com/docs/get-started-with-mcp',
		examples: [
			'Find our Notion page about the hiring process and summarize it',
			'Add "Designing Data-Intensive Applications" to my Reading List database',
			"Create a meeting notes page for today's design review"
		],
		popular: true
	},
	{
		id: 'todoist',
		name: 'Todoist',
		publisher: 'Doist',
		category: 'productivity',
		tagline: 'Add, find, reschedule and complete tasks',
		description:
			'Add, find, reschedule and complete Todoist tasks and organize projects and sections. Each person signs in with their own Todoist account.',
		url: 'https://ai.todoist.net/mcp',
		auth: { type: 'oauth' },
		docsUrl:
			'https://www.todoist.com/help/todoist/todoist-and-ai/connect-todoist-to-an-ai-assistant-xMSzFfHng',
		examples: [
			"What's on my Todoist list for today?",
			'Add a task to call the dentist next Tuesday at 10 am',
			'Move all my overdue tasks to tomorrow'
		],
		popular: true
	},
	{
		id: 'zapier',
		name: 'Zapier',
		publisher: 'Zapier',
		category: 'productivity',
		tagline: 'Run actions across thousands of apps connected to Zapier',
		description:
			"Run actions in the apps connected to the token owner's Zapier account, such as adding spreadsheet rows or sending emails. Every action runs as that Zapier account, so Zapier recommends one token per person: keep this connector to yourself unless everyone may act as you.",
		url: 'https://mcp.zapier.com/api/v1/connect',
		auth: { type: 'bearer', keyLabel: 'Zapier MCP token', keyUrl: 'https://mcp.zapier.com' },
		docsUrl: 'https://docs.zapier.com/mcp/get-started/authentication',
		examples: [
			'Add a row to my Expenses sheet: lunch with a client, 42 EUR',
			"Email the team today's release notes through Gmail",
			'Create a Trello card for the new hire onboarding checklist'
		]
	},

	// Communication
	{
		id: 'gmail',
		name: 'Gmail',
		publisher: 'Google',
		category: 'communication',
		tagline: 'Search and read email threads, draft replies and manage labels',
		description:
			"Search and read Gmail threads, create drafts and manage labels. Each person signs in with their own Google account. The server is part of Google's Workspace Developer Preview, and an admin must create an OAuth client in Google Cloud.",
		url: 'https://gmailmcp.googleapis.com/mcp/v1',
		auth: {
			type: 'oauth_static',
			setupUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
			scope:
				'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify'
		},
		docsUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
		examples: [
			'Summarize the unread emails from my manager this week',
			'Draft a reply to the latest email from Acme accepting their proposed date',
			'Find the invoice email from our hosting provider in September'
		],
		setupNote:
			'Developer Preview only. An admin must create a Google Cloud OAuth client and register the redirect URL shown in the dialog.'
	},
	{
		id: 'google-chat',
		name: 'Google Chat',
		publisher: 'Google',
		category: 'communication',
		tagline: 'Search and read messages and post to Google Chat spaces',
		description:
			"Search and read messages in Google Chat spaces and send new ones. Each person signs in with their own Google account. The server is part of Google's Workspace Developer Preview, and an admin must create an OAuth client in Google Cloud.",
		url: 'https://chatmcp.googleapis.com/mcp/v1',
		auth: {
			type: 'oauth_static',
			setupUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
			scope:
				'https://www.googleapis.com/auth/chat.spaces.readonly https://www.googleapis.com/auth/chat.memberships.readonly https://www.googleapis.com/auth/chat.messages.readonly https://www.googleapis.com/auth/chat.messages.create https://www.googleapis.com/auth/chat.users.readstate'
		},
		docsUrl: 'https://developers.google.com/workspace/guides/configure-mcp-servers',
		examples: [
			'What did the team discuss in the Engineering space today?',
			'Post a reminder in the Launch space that the release freeze starts Friday',
			'Find the message where Priya shared the staging URL'
		],
		setupNote:
			'Developer Preview only. An admin must create a Google Cloud OAuth client and register the redirect URL shown in the dialog.'
	},
	{
		id: 'intercom',
		name: 'Intercom',
		publisher: 'Intercom',
		category: 'communication',
		tagline: 'Search conversations and contacts for customer support context',
		description:
			'Search and read Intercom conversations and contacts to get context for support work. Each person signs in with their own Intercom account, or an admin can connect an Intercom access token. This endpoint is for US-hosted workspaces; AU workspaces are not supported.',
		url: 'https://mcp.intercom.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Intercom access token',
			keyUrl: 'https://developers.intercom.com/docs/guides/mcp'
		},
		docsUrl: 'https://developers.intercom.com/docs/guides/mcp',
		examples: [
			'Summarize the open conversations tagged billing from the last 24 hours',
			'What has Acme Corp contacted support about this month?',
			'Find conversations that mention the CSV export error'
		],
		setupNote:
			'Intercom must allowlist the redirect URL shown here before OAuth works; an access token works without it.'
	},
	{
		id: 'slack',
		name: 'Slack',
		publisher: 'Slack',
		category: 'communication',
		tagline: 'Search messages, read channels and threads, and post updates',
		description:
			'Search Slack, read channels and threads, send messages and work with canvases. Each person signs in with their own Slack account. Slack does not support dynamic client registration, so an admin must create a Slack app with MCP turned on.',
		url: 'https://mcp.slack.com/mcp',
		auth: { type: 'oauth_static', setupUrl: 'https://api.slack.com/apps' },
		docsUrl: 'https://docs.slack.dev/ai/slack-mcp-server/',
		examples: [
			'Summarize what happened in #incidents yesterday',
			'Find the thread where we discussed the Q4 pricing change',
			'Post in #team-updates that the deploy is done'
		],
		popular: true,
		setupNote:
			'An admin must create an internal Slack app with MCP turned on and register the redirect URL shown in the dialog.'
	},

	// Developer tools
	{
		id: 'cloudflare-api',
		name: 'Cloudflare API',
		publisher: 'Cloudflare',
		category: 'developer',
		tagline: 'Manage Workers, DNS, R2 and the rest of the Cloudflare API',
		description:
			'Reach the full Cloudflare API, including Workers, DNS and R2, through a small set of code-mode tools. Each person signs in with their own Cloudflare account, or an admin can connect a Cloudflare API token. Tokens with client IP address filtering are not supported.',
		url: 'https://mcp.cloudflare.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Cloudflare API token',
			keyUrl:
				'https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/'
		},
		docsUrl:
			'https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/',
		examples: [
			'List the DNS records for example.com',
			'Which Workers in my account were deployed in the last week?',
			'Create an R2 bucket called invoice-archive'
		]
	},
	{
		id: 'cloudflare-browser',
		name: 'Cloudflare Browser Run',
		publisher: 'Cloudflare',
		category: 'developer',
		tagline: 'Fetch web pages as markdown and take screenshots',
		description:
			"Load web pages in Cloudflare's headless browsers and get them back as markdown or screenshots. Each person signs in with their own Cloudflare account. Some features may need a paid Workers plan.",
		url: 'https://browser.mcp.cloudflare.com/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://github.com/cloudflare/mcp-server-cloudflare/tree/main/apps/browser-rendering',
		examples: [
			'Fetch https://example.com/pricing and summarize the plans as a table',
			'Take a screenshot of the homepage at https://example.com',
			'Get the Svelte blog as markdown and list the posts from this month'
		]
	},
	{
		id: 'datadog',
		name: 'Datadog',
		publisher: 'Datadog',
		category: 'developer',
		tagline: 'Query logs, metrics, traces, monitors and incidents',
		description:
			'Query Datadog logs, metrics, traces, monitors, incidents and dashboards. Each person signs in with their own Datadog account, or an admin can connect a personal or service access token. This endpoint is for the US1 site; other Datadog sites have their own URLs.',
		url: 'https://mcp.datadoghq.com/v1/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Personal or service access token',
			keyUrl: 'https://docs.datadoghq.com/mcp_server/setup/'
		},
		docsUrl: 'https://docs.datadoghq.com/mcp_server/setup/',
		examples: [
			'Which monitors are alerting right now?',
			'Show error logs from the checkout service in the last hour',
			'What incidents did we have this week and what caused them?'
		],
		setupNote:
			'A Datadog org admin must add the redirect URL shown here under Organization Settings > MCP OAuth Redirect URLs first.'
	},
	{
		id: 'github',
		name: 'GitHub',
		publisher: 'GitHub',
		category: 'developer',
		tagline: 'Work with repos, issues, pull requests and Actions',
		description:
			"Browse repositories and work with issues, pull requests, Actions and code security alerts. An admin connects a fine-grained personal access token, and everyone who uses the connector acts with that token's permissions. GitHub does not support dynamic client registration, so one-click OAuth is not available.",
		url: 'https://api.githubcopilot.com/mcp/',
		auth: {
			type: 'bearer',
			keyLabel: 'Fine-grained personal access token',
			keyUrl: 'https://github.com/settings/personal-access-tokens'
		},
		docsUrl: 'https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md',
		examples: [
			'List open issues labeled bug in open-webui/open-webui',
			'Summarize why the latest GitHub Actions run on main failed',
			'Create an issue in my dotfiles repo to update the zsh config'
		],
		popular: true
	},
	{
		id: 'gitlab',
		name: 'GitLab',
		publisher: 'GitLab',
		category: 'developer',
		tagline: 'Work with projects, issues, merge requests and pipelines',
		description:
			'Query and act on GitLab.com projects, issues, merge requests and pipelines. Each person signs in with their own GitLab account, or an admin can connect a fine-grained personal access token with MCP permission. Self-managed GitLab instances use their own endpoint.',
		url: 'https://gitlab.com/api/v4/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Fine-grained personal access token',
			keyUrl: 'https://docs.gitlab.com/user/model_context_protocol/mcp_server/'
		},
		docsUrl: 'https://docs.gitlab.com/user/model_context_protocol/mcp_server/',
		examples: [
			'Which merge requests are waiting for my review?',
			'Why did the latest pipeline on main fail?',
			'Open an issue in the backend project about the slow search endpoint'
		]
	},
	{
		id: 'grafana-cloud',
		name: 'Grafana Cloud',
		publisher: 'Grafana Labs',
		category: 'developer',
		tagline: 'Query dashboards, metrics, logs, alerts and incidents',
		description:
			'Query Grafana Cloud dashboards, metrics, logs, alerts and incidents. Each person signs in with their own Grafana Cloud account. Works with Grafana Cloud only, and service account tokens are not supported.',
		url: 'https://mcp.grafana.com/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://grafana.com/docs/grafana-cloud/ai-tools/mcp-servers/cloud-mcp/',
		examples: [
			'Which alerts are firing in production right now?',
			'Show the p95 latency of the API service over the last 24 hours',
			'Find the dashboard for the payments service and summarize its panels'
		]
	},
	{
		id: 'grep',
		name: 'Grep by Vercel',
		publisher: 'Vercel',
		category: 'developer',
		tagline: 'Search code across a million public GitHub repositories',
		description:
			'Search code in about a million public GitHub repositories by pattern or regular expression. No sign-in needed. Useful for finding real-world examples of how an API is used.',
		url: 'https://mcp.grep.app',
		auth: { type: 'none' },
		docsUrl: 'https://vercel.com/blog/grep-a-million-github-repositories-via-mcp',
		examples: [
			'Find examples of useSyncExternalStore used with a selector function',
			'Search public repos for Dockerfiles that use node:22-alpine with pnpm',
			'How do other projects configure vite-plugin-pwa in SvelteKit?'
		]
	},
	{
		id: 'huggingface',
		name: 'Hugging Face',
		publisher: 'Hugging Face',
		category: 'developer',
		tagline: 'Search models, datasets, Spaces and papers on the Hugging Face Hub',
		description:
			'Search Hub models, datasets, Spaces, papers and documentation, and run tools from Gradio Spaces. Works without sign-in with a smaller tool set; an admin can add a Hugging Face access token for full access.',
		url: 'https://huggingface.co/mcp',
		auth: { type: 'none' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Hugging Face access token',
			keyUrl: 'https://huggingface.co/settings/tokens'
		},
		docsUrl: 'https://huggingface.co/docs/hub/agents-mcp',
		examples: [
			'Find the most downloaded text-to-speech models that support German',
			'What datasets exist for German legal text classification?',
			'Summarize the latest papers on speculative decoding'
		],
		popular: true
	},
	{
		id: 'neon',
		name: 'Neon',
		publisher: 'Neon',
		category: 'developer',
		tagline: 'Manage Postgres projects and branches, and run SQL and migrations',
		description:
			'Manage Neon serverless Postgres projects and branches, run SQL and prepare migrations. Each person signs in with their own Neon account, or an admin can connect a Neon API key.',
		url: 'https://mcp.neon.tech/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Neon API key',
			keyUrl: 'https://neon.com/docs/ai/neon-mcp-server'
		},
		docsUrl: 'https://neon.com/docs/ai/neon-mcp-server',
		examples: [
			'List my Neon projects and their branches',
			'Create a branch of the production database called feature-search',
			'Show the 10 most recent rows in the orders table'
		]
	},
	{
		id: 'netlify',
		name: 'Netlify',
		publisher: 'Netlify',
		category: 'developer',
		tagline: 'Create, deploy and manage sites, builds and environment settings',
		description:
			'Create and deploy Netlify sites and manage builds, environment variables and site settings. Each person signs in with their own Netlify account.',
		url: 'https://netlify-mcp.netlify.app/mcp',
		auth: { type: 'oauth' },
		docsUrl:
			'https://docs.netlify.com/build/build-with-ai/agent-setup-guides/agent-setup-overview/#mcp-server-support',
		examples: [
			'Show the status of the latest deploy of my blog site',
			'Set the API_URL environment variable for the production context',
			'Why did the last build of the docs site fail?'
		]
	},
	{
		id: 'planetscale',
		name: 'PlanetScale',
		publisher: 'PlanetScale',
		category: 'developer',
		tagline: 'Explore databases, branches, schemas and query insights',
		description:
			'Explore PlanetScale databases, branches and schemas, and review query insights. Each person signs in with their own PlanetScale account, or an admin can connect a service token.',
		url: 'https://mcp.pscale.dev/mcp/planetscale',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Service token',
			keyUrl: 'https://planetscale.com/docs/mcp/service-token'
		},
		docsUrl: 'https://planetscale.com/docs/mcp-server',
		examples: [
			'Which queries on the main branch were the slowest this week?',
			'Show the schema of the users table in the app database',
			'List the branches of the inventory database'
		]
	},
	{
		id: 'posthog',
		name: 'PostHog',
		publisher: 'PostHog',
		category: 'developer',
		tagline: 'Query product analytics, feature flags, experiments and errors',
		description:
			'Query PostHog product analytics and work with feature flags, experiments and error tracking. Each person signs in with their own PostHog account and lands in the right US or EU region, or an admin can connect a personal API key.',
		url: 'https://mcp.posthog.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Personal API key (MCP Server preset)',
			keyUrl: 'https://posthog.com/docs/model-context-protocol'
		},
		docsUrl: 'https://posthog.com/docs/model-context-protocol',
		examples: [
			'How many users signed up each day last week?',
			'Which feature flags are rolled out to less than 100% of users?',
			'What are the most frequent errors in the last 24 hours?'
		]
	},
	{
		id: 'postman',
		name: 'Postman',
		publisher: 'Postman',
		category: 'developer',
		tagline: 'Work with workspaces, collections, environments and mocks',
		description:
			'Manage Postman workspaces, collections, environments, API specs and mock servers. Each person signs in with their own Postman account, or an admin can connect a Postman API key. Connects to the minimal tool set.',
		url: 'https://mcp.postman.com/minimal',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Postman API key',
			keyUrl: 'https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/overview/'
		},
		docsUrl: 'https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/overview/',
		examples: [
			'List the collections in my team workspace',
			'Add a GET /health request to the Payments API collection',
			'Create a staging environment with base_url set to https://staging.example.com'
		]
	},
	{
		id: 'prisma',
		name: 'Prisma',
		publisher: 'Prisma',
		category: 'developer',
		tagline: 'Manage Prisma Postgres databases, deployments and storage',
		description:
			'Manage Prisma Postgres databases, Compute deployments and Object Storage. Each person signs in with their own Prisma account and picks a workspace.',
		url: 'https://mcp.prisma.io/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://www.prisma.io/docs/ai/tools/mcp-server',
		examples: [
			'Create a new Prisma Postgres database called analytics',
			'List the databases in my workspace and their regions',
			'Show the recent deployments of my app on Prisma Compute'
		]
	},
	{
		id: 'railway',
		name: 'Railway',
		publisher: 'Railway',
		category: 'developer',
		tagline: 'Create, deploy and debug projects, services and variables',
		description:
			'Create, deploy and debug Railway projects, services and environment variables. Each person signs in with their own Railway account; project tokens are not accepted.',
		url: 'https://mcp.railway.com',
		auth: { type: 'oauth' },
		docsUrl: 'https://docs.railway.com/ai/mcp-server',
		examples: [
			'Why did the latest deploy of the api service fail?',
			'Show the logs of the worker service from the last hour',
			'Add a Postgres database to my side-project'
		]
	},
	{
		id: 'render',
		name: 'Render',
		publisher: 'Render',
		category: 'developer',
		tagline: 'Manage services and databases, and view logs and metrics',
		description:
			"Manage Render services and databases, view logs and metrics, and run database queries. An admin connects a Render API key, and everyone who uses the connector shares it. Render's OAuth is limited to pre-registered clients.",
		url: 'https://mcp.render.com/mcp',
		auth: {
			type: 'bearer',
			keyLabel: 'Render API key',
			keyUrl: 'https://render.com/docs/mcp-server'
		},
		docsUrl: 'https://render.com/docs/mcp-server',
		examples: [
			'List my Render services and their current status',
			'Show the error logs of the web service from the last 30 minutes',
			'What was the CPU usage of the worker service yesterday?'
		]
	},
	{
		id: 'sentry',
		name: 'Sentry',
		publisher: 'Sentry',
		category: 'developer',
		tagline: 'Investigate errors, issues, traces and releases',
		description:
			'Look into Sentry errors, issues, traces and releases, and get suggestions for fixes. Each person signs in with their own Sentry account.',
		url: 'https://mcp.sentry.dev/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://mcp.sentry.dev/',
		examples: [
			'What are the top unresolved issues in the frontend project this week?',
			'Explain the stack trace of the latest TypeError in production',
			'Which release introduced the spike in checkout errors?'
		],
		popular: true
	},
	{
		id: 'supabase',
		name: 'Supabase',
		publisher: 'Supabase',
		category: 'developer',
		tagline: 'Run SQL, apply migrations, view logs and deploy edge functions',
		description:
			'Manage Supabase projects: run SQL, apply migrations, read logs and deploy edge functions. Each person signs in with their own Supabase account, or an admin can connect a personal access token.',
		url: 'https://mcp.supabase.com/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Personal access token',
			keyUrl: 'https://supabase.com/docs/guides/ai-tools/mcp'
		},
		docsUrl: 'https://supabase.com/docs/guides/ai-tools/mcp',
		examples: [
			'List the tables in my production project and their row counts',
			'Write and apply a migration that adds a created_at column to profiles',
			'Show the API error logs from the last hour'
		]
	},

	// Docs & knowledge
	{
		id: 'astro-docs',
		name: 'Astro Docs',
		publisher: 'Astro',
		category: 'docs',
		tagline: 'Search the current Astro framework documentation',
		description:
			'Search the current documentation of the Astro web framework. No sign-in needed. Free and run by the Astro project.',
		url: 'https://mcp.docs.astro.build/mcp',
		auth: { type: 'none' },
		docsUrl: 'https://docs.astro.build/en/guides/build-with-ai/',
		examples: [
			'How do I add a content collection with a Zod schema in Astro?',
			'What is the difference between server islands and client islands?',
			'How do I deploy an Astro site to Cloudflare?'
		]
	},
	{
		id: 'aws-knowledge',
		name: 'AWS Knowledge',
		publisher: 'Amazon Web Services',
		category: 'docs',
		tagline: 'Search AWS docs, API references and regional availability',
		description:
			'Search AWS documentation, API references, best practices and regional availability. No sign-in or AWS account needed; rate limits apply.',
		url: 'https://knowledge-mcp.global.api.aws',
		auth: { type: 'none' },
		docsUrl: 'https://awslabs.github.io/mcp/servers/aws-knowledge-mcp-server',
		examples: [
			'Is Amazon Bedrock available in eu-central-1?',
			'What are the best practices for least-privilege S3 bucket policies?',
			'Which parameters does the Lambda UpdateFunctionConfiguration API take?'
		]
	},
	{
		id: 'cloudflare-docs',
		name: 'Cloudflare Docs',
		publisher: 'Cloudflare',
		category: 'docs',
		tagline: "Search Cloudflare's developer documentation",
		description: 'Search up-to-date Cloudflare developer documentation. No sign-in needed.',
		url: 'https://docs.mcp.cloudflare.com/mcp',
		auth: { type: 'none' },
		docsUrl:
			'https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/',
		examples: [
			'How do I bind an R2 bucket to a Worker?',
			'What are the CPU time limits for Workers on the free plan?',
			'How do Durable Objects keep storage consistent?'
		]
	},
	{
		id: 'context7',
		name: 'Context7',
		publisher: 'Upstash',
		category: 'docs',
		tagline: 'Pull current, version-specific library docs and code examples',
		description:
			'Fetch current, version-specific documentation and code examples for popular libraries and frameworks. Works without sign-in at lower rate limits; an admin can add a Context7 API key for higher limits.',
		url: 'https://mcp.context7.com/mcp',
		auth: { type: 'none' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Context7 API key',
			keyUrl: 'https://context7.com/dashboard'
		},
		docsUrl: 'https://context7.com/docs/resources/all-clients',
		examples: [
			'Use Context7 to show how routing works in SvelteKit 2',
			'What is the current way to define a tool with the Vercel AI SDK?',
			'Show a FastAPI dependency that yields an async database session'
		],
		popular: true
	},
	{
		id: 'deepwiki',
		name: 'DeepWiki',
		publisher: 'Cognition',
		category: 'docs',
		tagline: 'Ask questions about any public GitHub repository',
		description:
			"Ask questions about any public GitHub repository using DeepWiki's AI-generated documentation. No sign-in needed; private repositories are not supported.",
		url: 'https://mcp.deepwiki.com/mcp',
		auth: { type: 'none' },
		docsUrl: 'https://docs.devin.ai/work-with-devin/deepwiki-mcp',
		examples: [
			'How does open-webui/open-webui connect to MCP tool servers?',
			'Explain the architecture of the sveltejs/kit repository',
			'Where is request routing implemented in fastapi/fastapi?'
		],
		popular: true
	},
	{
		id: 'langchain-docs',
		name: 'LangChain Docs',
		publisher: 'LangChain',
		category: 'docs',
		tagline: 'Search LangChain, LangGraph and LangSmith documentation',
		description:
			'Search the documentation for LangChain, LangGraph and LangSmith. No sign-in needed.',
		url: 'https://docs.langchain.com/mcp',
		auth: { type: 'none' },
		docsUrl: 'https://docs.langchain.com/use-these-docs',
		examples: [
			'How do I add memory to a LangGraph agent?',
			'How do I trace a custom function in LangSmith?',
			'Show how to stream tokens from a LangChain chat model'
		]
	},
	{
		id: 'microsoft-learn',
		name: 'Microsoft Learn',
		publisher: 'Microsoft',
		category: 'docs',
		tagline: 'Search official Microsoft and Azure docs and code samples',
		description:
			'Search and fetch official Microsoft and Azure documentation and code samples from Microsoft Learn. No sign-in needed, and free to use.',
		url: 'https://learn.microsoft.com/api/mcp',
		auth: { type: 'none' },
		docsUrl: 'https://learn.microsoft.com/en-us/training/support/mcp',
		examples: [
			'How do I set up a managed identity for an Azure Function?',
			'Show a C# sample that uploads a file to Azure Blob Storage',
			'What are the limits of Azure Container Apps on the consumption plan?'
		]
	},
	{
		id: 'svelte',
		name: 'Svelte',
		publisher: 'Svelte',
		category: 'docs',
		tagline: 'Look up Svelte and SvelteKit docs and fix component code',
		description:
			'Look up Svelte and SvelteKit documentation and run an autofixer that checks Svelte components. No sign-in needed; the Svelte team says it does not log or store code sent to the server.',
		url: 'https://mcp.svelte.dev/mcp',
		auth: { type: 'none' },
		docsUrl: 'https://svelte.dev/docs/ai/remote-setup',
		examples: [
			'How do I migrate a component from export let to $props()?',
			'When should I use $derived instead of $effect in Svelte 5?',
			'How do form actions work in SvelteKit?'
		]
	},

	// Search & web
	{
		id: 'apify',
		name: 'Apify',
		publisher: 'Apify',
		category: 'search',
		tagline: 'Run ready-made scrapers for websites, social media and maps',
		description:
			'Run Apify Actors to scrape websites, social media, maps and more, and get the results back in the chat. Each person signs in with their own Apify account, or an admin can connect an Apify API token.',
		url: 'https://mcp.apify.com',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Apify API token',
			keyUrl: 'https://docs.apify.com/platform/integrations/mcp'
		},
		docsUrl: 'https://docs.apify.com/platform/integrations/mcp',
		examples: [
			'Scrape the top 20 Google Maps results for coffee shops in Berlin Mitte',
			'Find an Actor that collects job listings and run it for data engineer roles',
			'Get the titles and prices of the first 50 products on example.com/shop'
		]
	},
	{
		id: 'exa',
		name: 'Exa',
		publisher: 'Exa',
		category: 'search',
		tagline: "Search the web and fetch pages with Exa's neural search",
		description:
			"Search the web and fetch page contents with Exa's neural search. Works without a key at free rate limits; an admin can add an Exa API key for higher limits and multi-step research.",
		url: 'https://mcp.exa.ai/mcp',
		auth: { type: 'none' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Exa API key',
			keyUrl: 'https://dashboard.exa.ai'
		},
		docsUrl: 'https://exa.ai/docs/reference/exa-mcp',
		examples: [
			'Find recent blog posts comparing Postgres and ClickHouse for analytics',
			'Search for startups building AI tools for accountants in Europe',
			'Fetch https://example.com/blog/launch and summarize it'
		]
	},
	{
		id: 'firecrawl',
		name: 'Firecrawl',
		publisher: 'Firecrawl',
		category: 'search',
		tagline: 'Scrape, search and crawl web pages into clean markdown',
		description:
			'Scrape, search, crawl and parse web pages into clean markdown. Search, scrape and parse work without a key at lower rate limits; an admin can add a Firecrawl API key to unlock crawling and the other tools.',
		url: 'https://mcp.firecrawl.dev/v2/mcp',
		auth: { type: 'none' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Firecrawl API key',
			keyUrl: 'https://www.firecrawl.dev/app/api-keys'
		},
		docsUrl: 'https://docs.firecrawl.dev/mcp-server',
		examples: [
			'Scrape https://example.com/pricing and turn the plans into a table',
			'Search the web for the latest Node.js LTS release notes',
			'Crawl https://docs.example.com and list every page about authentication'
		]
	},
	{
		id: 'jina',
		name: 'Jina AI',
		publisher: 'Jina AI',
		category: 'search',
		tagline: 'Read URLs, search the web and capture page screenshots',
		description:
			'Read web pages as clean text, search the web, capture screenshots and rerank results with Jina AI. An admin connects a Jina API key, which the search tools require; free keys are available.',
		url: 'https://mcp.jina.ai/v1',
		auth: { type: 'bearer', keyLabel: 'Jina API key', keyUrl: 'https://jina.ai' },
		docsUrl: 'https://github.com/jina-ai/MCP',
		examples: [
			'Read https://example.com/article and give me the key points',
			'Search the web for reviews of the Framework Laptop 16',
			'Take a screenshot of https://example.com'
		]
	},
	{
		id: 'parallel',
		name: 'Parallel Search',
		publisher: 'Parallel',
		category: 'search',
		tagline: 'Free web search and page fetching built for agents',
		description:
			"Search the web and fetch pages with Parallel's search, which is built for AI agents. Free to use without sign-in; an admin can add a Parallel API key for higher limits.",
		url: 'https://search.parallel.ai/mcp',
		auth: { type: 'none' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Parallel API key',
			keyUrl: 'https://docs.parallel.ai/integrations/mcp/search-mcp'
		},
		docsUrl: 'https://docs.parallel.ai/integrations/mcp/search-mcp',
		examples: [
			'Find the latest news on EU AI Act enforcement',
			'Compare the pricing pages of Vercel and Netlify',
			'Find three recent sources on heat pump subsidies in Germany'
		]
	},
	{
		id: 'perplexity',
		name: 'Perplexity',
		publisher: 'Perplexity',
		category: 'search',
		tagline: "Search, ask and research with Perplexity's Sonar models",
		description:
			"Run web searches, ask questions and do deeper research with Perplexity's Sonar API. Each person signs in with their own Perplexity account, or an admin can connect a Perplexity API key. There is no free keyless mode.",
		url: 'https://api.perplexity.ai/mcp',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Perplexity API key',
			keyUrl: 'https://console.perplexity.ai'
		},
		docsUrl: 'https://docs.perplexity.ai/docs/getting-started/integrations/mcp-server',
		examples: [
			'Research the current state of solid-state batteries and cite sources',
			'What changed in the latest Kubernetes release?',
			'Compare the top three password managers for families'
		]
	},
	{
		id: 'serpapi',
		name: 'SerpApi',
		publisher: 'SerpApi',
		category: 'search',
		tagline: 'Get structured results from Google and other search engines',
		description:
			'Get structured results from Google and other search engines through SerpApi. An admin connects a SerpApi API key, and everyone who uses the connector shares it.',
		url: 'https://mcp.serpapi.com/mcp',
		auth: {
			type: 'bearer',
			keyLabel: 'SerpApi API key',
			keyUrl: 'https://serpapi.com/manage-api-key'
		},
		docsUrl: 'https://serpapi.com/integrations/mcp',
		examples: [
			'What are the top Google results for best standing desk 2026?',
			'Show Google News headlines about the European Central Bank today',
			'Find flights from Berlin to Lisbon next Friday on Google Flights'
		]
	},
	{
		id: 'tavily',
		name: 'Tavily',
		publisher: 'Tavily',
		category: 'search',
		tagline: 'Real-time web search, extraction and crawling for AI agents',
		description:
			'Search the web in real time and extract, crawl or map websites with Tavily. Each person signs in with their own Tavily account, or an admin can connect a Tavily API key.',
		url: 'https://mcp.tavily.com/mcp/',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Tavily API key',
			keyUrl: 'https://app.tavily.com'
		},
		docsUrl: 'https://docs.tavily.com/documentation/mcp',
		examples: [
			'Search for the latest news on the Mars Sample Return mission',
			'Extract the main content from https://example.com/report',
			'Map all pages under https://docs.example.com'
		]
	},

	// Data & finance
	{
		id: 'alphavantage',
		name: 'Alpha Vantage',
		publisher: 'Alpha Vantage',
		category: 'data',
		tagline: 'Stock, forex, crypto, fundamentals and economic data',
		description:
			'Get stock prices, forex and crypto rates, company fundamentals and economic indicators from Alpha Vantage. Each person signs in by entering their free Alpha Vantage API key on the sign-in page.',
		url: 'https://mcp.alphavantage.co/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://mcp.alphavantage.co/',
		examples: [
			"What was Apple's closing price each day last week?",
			"Show Microsoft's quarterly revenue for the last two years",
			'What is the current EUR to USD exchange rate?'
		]
	},
	{
		id: 'coingecko',
		name: 'CoinGecko',
		publisher: 'CoinGecko',
		category: 'data',
		tagline: 'Crypto prices, market data and coin and exchange info',
		description:
			"Look up crypto prices, market data and details about coins and exchanges. Uses CoinGecko's public endpoint, so no sign-in is needed; requests are rate-limited.",
		url: 'https://mcp.api.coingecko.com/mcp',
		auth: { type: 'none' },
		docsUrl: 'https://docs.coingecko.com/reference/mcp-server',
		examples: [
			'What are Bitcoin and Ethereum trading at in euros right now?',
			'Which coins gained the most in the last 24 hours?',
			'Show the 24-hour trading volume of the top 5 exchanges'
		]
	},

	// Payments & commerce
	{
		id: 'stripe',
		name: 'Stripe',
		publisher: 'Stripe',
		category: 'commerce',
		tagline: 'Manage customers, payments, invoices and subscriptions',
		description:
			'Read and manage Stripe customers, payments, invoices, products and subscriptions, and search the Stripe docs. Each person signs in with their own Stripe account, or an admin can connect a Stripe Agent API key. From December 2026, other secret and restricted keys are rejected.',
		url: 'https://mcp.stripe.com',
		auth: { type: 'oauth' },
		alternativeAuth: {
			type: 'bearer',
			keyLabel: 'Agent API key',
			keyUrl: 'https://docs.stripe.com/mcp'
		},
		docsUrl: 'https://docs.stripe.com/mcp',
		examples: [
			'How much revenue did we make last month?',
			'List the subscriptions that failed to renew this week',
			'Create a 20% off coupon called WINTER20'
		],
		popular: true
	},

	// Design & websites
	{
		id: 'canva',
		name: 'Canva',
		publisher: 'Canva',
		category: 'design',
		tagline: 'Generate, edit, resize and export designs from chat',
		description:
			'Generate, edit, search, resize and export Canva designs from a chat. Each person signs in with their own Canva account. Canva does not support dynamic client registration for this endpoint, so an admin must create an app in the Canva Developer Portal.',
		url: 'https://api.canva.com/connect/v1/mcp',
		auth: { type: 'oauth_static', setupUrl: 'https://www.canva.com/developers/apps' },
		docsUrl: 'https://www.canva.dev/docs/apps/mcp/access/',
		examples: [
			'Create an Instagram post announcing our summer sale',
			'Resize my Conference Poster design for a LinkedIn banner',
			'Export the Q3 Review presentation as a PDF'
		],
		setupNote:
			'An admin must create a Canva Developer Portal app with MCP turned on and register the redirect URL shown in the dialog.'
	},
	{
		id: 'webflow',
		name: 'Webflow',
		publisher: 'Webflow',
		category: 'design',
		tagline: 'Manage sites, CMS collections, pages and publishing',
		description:
			'Manage Webflow sites, CMS collections and pages, and publish changes. Each person signs in with their own Webflow account.',
		url: 'https://mcp.webflow.com/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://developers.webflow.com/mcp/reference/getting-started',
		examples: [
			'List the items in the Blog Posts collection that are still drafts',
			'Update the SEO title of the About page',
			'Publish the latest changes to the marketing site'
		]
	},
	{
		id: 'wix',
		name: 'Wix',
		publisher: 'Wix',
		category: 'design',
		tagline: 'Manage sites, stores, bookings and CMS data, and search Wix docs',
		description:
			'Manage Wix sites, stores, bookings and CMS data, and search the Wix developer docs. Each person signs in with their own Wix account.',
		url: 'https://mcp.wix.com/mcp',
		auth: { type: 'oauth' },
		docsUrl: 'https://dev.wix.com/docs/sdk/articles/use-the-wix-mcp/about-the-wix-mcp',
		examples: [
			"Show this week's orders from my Wix store",
			'Add a product called Linen Tote Bag priced at 25 EUR',
			'Which booking slots are still free on Saturday?'
		]
	}
];
