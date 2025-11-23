#!/usr/bin/env node

/**
 * TV.RUSLANMV.COM - MCP Server
 * Model Context Protocol server for AI agents to access TV episodes and content
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const API_VERSION = "v1";

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  description: string;
  youtube_url: string;
  youtube_id: string;
  duration: number;
  published_at: string;
  transcript?: string;
  sections: Section[];
  packages?: Package[];
}

interface Section {
  id: string;
  section_type: string;
  title: string;
  content: string;
  start_time: number;
  end_time: number;
  order_index: number;
}

interface Package {
  id: string;
  name: string;
  description: string;
  pypi_url: string;
  github_url?: string;
  stars?: number;
  category: string;
  featured_date: string;
}

// API Client
class TVRuslanmvAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = `${baseURL}/api/${API_VERSION}`;
  }

  async getTodayEpisode(includeTranscript: boolean = false): Promise<Episode> {
    const response = await axios.get(`${this.baseURL}/episodes/today`, {
      params: { include_transcript: includeTranscript },
    });
    return response.data;
  }

  async getEpisode(episodeId: string, includeTranscript: boolean = false): Promise<Episode> {
    const response = await axios.get(`${this.baseURL}/episodes/${episodeId}`, {
      params: { include_transcript: includeTranscript },
    });
    return response.data;
  }

  async getSection(episodeId: string, sectionType: string): Promise<Section> {
    const response = await axios.get(
      `${this.baseURL}/episodes/${episodeId}/sections/${sectionType}`
    );
    return response.data;
  }

  async searchEpisodes(
    query: string,
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string
  ): Promise<Episode[]> {
    const response = await axios.get(`${this.baseURL}/episodes/search`, {
      params: { q: query, limit, date_from: dateFrom, date_to: dateTo },
    });
    return response.data;
  }

  async getTrendingPackages(limit: number = 10): Promise<Package[]> {
    const response = await axios.get(`${this.baseURL}/packages/trending`, {
      params: { limit },
    });
    return response.data;
  }

  async getPackageOfDay(date?: string): Promise<Package> {
    const response = await axios.get(`${this.baseURL}/packages/featured`, {
      params: { date },
    });
    return response.data;
  }

  async listEpisodes(limit: number = 20, offset: number = 0): Promise<Episode[]> {
    const response = await axios.get(`${this.baseURL}/episodes`, {
      params: { limit, offset },
    });
    return response.data;
  }
}

// MCP Server Implementation
class TVRuslanmvMCPServer {
  private server: Server;
  private api: TVRuslanmvAPI;

  constructor() {
    this.server = new Server(
      {
        name: "tv-ruslanmv-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.api = new TVRuslanmvAPI(API_BASE_URL);
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_today_episode",
          description:
            "Retrieves today's TV episode with all sections and content. Perfect for getting the latest AI news and trending packages.",
          inputSchema: {
            type: "object",
            properties: {
              include_transcript: {
                type: "boolean",
                description: "Include full episode transcript",
                default: false,
              },
            },
          },
        },
        {
          name: "get_episode",
          description: "Retrieves a specific episode by ID with all sections and metadata.",
          inputSchema: {
            type: "object",
            properties: {
              episode_id: {
                type: "string",
                description: "Episode ID (UUID)",
              },
              include_transcript: {
                type: "boolean",
                description: "Include full episode transcript",
                default: false,
              },
            },
            required: ["episode_id"],
          },
        },
        {
          name: "get_section",
          description:
            "Get a specific section from an episode (news, tech, deepdive, research, packages)",
          inputSchema: {
            type: "object",
            properties: {
              episode_id: {
                type: "string",
                description: "Episode ID",
              },
              section_type: {
                type: "string",
                enum: ["news", "tech", "deepdive", "research", "packages"],
                description: "Type of section to retrieve",
              },
            },
            required: ["episode_id", "section_type"],
          },
        },
        {
          name: "search_episodes",
          description:
            "Search through historical episodes by keywords, topics, or date range",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query (keywords, topics, etc.)",
              },
              limit: {
                type: "number",
                description: "Maximum number of results",
                default: 10,
                minimum: 1,
                maximum: 50,
              },
              date_from: {
                type: "string",
                description: "Start date (YYYY-MM-DD)",
              },
              date_to: {
                type: "string",
                description: "End date (YYYY-MM-DD)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_trending_packages",
          description:
            "Get the latest trending Python packages and AI tools featured on the show",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Number of packages to return",
                default: 10,
                minimum: 1,
                maximum: 50,
              },
            },
          },
        },
        {
          name: "get_package_of_day",
          description: "Get the featured package of the day with details and usage",
          inputSchema: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "Date (YYYY-MM-DD), defaults to today",
              },
            },
          },
        },
        {
          name: "list_episodes",
          description: "List all available episodes with pagination",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Number of episodes per page",
                default: 20,
                minimum: 1,
                maximum: 100,
              },
              offset: {
                type: "number",
                description: "Offset for pagination",
                default: 0,
                minimum: 0,
              },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "get_today_episode": {
            const episode = await this.api.getTodayEpisode(args.include_transcript);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(episode, null, 2),
                },
              ],
            };
          }

          case "get_episode": {
            const episode = await this.api.getEpisode(
              args.episode_id,
              args.include_transcript
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(episode, null, 2),
                },
              ],
            };
          }

          case "get_section": {
            const section = await this.api.getSection(args.episode_id, args.section_type);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(section, null, 2),
                },
              ],
            };
          }

          case "search_episodes": {
            const episodes = await this.api.searchEpisodes(
              args.query,
              args.limit,
              args.date_from,
              args.date_to
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(episodes, null, 2),
                },
              ],
            };
          }

          case "get_trending_packages": {
            const packages = await this.api.getTrendingPackages(args.limit);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(packages, null, 2),
                },
              ],
            };
          }

          case "get_package_of_day": {
            const package_ = await this.api.getPackageOfDay(args.date);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(package_, null, 2),
                },
              ],
            };
          }

          case "list_episodes": {
            const episodes = await this.api.listEpisodes(args.limit, args.offset);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(episodes, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `API Error: ${error.response?.data?.detail || error.message}`
          );
        }
        throw error;
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "episode://today",
          name: "Today's Episode",
          description: "The current episode of TV.RUSLANMV",
          mimeType: "application/json",
        },
        {
          uri: "episode://today/transcript",
          name: "Today's Transcript",
          description: "Full transcript of today's episode",
          mimeType: "text/plain",
        },
        {
          uri: "packages://trending",
          name: "Trending Packages",
          description: "Currently trending AI/ML packages",
          mimeType: "application/json",
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === "episode://today") {
          const episode = await this.api.getTodayEpisode(false);
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(episode, null, 2),
              },
            ],
          };
        }

        if (uri === "episode://today/transcript") {
          const episode = await this.api.getTodayEpisode(true);
          return {
            contents: [
              {
                uri,
                mimeType: "text/plain",
                text: episode.transcript || "Transcript not available",
              },
            ],
          };
        }

        if (uri === "packages://trending") {
          const packages = await this.api.getTrendingPackages(10);
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(packages, null, 2),
              },
            ],
          };
        }

        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `API Error: ${error.response?.data?.detail || error.message}`
          );
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("TV.RUSLANMV MCP Server running on stdio");
  }
}

// Start server
const server = new TVRuslanmvMCPServer();
server.run().catch(console.error);
