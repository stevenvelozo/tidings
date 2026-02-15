# Rasterizers

Rasterizers convert rendered report output into other formats — HTML to PDF, DOT to SVG, TeX to PDF, and more. They run after template processing as part of the render pipeline.

## Configuring Rasterization

Add a `Rasterization` array to a renderer in your `report_definition.json`:

```json
{
	"Renderers":
	{
		"html":
		{
			"Templates": [{ "File": "index.html" }],
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

Each entry specifies which rasterizer plugin to use, the input file (from the Stage folder), and the output filename.

## Available Rasterizers

### WKHTMLTOPDF

Converts HTML to PDF using the Qt WebKit rendering engine. Runs headless without a display server.

**Install:**

```bash
npm install wkhtmltopdf-selfcontained
```

**Configuration:**

```json
{
	"Rasterizer": "WKHTMLTOPDF",
	"File": "index.html",
	"Output": "report.pdf"
}
```

**Notes:**
- Self-contained Node module — no OS-level installation needed
- Docker containers may need the locale set: `LC_ALL=C`
- Renders CSS, JavaScript, and web fonts

### PhantomJS

Headless WebKit browser for HTML-to-PDF conversion with full JavaScript execution support.

**Install:**

```bash
npm install phantomjs-prebuilt phantom-html-to-pdf
```

**Configuration:**

```json
{
	"Rasterizer": "PhantomPDF",
	"File": "index.html",
	"Output": "report.pdf"
}
```

### LaTeX

High-quality typesetting for technical and scientific documents. Compiles `.tex` source into PDF.

**Install:**

```bash
# Ubuntu
sudo apt-get install texlive

# macOS
# Download from https://tug.org/mactex/

# Node module
npm install latex-file
```

**Configuration:**

```json
{
	"Rasterizer": "LaTeX",
	"File": "report.tex",
	"Output": "report.pdf"
}
```

### Graphviz

Graph visualization from DOT language descriptions. Produces SVG, PNG, or PDF diagrams.

**Install:**

```bash
# Ubuntu
sudo apt-get install graphviz
```

**Configuration:**

```json
{
	"Rasterizer": "Graphviz",
	"File": "diagram.dot",
	"Output": "diagram.svg"
}
```

### FFMPEG

Audio and video processing. Convert formats, extract frames, generate thumbnails, or create video from image sequences.

**Install:**

```bash
npm install @ffmpeg-installer/ffmpeg fluent-ffmpeg @ffprobe-installer/ffprobe
```

**Configuration:**

```json
{
	"Rasterizer": "FFMPEG",
	"File": "video.mp4",
	"Output": "thumbnail.png"
}
```

**Note:** You may need to make the ffprobe binary executable in containers:

```bash
chmod +x node_modules/@ffprobe-installer/ffprobe/node_modules/@ffprobe-installer/linux-x64/ffprobe
```

### Command Line

Generic wrapper for any command-line tool. Execute arbitrary system commands as a rasterization step.

**Configuration:**

```json
{
	"Rasterizer": "CommandLine",
	"Command": "convert input.svg output.png"
}
```

### Via API

Call an external HTTP API to perform rasterization. Includes retry logic for resilience.

**Configuration:**

```json
{
	"Rasterizer": "ViaAPI",
	"URL": "https://render-service.example.com/convert",
	"File": "index.html",
	"Output": "report.pdf"
}
```

The API rasterizer uses the `TidingsServerAddress` setting to resolve relative URLs.

## Custom Rasterization in report.js

Beyond the declarative configuration, you can run custom rasterization logic in the `rasterize()` hook:

```javascript
module.exports =
{
	rasterize: (pState, fCallback) =>
	{
		// Access the rasterizer task runner
		pState.Behaviors.processRasterizationTask(pState,
			{
				Rasterizer: 'WKHTMLTOPDF',
				File: 'custom-page.html',
				Output: 'custom-output.pdf'
			},
			(pError) =>
			{
				fCallback(pError, pState);
			});
	}
};
```

## Rasterization Order

1. **Auto-rasterize** — All entries from the `Rasterization` array in the report definition run first, in order.
2. **Custom rasterize** — The `rasterize()` function from `report.js` runs after, allowing additional or conditional rasterization.
