FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Runs the dev server proxying requests to backend
CMD ["npm", "run", "dev"]
