FROM node:8.15.1

# NPM Install
WORKDIR /usr/src/app
ADD package.json /usr/src/app/package.json
RUN yarn install --production=false

# Copy Files
WORKDIR /usr/src/app
ADD .env /usr/src/app/.env
ADD .eslintignore /usr/src/app/.eslintignore
ADD .eslintrc.json /usr/src/app/.eslintrc.json
ADD config-overrides.js /usr/src/app/config-overrides.js
ADD ssr.js /usr/src/app/ssr.js
ADD public /usr/src/app/public
ADD src /usr/src/app/src


# NPM Build
WORKDIR /usr/src/app
RUN yarn build

# Start
ENV NODE_ENV production
ENV SSR true
ENTRYPOINT [ "node", "ssr.js" ]
