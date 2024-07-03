# magic-mirror

## Overview

### Building and running your application

You can set this up with the docker compose file that is found in the root of the project. You can run the following command to build and run the application:

```bash
docker compose up -d
```

This will pull the latest image from the ghcr.io registry and run it in a container.

### development

To run the application in development mode, you can run the following two commands:

```bash
bun install
bun dev
```

This will install the dependencies and run the application in development mode.

## References

* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
