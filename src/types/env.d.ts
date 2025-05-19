declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LINE_CHANNEL_ACCESS_TOKEN: string;
      LINE_CHANNEL_SECRET: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

export {}; 