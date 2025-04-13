@echo off
echo Generating API Client...
npx swagger-typescript-api generate -p http://localhost:5295/swagger/v1/swagger.json -o ./src/api/ -n api-client.ts --axios
echo Done!
pause