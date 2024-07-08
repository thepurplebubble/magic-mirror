# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.18 as base
WORKDIR /usr/src/app

# install with --production (exclude devDependencies)
FROM base AS build
RUN mkdir -p /temp/prod
COPY . /temp/prod/
RUN cd /temp/prod && bun install && bunx prisma generate && bun run build

# copy production build to release image
FROM base AS release
COPY --from=build /temp/prod/dist/mirror .
COPY --from=build /temp/prod/prisma ./node_modules
COPY --from=build /temp/prod/prisma ./prisma
RUN bunx prisma db push
RUN chown -R bun:bun . && ls -la && ls -la prisma

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "mirror" ]
