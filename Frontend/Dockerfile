# build environment
FROM node:18.14.2-alpine as build
ARG MAX_OLD_SPACE_SIZE=4096
ARG VITE_API_URI
ARG VITE_API_GEO_URI
ARG VITE_BASE_PATH
ARG VITE_APP_NAME
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}
ENV VITE_API_URI $VITE_API_URI
ENV VITE_API_GEO_URI $VITE_API_GEO_URI
ENV VITE_BASE_PATH $VITE_BASE_PATH
ENV VITE_APP_NAME $VITE_APP_NAME
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
RUN apk update && apk upgrade && \apk add --no-cache git
RUN npm ci --legacy-peer-deps
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html/kiemke
# Vitejs build folder => dist folder
COPY --from=build /app/dist /usr/share/nginx/html
# new
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]