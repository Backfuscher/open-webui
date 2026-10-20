// Connector directory types. The catalog lists remote MCP servers that the
// Open WebUI backend can reach over Streamable HTTP.

export type ConnectorCategory =
	| 'productivity'
	| 'communication'
	| 'developer'
	| 'docs'
	| 'search'
	| 'data'
	| 'commerce'
	| 'design';

export type ConnectorAuth =
	// No sign-in needed.
	| { type: 'none' }
	// OAuth 2.1 with dynamic client registration: one click, each user signs in.
	| { type: 'oauth'; scope?: string }
	// OAuth with a client the admin registers at the provider (client id + secret).
	| { type: 'oauth_static'; setupUrl: string; serverUrl?: string; scope?: string }
	// API key sent as "Authorization: Bearer <key>", shared by everyone who can use it.
	| { type: 'bearer'; keyLabel: string; keyUrl: string };

export type CatalogConnector = {
	// Stable slug, also the default connection id.
	id: string;
	name: string;
	publisher: string;
	category: ConnectorCategory;
	// One line for cards, max 80 chars.
	tagline: string;
	// Two or three sentences for the detail view.
	description: string;
	// Streamable HTTP endpoint, exactly as documented by the vendor.
	url: string;
	auth: ConnectorAuth;
	// Optional second way to connect, e.g. an API key instead of OAuth.
	alternativeAuth?: ConnectorAuth;
	docsUrl: string;
	// Prompts a user can try once connected.
	examples: string[];
	popular?: boolean;
	// Short caveat shown before connecting, e.g. "Workspace admin must approve".
	setupNote?: string;
};
