# Contmi

Contmi is a budget-sharing application designed to help users manage and share their expenses with others. It is an open-source project with a focus on simplicity, privacy, and ease of use. Contmi is built as a progressive web app, allowing it to be accessed on any browser, including mobile devices. The application prioritizes a local-first approach, ensuring that users' data remains on their devices by default. Contmi is free of advertisements and does not have any premium offerings.

## Key Features

- :unlock: **Free and Open Source**: Contmi is an open-source project, providing transparency and encouraging community contributions.
- :sparkles: **Easy to Use**: The application aims to provide a user-friendly interface, making budget management and expense sharing simple and intuitive.
- :earth_americas: **Local/Offline First**: Contmi prioritizes storing and processing data locally, allowing users to access their budget information even without an internet connection.
- :no_entry_sign: **No Ads or Premium Offers**: Contmi is free from advertisements and does not offer any premium subscriptions or features.
- :gear: **Easy to Self-Host**: Contmi is designed to be easily self-hosted, giving users full control over their data and allowing customization to fit specific needs.

## Architecture

There are multiple packages in this repo:

- client: [React](https://react.dev/learn) and [Vulcan](https://vlcn.io/docs) browser frontend
- server: [Express](https://expressjs.com/) server acting as a data synchronization relay between client
- schema: database schema shared between client and server

We're using [Turborepo](https://turbo.build/repo/docs) for monorepo management and [pnpm](https://pnpm.io/installation) for Node.js package management.

## Development environment

In the project's root, install dependencies for all packages:

```bash
pnpm i
```

And start all the development servers:

```bash
pnpm dev
```

The development client is exposed on your `localhost:5173`.

For now, test the code by running:

```bash
pnpm lint
pnpm build
pnpm preview
```
