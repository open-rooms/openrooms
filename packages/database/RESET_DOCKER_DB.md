# Reset Local Docker DB (Clean Stage 3)

If you see errors like:

- `Key columns "roomId" and "id" are of incompatible types: uuid and text`
- health endpoint shows `"database":"down"`

your Docker Postgres volume likely contains an old schema. Do a clean reset:

```bash
cd /Users/kingchief/Documents/ROOMS
docker compose down -v
docker compose up -d
```

Then apply schema inside the new container:

```bash
docker cp packages/database/schema.sql rooms-postgres-1:/schema.sql
docker exec rooms-postgres-1 psql -U postgres -d openrooms -f /schema.sql
```

`schema.sql` already includes Stage 3 sections, so you do not need to run `schema-stage3.sql` after a clean reset.

Verify:

```bash
curl http://localhost:3001/api/health
```

Expected:

```json
{"status":"healthy","redis":"up","database":"up","timestamp":"..."}
```
