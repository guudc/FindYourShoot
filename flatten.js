#!/usr/bin/env node

/**
 * bundleContext.js
 * Concatenates all source files in a Node.js/Express project into a single
 * text file, prefixing each file's content with its relative path.
 * Designed to be fed as context to an AI agent.
 *
 * Usage:
 *   node bundleContext.js <sourceDir> [outputFile]
 *
 * Output defaults to ./context.txt if no outputFile is specified.
 *
 * Example output:
 *   ========================================
 *   FILE: src/routes/userRoutes.js
 *   ========================================
 *   const express = require('express');
 *   ...
 */

const fs = require("fs");
const path = require("path");

// ─── Express / Node.js backend exclusions ───────────────────────────────────

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "out",
  "coverage",
  ".nyc_output",
  "logs",
  "tmp",
  "temp",
  ".cache",
  ".turbo",
  ".next",
  "uploads",
  "public",
]);

const EXCLUDED_FILES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.development.local",
  ".env.test",
  ".env.test.local",
  ".env.production",
  ".env.production.local",
  ".env.staging",
  ".env.example",
  ".gitignore",
  ".gitattributes",
  ".npmignore",
  ".npmrc",
  ".nvmrc",
  ".node-version",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  ".dockerignore",
]);

const EXCLUDED_EXTENSIONS = new Set([
  ".log",
  ".pid",
  ".seed",
  ".gz",
  ".zip",
  ".tar",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".pdf",
]);

// ─── Helpers ────────────────────────────────────────────────────────────────

function shouldSkip(entry) {
  if (entry.isDirectory()) {
    return EXCLUDED_DIRS.has(entry.name) || entry.name.startsWith(".");
  }
  if (EXCLUDED_FILES.has(entry.name)) return true;
  if (EXCLUDED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return true;
  return false;
}

/**
 * Recursively collect every non-excluded file path under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectFiles(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (shouldSkip(entry)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function bundleContext(sourceDir, outputFile) {
  sourceDir  = path.resolve(sourceDir);
  outputFile = outputFile ? path.resolve(outputFile) : path.join(process.cwd(), "context.txt");

  if (!fs.existsSync(sourceDir)) {
    console.error(`❌  Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const files = collectFiles(sourceDir);

  if (files.length === 0) {
    console.log("⚠️  No files found to bundle.");
    return;
  }

  const lines = [];

  // ── Optional top-level summary header ──
  lines.push(`# CODEBASE CONTEXT`);
  lines.push(`# Source : ${sourceDir}`);
  lines.push(`# Files  : ${files.length}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push("");

  for (const filePath of files) {
    const relativePath = path.relative(sourceDir, filePath);
    let content;

    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch (err) {
      console.warn(`  ⚠  Could not read ${relativePath}: ${err.message}`);
      content = `[UNREADABLE: ${err.message}]`;
    }

    lines.push("=".repeat(60));
    lines.push(`FILE: ${relativePath}`);
    lines.push("=".repeat(60));
    lines.push(content);
    lines.push(""); // blank line between files
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, lines.join("\n"), "utf8");

  console.log(`✅  Bundled ${files.length} file(s) → ${outputFile}`);
  files.forEach((f) => console.log(`   • ${path.relative(sourceDir, f)}`));
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const [,, sourceArg, outputArg] = process.argv;

if (!sourceArg) {
  console.error("Usage: node bundleContext.js <sourceDir> [outputFile]");
  process.exit(1);
}

bundleContext(sourceArg, outputArg);