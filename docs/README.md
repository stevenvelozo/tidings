# Tidings

An extensible micro-service reporting engine built on Fable. Pass in your application data, point Tidings at a folder of report definitions, and get back rendered HTML, PDFs, graphs, or any output format you need. Reports are added by creating folders — no application code changes required.

## Quick Start

```bash
npm install tidings fable
```

```javascript
const libFable = require('fable').new(
{
	Tidings:
	{
		ReportDefinitionFolder: `${__dirname}/myreports/`,
		ReportOutputFolder: `${__dirname}/stage/`
	}
});

const libTidings = require('tidings').new(libFable);
```

### Create a Report Definition

Every report type lives in its own folder. A minimal report needs three things:

```
myreports/default/
├── report_definition.json   # What the report is
├── report.js                # Lifecycle hooks (can be empty)
└── html/
    └── index.html           # Template content
```

**report_definition.json:**

```json
{
	"Hash": "default",
	"Name": "My First Report",
	"Renderers":
	{
		"html": {}
	}
}
```

**report.js:**

```javascript
module.exports = {};
```

**html/index.html** (Underscore.js template syntax):

```html
<!DOCTYPE html>
<html>
  <head><title>Song Report</title></head>
  <body>
    <h1><%= Datum.Artist %></h1>
    <p>Song: <%= Datum.Song %></p>
    <p>Year: <%= Datum.Year %></p>
  </body>
</html>
```

### Render the Report

```javascript
let tmpReportHash = libTidings.render(
	{
		Artist: 'Queen',
		Song: 'We Will Rock You',
		Year: 1977
	},
	(pError) =>
	{
		if (pError) return console.error(pError);
		console.log(`Report at: stage/${tmpReportHash}/Stage/index.html`);
	});
```

The render call returns a GUID immediately. When the callback fires, your report is available in the output folder under that GUID.

## Configuration

Tidings settings are read from the `Tidings` key in Fable's settings:

```javascript
const libFable = require('fable').new(
{
	Tidings:
	{
		ReportDefinitionFolder: `${__dirname}/reports/`,
		ReportOutputFolder: `${__dirname}/stage/`,
		GlobalAssetFolder: `${__dirname}/global/`,
		TidingsServerAddress: 'http://localhost:8080'
	},
	TidingsReportRoot: '/1.0/Report',
	TidingsDebug: false
});
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `Tidings.ReportDefinitionFolder` | string | `../../reports/` | Root folder for report type definitions |
| `Tidings.ReportOutputFolder` | string | `../../stage/` | Root folder for rendered report output |
| `Tidings.GlobalAssetFolder` | string | `../../global/` | Shared assets available to all reports |
| `Tidings.TidingsServerAddress` | string | `http://localhost:{port}` | Base URL for API-based rasterizers |
| `TidingsReportRoot` | string | `/1.0/Report` | REST API route prefix |
| `TidingsDebug` | boolean | `false` | Break on template errors with `debugger` |

## Terminology

| Term | Description |
|------|-------------|
| **Datum** | The data object you pass to `render()`. Your application data plus an optional `TidingsData` metadata block. |
| **Report Type** | A business context like "ExpenseTally" or "EquipmentReceived". Maps to a folder name in the report definitions directory. |
| **Renderer** | The output format — `html`, `pdf`, `xls`, or any custom string. Each renderer has its own subfolder of templates. |
| **Report Definition** | The `report_definition.json` file describing templates, assets, and rasterization steps. |
| **Report Script** | The `report.js` file with lifecycle hooks (`preCollect`, `calculate`, `rasterize`, `postRender`). |
| **Manifest** | A JSON file tracking every step of a render: status, progress, timing, errors, and logs. |
| **Rasterizer** | A plugin that converts rendered output into another format (HTML to PDF, DOT to SVG, etc.). |

## Using with Orator

Wire up the REST endpoints to serve reports over HTTP:

```javascript
const libOrator = require('orator').new(libFable.settings);

libOrator.startWebServer(
	(pError) =>
	{
		libTidings.connectRoutes(libOrator.webServer);
		libTidings.connectOutputRoutes(libOrator);
		libTidings.connectDefinitionRoutes(libOrator);
	});
```

This exposes async and sync render endpoints, manifest retrieval, file downloads, and more. See the [API Reference](api.md) for the full route table.

## Output Structure

Each rendered report gets its own folder under the output directory:

```
stage/{GUID}/
├── Datum.json        # Copy of the input data
├── Manifest.json     # Render status, timing, errors, log
├── Assets/           # Downloaded external assets
├── Stage/            # Final rendered output files
└── Scratch/          # Temporary files (deleted after render)
```

## Learn More

- [Rendering Pipeline](rendering-pipeline.md) -- The multi-phase render process in detail
- [Rasterizers](rasterizers.md) -- Available output format converters
- [API Reference](api.md) -- Complete method and REST endpoint documentation
- [Orator](/orator/orator/) -- The web server framework
- [Fable](/fable/fable/) -- The core dependency injection framework
