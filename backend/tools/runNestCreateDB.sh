#!/bin/bash
npm install &
npx prisma migrate dev --name init && npx prisma db seed &
npm run start:dev