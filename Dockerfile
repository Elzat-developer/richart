# Этап 1: Сборка
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап 2: Раздача через Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Если используешь Create React App вместо Vite, замени /app/dist на /app/build
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]