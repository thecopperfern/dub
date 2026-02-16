# Tinybird Quickstart (Local + Cloud)

## What is set up
- Datasource: `datasources/rows.datasource`
- Endpoint: `endpoints/rows_endpoint.pipe`
- Local Tinybird: running and healthy
- Cloud deployment: live in workspace `copperfern`
- Cloud data loaded into `rows`

## Windows command wrapper
Use this for all Tinybird commands to avoid encoding/charmap issues:

```powershell
.\scripts\tb-utf8.ps1 --cloud endpoint data rows_endpoint --format json --limit 5
```

## Useful commands
From `tinybird-quickstart`:

```powershell
# Local
.\scripts\tb-utf8.ps1 local status
.\scripts\tb-utf8.ps1 --local build
.\scripts\tb-utf8.ps1 --local endpoint data rows_endpoint --format json --limit 5

# Cloud
.\scripts\tb-utf8.ps1 --cloud deploy --wait --auto
.\scripts\tb-utf8.ps1 --cloud sql "SELECT count() AS c FROM rows"
.\scripts\tb-utf8.ps1 --cloud endpoint data rows_endpoint --format json --ev_type "Battery Electric Vehicle (BEV)" --limit 5
```

If you see `Running command from an untracked folder`, run cloud commands from repo root (`D:\Dev_Land\Dub`) instead.
