# Tidings

> Extensible micro-service reporting engine

Turn application data into rendered reports with zero application code changes. Define report types as folders of templates and scripts, pass your data in, and Tidings handles the full render pipeline — from asset collection through template processing to PDF rasterization.

- **Config-Driven** -- Add reports without changing application code; just create a folder with a definition, script, and templates
- **Multi-Phase Pipeline** -- Validate, collect assets, calculate, template, rasterize, and clean up in a single render call
- **Pluggable Rasterizers** -- WKHTMLTOPDF, PhantomJS, LaTeX, Graphviz, FFMPEG, command-line tools, or external APIs
- **REST API** -- Async and sync render endpoints with manifest status tracking and file retrieval
- **Extensible** -- Hook into any pipeline phase via report.js scripts; add libraries through the libraries property

[Quick Start](README.md)
[Rendering Pipeline](rendering-pipeline.md)
[Rasterizers](rasterizers.md)
[API Reference](api.md)
[GitHub](https://github.com/stevenvelozo/tidings)
