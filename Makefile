# Makefile for Resume Studio (resume-fmt-svelte)
SHELL := /usr/bin/env bash
PNPM ?= pnpm

.DEFAULT_GOAL := help

.PHONY: help
help: ## Display this help message
	@echo -e "\033[1;34mResume Studio - Maintenance & Development Tasks\033[0m"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies using pnpm
	$(PNPM) install

.PHONY: dev
dev: ## Start Vite local development server
	$(PNPM) run dev

.PHONY: build
build: ## Build the production static site (outputs to build/)
	$(PNPM) run build

.PHONY: preview
preview: ## Preview the production build locally
	$(PNPM) run preview

.PHONY: lint
lint: ## Lint resume themes and configurations
	$(PNPM) run lint:themes

.PHONY: check-support
check-support: ## Check if Node and dependencies are active and supported (not EOL)
	$(PNPM) run check:support

.PHONY: check
check: lint check-support build ## Run all linters, EOL checks, and verify production build

.PHONY: outdated
outdated: ## Check for outdated dependencies
	@$(PNPM) outdated || true

.PHONY: update
update: ## Safely update dependencies within semver ranges (^ minor & patch)
	$(PNPM) update

.PHONY: upgrade
upgrade: ## Interactively upgrade dependencies to newest versions (choose which to bump)
	$(PNPM) update -i -L

.PHONY: upgrade-major
upgrade-major: ## Upgrade all dependencies to latest major versions (CAUTION: may break APIs)
	@echo "Warning: Major version upgrades (e.g. SvelteKit 2->3, Vite 7->8) can introduce breaking changes."
	$(PNPM) update --latest

.PHONY: audit
audit: ## Run security vulnerability audit
	@$(PNPM) audit || true

.PHONY: audit-fix
audit-fix: ## Automatically fix security vulnerabilities if possible
	$(PNPM) audit --fix

.PHONY: clean
clean: ## Remove build outputs and temporary caches
	rm -rf build .svelte-kit node_modules/.vite
	@echo "Cleaned build artifacts."
