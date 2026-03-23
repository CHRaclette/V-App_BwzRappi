# V-App_BwzRappi

Room reservation app with:

- Backend: Spring Boot + MySQL
- Frontend: NativeScript + Angular (TypeScript)

## Project structure

- Backend: `backend`
- Frontend: `frontend/V-App`

## Prerequisites

### Backend

- Java 21
- Maven (or use `./mvnw` / `mvnw.cmd`)
- MySQL running locally

### Frontend (NativeScript Android)

- Node.js LTS
- NativeScript CLI
- Android Studio + Android SDK + emulator
- JDK installed and Android environment variables configured

## Backend setup and run

1. Go to backend folder:

```powershell
cd backend
```

2. Check database config in:

- `backend/src/main/resources/application.properties`

Current config expects:

- Host: `localhost`
- Port: `3306`
- DB: `roomReservation`
- Auto-create DB: enabled via `createDatabaseIfNotExist=true`

3. Start backend:

Using Maven:

```powershell
mvn spring-boot:run
```

Or Maven wrapper on Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

4. Backend base URL:

- `http://localhost:8080`

## Frontend setup and run (Angular app)

1. Go to frontend app folder:

```powershell
cd frontend/V-App
```

2. Install dependencies:

```powershell
npm install
```

3. Run on Android emulator/device:

```powershell
npx ns run android
```

Optional preview mode:

```powershell
npx ns preview
```

## How frontend reaches backend

Frontend API base URL logic is in:

- `frontend/V-App/src/app/shared/api.service.ts`

Current behavior:

- Tries `http://localhost:8080`
- Falls back to `http://10.0.2.2:8080`

If testing on a real phone, use your computer LAN IP in that file, for example:

- `http://192.168.1.25:8080`

Also make sure phone and computer are on the same network.

## Seeded users

When user table is empty, seeders create:

- `user1` / `pw1`
- `user2` / `pw2`
- `user3` / `pw3`

Seeder source:

- `backend/src/main/java/backend/seeders/UsersSeeder.java`

## Main backend endpoints

User/auth:

- `POST /login` (request params: `username`, `password`)
- `POST /signup` (request params: `username`, `password`)
- `GET /publicKeys?userId=...`
- `PATCH /addPublicKey` (JSON body)

Rooms:

- `GET /rooms`
- `POST /rooms/available` (JSON body)

Reservations:

- `GET /reservations?userID=...`
- `GET /reservations/prvKey?privateKey=...`
- `GET /reservations/pubKey?publicKey=...`
- `PATCH /reservations` (JSON body)
- `DELETE /reservations?privateKey=...`

## Important notes

1. Security config currently allows all endpoints without authentication checks.
	- File: `backend/src/main/java/backend/configs/SecurityConfig.java`

2. Database password is currently hardcoded in `application.properties`.
	- Move credentials to environment variables before sharing/deploying.

3. Android emulator networking:
	- `localhost` inside emulator is emulator itself.
	- Use `10.0.2.2` to reach backend on host machine.

4. NativeScript platform issues:
	- If Android platform gets corrupted/missing wrappers:

```powershell
npx ns platform remove android
npx ns platform add android
```

## Troubleshooting quick checklist

Backend not reachable from app:

- Confirm backend is running on port 8080.
- Confirm MySQL is running and credentials are valid.
- Confirm API base URL in `api.service.ts` matches your environment.

App starts but looks stale after style changes:

- Stop app and run `npx ns run android` again for a full rebuild.

Emulator freezes / system UI not responding:

- Cold boot emulator from Android Studio Device Manager.
- Restart app after emulator is stable.