# Task 001: Initialize Next.js Platform with Prisma

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI

## Context
We are migrating the legacy "Math Slate" application to a modern stack (Next.js, TypeScript, Tailwind CSS, Prisma) to support future scalability and integration. This task involves setting up the initial project structure in a subdirectory.

## Goals
1.  Initialize a new Next.js 14+ project in a `v10/` subdirectory.
2.  Configure TypeScript and Tailwind CSS.
3.  Initialize Prisma for future database requirements.
4.  Set up the folder structure for feature migration.

## Requirements

### 1. Project Initialization
*   **Directory:** Create a new folder named `v10` in the project root.
*   **Command:** Run `npx create-next-app@latest .` *inside* the `v10` directory (or specify path).
*   **Settings:**
    *   TypeScript: Yes
    *   ESLint: Yes
    *   Tailwind CSS: Yes
    *   `src/` directory: Yes
    *   App Router: Yes
    *   Import alias: `@/*`

### 2. Database Setup (Prisma)
*   Navigate to `v10/`.
*   Install Prisma: `npm install prisma --save-dev`
*   Initialize Prisma: `npx prisma init --datasource-provider sqlite`
*   *Note:* We use SQLite for local development. It can be switched to Postgres/MySQL later for production.

### 3. Cleanup & Structure
*   Remove default Next.js boilerplate code (e.g., the Vercel logo, default styling in `page.tsx`).
*   Create a clean landing page (`src/app/page.tsx`) with a simple title: "SY Math Slate (v10)".
*   Ensure `src/app/globals.css` contains the basic dark mode variables from the legacy project (refer to `src/style.css` in the root).

### 4. Dependencies
*   Install `lucide-react` for icons.
*   Install `clsx` and `tailwind-merge`.

## Deliverables
*   A running Next.js application inside `v10/`.
*   Prisma configured (`v10/prisma/schema.prisma` exists).
*   Clean `src/app/page.tsx` and `src/app/layout.tsx`.
*   Project configuration files (`tsconfig.json`, `tailwind.config.ts`, `next.config.js`).

## Notes for Codex
*   Perform all commands inside the `v10/` directory (except creating the directory itself).
*   Ensure the `v10/.gitignore` is properly generated.
*   Once done, mark this task as **COMPLETED** and create a log file if possible.
