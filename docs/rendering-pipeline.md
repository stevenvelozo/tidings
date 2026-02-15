# Rendering Pipeline

When you call `render()`, Tidings runs your report through a multi-phase async waterfall. Each phase updates the report manifest with status, progress, and timing information.

## Pipeline Phases

### 1. Validate Datum

The input object is checked for a `TidingsData` property. If missing, one is created with defaults. A unique `GUIDReportDescription` is assigned, and the `Type` defaults to `"default"` if not specified.

```javascript
{
	Artist: 'Queen',
	Song: 'We Will Rock You',
	TidingsData:
	{
		Type: 'default',
		Renderer: 'html',
		GUIDReportDescription: '0x560eb56067000000'
	}
}
```

### 2. Create Manifest

A manifest object is built from the base template, populated with datum metadata, folder locations, and initial status. The manifest tracks every aspect of the render from this point forward.

### 3. Create Folders

The output folder structure is created under the report output directory:

```
stage/{GUID}/
├── Assets/      # Downloaded external files
├── Stage/       # Final rendered output
└── Scratch/     # Temporary workspace (deleted after render)
```

### 4. Persist Datum

The input data is written to `Datum.json` in the report root folder. This gives templates and external tools access to the raw data as a file.

### 5. Load Report Definition

The `report_definition.json` file is loaded from the report type folder. If no definition file is found, Tidings falls back to a default definition. The definition specifies templates, assets to collect, and rasterization steps.

```json
{
	"Hash": "accountspaid",
	"Name": "Accounts Paid Report",
	"Renderers":
	{
		"html":
		{
			"Templates":
			[
				{ "File": "index.html" }
			],
			"Rasterization":
			[
				{
					"Rasterizer": "WKHTMLTOPDF",
					"File": "index.html",
					"Output": "report.pdf"
				}
			]
		}
	}
}
```

### 6. Load Report Behaviors

The `report.js` file is loaded and its exports are merged with the report prototype. This is where you hook into lifecycle phases.

### 7. Parse Report Definition

The renderer section matching the requested renderer (default `"html"`) is extracted. Templates are added to the manifest and rasterization tasks are queued.

### 8. Pre-Collect Hook

Your `report.js` `preCollect()` function runs. Use this to modify the datum, add assets to the collection list, or set up state before asset downloads begin.

```javascript
module.exports =
{
	preCollect: (pState, fCallback) =>
	{
		// Add an asset to download
		pState.Manifest.AssetCollectionList.push(
		{
			URL: 'https://api.example.com/data.json',
			File: 'ExternalData.json'
		});
		fCallback(false, pState);
	}
};
```

### 9. Collect Assets

All entries in `Manifest.AssetCollectionList` are downloaded one at a time (serial queue). Each asset is saved to the Assets folder. Download timing and file size are recorded in the manifest.

### 10. Calculate Hook

Your `report.js` `calculate()` function runs. Use this for data transformation, aggregation, or any computation that should happen after assets are available but before templates render.

```javascript
module.exports =
{
	calculate: (pState, fCallback) =>
	{
		// Parse a downloaded asset
		let tmpData = JSON.parse(
			pState.Behaviors.loadReportFile(pState, 'Assets/ExternalData.json'));
		pState.Datum.ProcessedItems = tmpData.items.length;
		fCallback(false, pState);
	}
};
```

### 11. Explode Templates

If the Templates array is empty, Tidings auto-discovers every file in the renderer's template folder. This means you can skip explicit template declarations for simple reports.

### 12. Process Templates

Each template is rendered using Underscore.js template syntax. Three variables are available inside templates:

| Variable | Description |
|----------|-------------|
| `Datum` | Your input data object |
| `Manifest` | The current report manifest |
| `Behaviors` | Helper functions (see below) |

Rendered output is written to the Stage folder.

### 13. Rasterization

Two things happen in order:

1. **Auto-rasterize** — Any entries in the `Rasterization` array from the report definition are executed using the specified rasterizer plugin.
2. **Custom rasterize** — Your `report.js` `rasterize()` function runs for any additional rasterization logic.

### 14. Post-Render Hook

Your `report.js` `postRender()` function runs. Common use: clean up assets after rasterization.

```javascript
module.exports =
{
	postRender: (pState, fCallback) =>
	{
		// Delete downloaded assets to save space
		pState.Behaviors.deleteAssets(pState, fCallback);
	}
};
```

### 15. Cleanup

The Scratch folder is deleted. Temporary files created during rendering are removed.

### 16. Finalize

The manifest is updated with completion status, end time, and total render duration. The final manifest is persisted to `Manifest.json`.

## Template Syntax

Templates use [Underscore.js template syntax](https://underscorejs.org/#template):

| Syntax | Purpose |
|--------|---------|
| `<%= expression %>` | Output an expression (HTML-escaped) |
| `<%- expression %>` | Output an expression (unescaped) |
| `<% code %>` | Execute JavaScript code |

### Behavior Functions in Templates

The `Behaviors` object provides helper functions you can call from inside templates:

```html
<% Behaviors.manifestLog(Manifest, 'Processing row ' + i); %>
<%= Behaviors.parseReportPath(Manifest, 'Stage') %>
```

## Template Paths

Templates can reference special location constants that are expanded at render time:

```json
{
	"Templates":
	[
		{ "File": "index.html" },
		{ "File": "summary.html", "Path": "Stage" },
		{ "File": "*", "Path": "ReportDefinition", "Recursive": true }
	]
}
```

| Path Value | Expands To |
|------------|------------|
| `Stage` | The Stage output folder |
| `Asset` | The Assets folder |
| `Scratch` | The Scratch temporary folder |
| `Root` | The report root folder |
| `ReportDefinition` | The report type definition folder |
| `Common` | The common subfolder of the report definition |

## Template Debugging

Enable the debugger breakpoint on template errors:

```javascript
{
	TidingsDebug: true
}
```

When a template fails to compile, the manifest records detailed error information including the source, generated code, bracket validation, and character positions of the mismatch.

## Cross-Renderer Dependencies

A renderer can depend on another renderer's templates:

```json
{
	"Renderers":
	{
		"html":
		{
			"Templates": [{ "File": "index.html" }]
		},
		"pdf":
		{
			"Templates":
			[
				{ "Renderer": "html" },
				{ "File": "pdf-cover.html" }
			],
			"Rasterization":
			[
				{ "Rasterizer": "WKHTMLTOPDF", "File": "index.html", "Output": "report.pdf" }
			]
		}
	}
}
```

The `pdf` renderer first processes all templates from the `html` renderer, then its own additional templates, then rasterizes the result.
