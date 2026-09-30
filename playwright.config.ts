import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.ts',workers:1,retries:0,reporter:'list',use:{baseURL:process.env.PREVIEW_URL??'http://127.0.0.1:4340',headless:true,viewport:{width:1440,height:1000},launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE},screenshot:'only-on-failure'}});
