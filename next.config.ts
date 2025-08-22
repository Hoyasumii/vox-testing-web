import type { NextConfig } from "next";

export default {
	env: {
		API_URL: process.env.API_URL,
		NEXT_PUBLIC_API_BASE_URL: process.env.API_URL,
	},
} as NextConfig;
