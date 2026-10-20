// Create, verify and remove MCP connections from the Connectors page.
//
// MCP servers live in the admin-managed list `tool_server.connections`, which the
// backend replaces as a whole on save. Every write therefore re-reads the list
// first and changes only the one entry.

import { get } from 'svelte/store';

import { settings, tools, user } from '$lib/stores';
import { getTools } from '$lib/apis/tools';
import { deleteOAuthSession } from '$lib/apis/auths';
import { updateUserSettings } from '$lib/apis/users';
import {
	getToolServerConnections,
	initiateOAuthRedirect,
	registerOAuthClient,
	setToolServerConnections,
	verifyToolServerConnection
} from '$lib/apis/configs';
import { slugify } from '$lib/utils';

import type { ConnectorAuth } from './types';

export type Audience = 'me' | 'everyone';
export type AuthType = ConnectorAuth['type'];

export type NewConnector = {
	name: string;
	description?: string;
	url: string;
	auth: AuthType;
	audience: Audience;
	catalogId?: string;
	// Chosen up front when the redirect URL must be shown before saving.
	connectionId?: string;
	// bearer
	key?: string;
	// oauth_static
	clientId?: string;
	clientSecret?: string;
	serverUrl?: string;
	scope?: string;
};

// Set before an OAuth redirect so the app returns to /connectors afterwards.
export const RETURN_FLAG = 'connectors:return';

const token = () => localStorage.token;

const AUTH_TYPE_MAP: Record<AuthType, string> = {
	none: 'none',
	bearer: 'bearer',
	oauth: 'oauth_2.1',
	oauth_static: 'oauth_2.1_static'
};

export const toolIdOf = (connectionId: string) => `server:mcp:${connectionId}`;
export const connectionIdOf = (toolId: string) => toolId.replace(/^server:mcp:/, '');

export const redirectUrlFor = (origin: string, connectionId: string) =>
	`${origin.replace(/\/$/, '')}/oauth/clients/mcp:${connectionId}/callback`;

const EVERYONE_GRANT = { principal_type: 'user', principal_id: '*', permission: 'read' };

const accessGrants = (audience: Audience) => {
	if (audience === 'everyone') return [EVERYONE_GRANT];
	const userId = get(user)?.id;
	if (!userId) throw 'Your session is not loaded yet. Reload the page and try again.';
	return [{ principal_type: 'user', principal_id: userId, permission: 'read' }];
};

export const audienceOf = (connection: any): Audience =>
	(connection?.config?.access_grants ?? []).some(
		(g: any) => g?.principal_type === 'user' && g?.principal_id === '*'
	)
		? 'everyone'
		: 'me';

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

// Ids are `<catalog id>-<suffix>` for directory entries and `custom-<slug>-<suffix>`
// otherwise. A fresh suffix keeps ids unique even after a server is removed, so stale
// per-user OAuth sessions for a removed server are never reused.
export const newConnectionId = (catalogId: string | undefined, name: string) => {
	if (catalogId) return `${catalogId}-${randomSuffix()}`;
	const slug =
		slugify(name)
			.replace(/[^a-z0-9-_]/g, '')
			.slice(0, 32) || 'connector';
	return `custom-${slug}-${randomSuffix()}`;
};

// Keeps the id (and so the OAuth redirect URL) stable while a form is reopened,
// until the connector is saved.
const pendingIds = new Map<string, string>();

export const pendingConnectionId = (catalogId: string | undefined, name: string) => {
	const key = catalogId ?? `custom:${name}`;
	if (!pendingIds.has(key)) pendingIds.set(key, newConnectionId(catalogId, name));
	return pendingIds.get(key) as string;
};

// The API helpers return null instead of throwing on network errors and non-JSON
// error pages. Treating that as an empty list would make the next save wipe every
// tool server, so refuse to continue instead.
const loadConnections = async (): Promise<any[]> => {
	const res = await getToolServerConnections(token());
	if (!Array.isArray(res?.TOOL_SERVER_CONNECTIONS)) {
		throw 'Could not load the current connections. Nothing was changed.';
	}
	return res.TOOL_SERVER_CONNECTIONS;
};

const saveConnections = async (connections: any[]) => {
	const res = await setToolServerConnections(token(), { TOOL_SERVER_CONNECTIONS: connections });
	if (!Array.isArray(res?.TOOL_SERVER_CONNECTIONS)) {
		throw 'Saving the connections failed.';
	}
};

const isMcp = (connection: any, connectionId: string) =>
	connection?.type === 'mcp' && connection?.info?.id === connectionId;

export const refreshTools = async () => {
	tools.set(await getTools(token()));
};

const buildConnection = (
	connector: NewConnector,
	connectionId: string,
	oauthClientInfo?: string
) => {
	const isOAuth = connector.auth === 'oauth' || connector.auth === 'oauth_static';

	return {
		type: 'mcp',
		url: connector.url.trim(),
		spec_type: 'url',
		spec: '',
		path: 'openapi.json',
		auth_type: AUTH_TYPE_MAP[connector.auth],
		key: connector.auth === 'bearer' ? (connector.key ?? '').trim() : '',
		config: {
			enable: true,
			function_name_filter_list: '',
			access_grants: accessGrants(connector.audience)
		},
		info: {
			id: connectionId,
			name: connector.name.trim(),
			description: (connector.description ?? '').trim(),
			...(connector.catalogId ? { catalog_id: connector.catalogId } : {}),
			...(isOAuth
				? {
						oauth_resource_parameter: 'auto',
						...(connector.scope ? { oauth_scope: connector.scope } : {}),
						...(oauthClientInfo ? { oauth_client_info: oauthClientInfo } : {})
					}
				: {}),
			...(connector.auth === 'oauth_static'
				? {
						oauth_client_id: (connector.clientId ?? '').trim(),
						oauth_client_secret: (connector.clientSecret ?? '').trim(),
						oauth_server_url: (connector.serverUrl ?? '').trim()
					}
				: {})
		}
	};
};

const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
	Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(message), ms))]);

// Connects to a no-auth or API-key server and returns its tool names.
export const testConnection = async (connector: NewConnector): Promise<string[]> => {
	const res = await withTimeout(
		verifyToolServerConnection(token(), buildConnection(connector, 'connection-test')),
		30000,
		'The server did not answer within 30 seconds.'
	);
	if (res?.status !== true || !Array.isArray(res?.specs)) {
		throw 'Could not reach the Open WebUI server.';
	}
	return res.specs.map((spec: any) => spec.name);
};

export type DetectedAuth = { auth: AuthType; tools?: string[] };

// Guesses how a server signs in, like Claude's custom connector form:
// a working no-auth connection wins, then OAuth discovery, else an API key.
export const detectAuth = async (name: string, url: string): Promise<DetectedAuth> => {
	const base: NewConnector = { name, url, auth: 'none', audience: 'me' };

	try {
		return { auth: 'none', tools: await testConnection(base) };
	} catch {
		// Fall through to OAuth discovery.
	}

	try {
		const res = await withTimeout(
			verifyToolServerConnection(token(), buildConnection({ ...base, auth: 'oauth' }, 'probe')),
			30000,
			'timeout'
		);
		if (res?.status !== true) throw 'no discovery';
		return { auth: 'oauth' };
	} catch {
		return { auth: 'bearer' };
	}
};

// Saves a new connection and returns its tool id (`server:mcp:<id>`).
export const addConnector = async (connector: NewConnector): Promise<string> => {
	const connectionId =
		connector.connectionId ?? newConnectionId(connector.catalogId, connector.name);

	let oauthClientInfo: string | undefined;
	if (connector.auth === 'oauth' || connector.auth === 'oauth_static') {
		const res = await registerOAuthClient(
			token(),
			{
				url: connector.url.trim(),
				client_id: connectionId,
				...(connector.scope ? { oauth_scope: connector.scope } : {}),
				...(connector.auth === 'oauth_static'
					? {
							client_secret: (connector.clientSecret ?? '').trim(),
							...(connector.serverUrl ? { oauth_server_url: connector.serverUrl.trim() } : {})
						}
					: {})
			},
			'mcp'
		);
		oauthClientInfo = res?.oauth_client_info;
		if (!oauthClientInfo) {
			throw 'The server did not accept the OAuth registration.';
		}
	}

	// Read the list right before saving so concurrent edits are not lost. A retry with
	// the same id replaces its entry instead of adding a duplicate.
	const connections = await loadConnections();
	await saveConnections([
		...connections.filter((c) => !isMcp(c, connectionId)),
		buildConnection(connector, connectionId, oauthClientInfo)
	]);

	pendingIds.forEach((id, key) => id === connectionId && pendingIds.delete(key));
	await refreshTools().catch(() => {});
	return toolIdOf(connectionId);
};

// Removes the connection, this user's sign-in, and the user's per-connector settings.
export const removeConnector = async (toolId: string) => {
	const connectionId = connectionIdOf(toolId);
	const connections = await loadConnections();
	if (!connections.some((c) => isMcp(c, connectionId))) {
		throw 'This connector no longer exists. Reload the page.';
	}

	await saveConnections(connections.filter((c) => !isMcp(c, connectionId)));
	await deleteOAuthSession(token(), `mcp:${connectionId}`).catch(() => {});
	await forgetUserSettings(toolId, true);
	await refreshTools().catch(() => {});
};

// Changes who can use an existing connector.
export const setConnectorAudience = async (toolId: string, audience: Audience) => {
	const connectionId = connectionIdOf(toolId);
	const connections = await loadConnections();
	if (!connections.some((c) => isMcp(c, connectionId))) {
		throw 'This connector no longer exists. Reload the page.';
	}

	await saveConnections(
		connections.map((c) =>
			isMcp(c, connectionId)
				? { ...c, config: { ...(c.config ?? {}), access_grants: accessGrants(audience) } }
				: c
		)
	);
};

export const loadAudiences = async (): Promise<Record<string, Audience>> => {
	const connections = await loadConnections();
	return Object.fromEntries(
		connections
			.filter((c) => c?.type === 'mcp' && c?.info?.id)
			.map((c) => [toolIdOf(c.info.id), audienceOf(c)])
	);
};

// Drops the connector from "Use in new chats" and, when removed, its tool choices.
const forgetUserSettings = async (toolId: string, removed: boolean) => {
	const current = get(settings) ?? {};
	const defaultTools = (current.tools ?? []).filter((id: string) => id !== toolId);
	const mcpDisabledTools = { ...(current.mcpDisabledTools ?? {}) };
	if (removed) delete mcpDisabledTools[toolId];
	settings.set({ ...current, tools: defaultTools, mcpDisabledTools });
	await updateUserSettings(token(), { ui: { tools: defaultTools, mcpDisabledTools } }).catch(
		() => {}
	);
};

// Catalog entry a connection was created from, if any (see newConnectionId).
export const catalogIdOf = (toolId: string): string | null => {
	const id = connectionIdOf(toolId);
	if (id.startsWith('custom-')) return null;
	const match = id.match(/^([a-z0-9-]+)-[a-z0-9]{4}$/);
	return match ? match[1] : null;
};

// Sends the user to the provider's sign-in page; the app returns to /connectors.
export const startSignIn = (toolId: string) => {
	sessionStorage.setItem(RETURN_FLAG, JSON.stringify({ toolId, at: Date.now() }));
	initiateOAuthRedirect({ id: toolId, serverId: connectionIdOf(toolId), authType: 'mcp' });
};

// OAuth callbacks always land on "/". Returns where to go instead, or null.
// Only a fresh flag that matches the pending sign-in counts, so a sign-in that was
// abandoned earlier cannot take over a later one started from a chat.
export const connectorReturnTarget = (url: URL): string | null => {
	const raw = sessionStorage.getItem(RETURN_FLAG);
	if (!raw || url.pathname !== '/') return null;
	sessionStorage.removeItem(RETURN_FLAG);

	let flag: { toolId?: string; at?: number } = {};
	try {
		flag = JSON.parse(raw);
	} catch {
		return null;
	}
	const pending = sessionStorage.getItem('pendingOAuthToolId');
	if (!flag.toolId || flag.toolId !== pending || Date.now() - (flag.at ?? 0) > 15 * 60 * 1000) {
		return null;
	}

	sessionStorage.removeItem('pendingOAuthToolId');
	sessionStorage.removeItem('oauthRedirectInProgressToolId');
	const error = url.searchParams.get('error');
	return `/connectors?${error ? 'failed' : 'connected'}=${encodeURIComponent(flag.toolId)}${
		error ? `&error=${encodeURIComponent(error)}` : ''
	}`;
};

export const clearReturnFlag = () => sessionStorage.removeItem(RETURN_FLAG);

export const signOut = async (toolId: string) => {
	await deleteOAuthSession(token(), `mcp:${connectionIdOf(toolId)}`);
	await forgetUserSettings(toolId, false);
	await refreshTools().catch(() => {});
};
