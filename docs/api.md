# API Reference

## Creating a Tidings Instance

Tidings uses a factory pattern. Pass a Fable instance to create a new service:

```javascript
const libFable = require('fable').new({ Tidings: { ... } });
const libTidings = require('tidings').new(libFable);
```

You can also pass an Orator instance — Tidings extracts the Fable reference automatically.

---

## Methods

### render(pDatum, fCallback)

Render a report asynchronously. Returns the report GUID immediately; the callback fires when rendering completes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pDatum` | object | Your application data. May include a `TidingsData` block for metadata. |
| `fCallback` | function | `(pError)` called when rendering finishes |

**Returns:** `string` — The `GUIDReportDescription` assigned to this render.

```javascript
let tmpGUID = libTidings.render(
	{
		Name: 'Joan of Arc',
		TidingsData: { Type: 'biography', Renderer: 'html' }
	},
	(pError) =>
	{
		if (pError) return console.error(pError);
		console.log(`Report ${tmpGUID} rendered.`);
	});
```

If `TidingsData` is omitted, it defaults to `{ Type: 'default' }`. If `TidingsData.Renderer` is omitted, it defaults to `'html'`.

---

### getReportStatus(pLocationHash, fCallback)

Retrieve the manifest JSON for a rendered or in-progress report.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pLocationHash` | string | The report GUID |
| `fCallback` | function | `(pError, pManifest)` |

---

### getReportData(pLocationHash, fCallback)

Retrieve the original datum JSON for a report.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pLocationHash` | string | The report GUID |
| `fCallback` | function | `(pError, pDatum)` |

---

### getReportFile(pLocationHash, pFileHash, fCallback)

Retrieve a specific file from a rendered report.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pLocationHash` | string | The report GUID |
| `pFileHash` | string | The filename to retrieve |
| `fCallback` | function | `(pError, pFileData)` |

---

### deleteReport(pLocationHash, fCallback)

Delete a report and all its files from the output folder.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pLocationHash` | string | The report GUID |
| `fCallback` | function | `(pError)` |

---

### buildReportManifest(pDatum)

Create a manifest object from a datum without starting a render. Useful for inspecting what Tidings would generate.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pDatum` | object | The datum to build a manifest from |

**Returns:** `object` — A populated manifest object.

---

### connectRoutes(pRestServer)

Wire all Tidings REST endpoints onto a Restify server instance.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pRestServer` | object | A Restify server (e.g., `orator.webServer`) |

---

### connectOutputRoutes(pOrator)

Add a static file route for the report output folder. Serves rendered files at `{TidingsReportRoot}Output/`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pOrator` | object | An Orator instance |

---

### connectDefinitionRoutes(pOrator)

Add a static file route for the report definition folder. Serves definition files at `{TidingsReportRoot}Definition/`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pOrator` | object | An Orator instance |

---

### Orator()

Lazily create and return an Orator web server instance using the current Fable settings.

**Returns:** `object` — An Orator instance.

---

## Properties

### libraries

The collection of utility libraries available to report scripts and templates. You can extend this to add your own libraries.

| Library | Purpose |
|---------|---------|
| `Async` | Async control flow (waterfall, queue, series) |
| `DropBag` | File I/O abstraction |
| `Quantifier` | Number formatting and manipulation |
| `Underscore` | Template engine and utilities |
| `Moment` | Date/time operations (with timezone support) |
| `BigNumber` | Arbitrary-precision math |
| `Cheerio` | jQuery-like HTML parsing |
| `Request` | HTTP client |
| `Luxon` | Modern date/time library |
| `Chance` | Random data generation |

```javascript
// Add a custom library
libTidings.libraries.MyLib = require('my-custom-lib');
```

---

### endpoints

The collection of REST endpoint handler functions. Each handler follows the Restify middleware signature `(pRequest, pResponse, fNext)`.

---

### commonservices

Error handling and logging utilities shared across the Tidings internals.

---

### fable

Reference to the Fable instance that Tidings was created with.

---

## REST Endpoints

All routes are prefixed with the `TidingsReportRoot` setting (default: `/1.0/Report`).

### Render

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/1.0/Report` | Async render — returns GUID immediately |
| POST | `/1.0/ReportSync` | Sync render — waits for completion, returns the rendered file |
| POST | `/1.0/Report/Run/Wait` | Sync render with full report wait |

**Request body** for all render endpoints: your datum object as JSON.

```bash
curl -X POST http://localhost:8080/1.0/Report \
  -H 'Content-Type: application/json' \
  -d '{"Artist":"Queen","Song":"Bohemian Rhapsody","TidingsData":{"Type":"default"}}'
```

### Retrieve

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/1.0/Report/Manifest/:UUID` | Get the report manifest |
| GET | `/1.0/Report/Datum/:UUID` | Get the original datum |
| GET | `/1.0/Report/:UUID/Default` | Get the default output file |
| GET | `/1.0/Report/:UUID/Assets/:FileName` | Get an asset file |
| GET | `/1.0/Report/:UUID/:FileName` | Get a staged output file |
| GET | `/1.0/Report/Run/:ReportType/:FileName` | Get a common file from a report type |

## Manifest Structure

The manifest tracks every aspect of a render run:

```javascript
{
	Metadata:
	{
		GUIDReportDescription: '0x560c0aa770c00000',
		Type: 'default',
		Title: 'The Default Report',
		Renderer: 'html',
		DefaultFile: 'index.html',
		LocationHash: '0x560c0aa770c00000',
		Locations:
		{
			Root: '/path/to/stage/{GUID}/',
			Asset: '/path/to/stage/{GUID}/Assets/',
			Stage: '/path/to/stage/{GUID}/Stage/',
			Scratch: '/path/to/stage/{GUID}/Scratch/',
			ReportDefinition: '/path/to/reports/default/',
			Common: '/path/to/reports/default/common/'
		}
	},
	Status:
	{
		Rendered: true,
		CompletionProgress: 100,
		StartTime: 1478276849091,
		EndTime: 1478276851003,
		CompletionTime: 1912
	},
	AssetCollectionList: [],
	RasterizationList: [],
	Errors: [],
	Templates: [],
	Log: []
}
```

| Section | Description |
|---------|-------------|
| `Metadata` | Report identity, type, renderer, file locations |
| `Status` | Render state, progress percentage, timing |
| `AssetCollectionList` | Downloaded files with URLs, sizes, and timing |
| `RasterizationList` | Rasterization tasks that were executed |
| `Errors` | Template parsing errors with validation details |
| `Templates` | List of processed template files |
| `Log` | Timestamped log entries from every pipeline phase |
