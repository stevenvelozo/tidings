# Tidings

An extensible reporting system.  Meant to be drop-in and super easy to use.

Each report is described by a "Report Description" object.  When you request a report, this object is created and embeds the data you pass as a child object called the "Datum".  Each run of the report creates a "Report Manifest".  This carries state and information about the run.  A few key properties from the child object are looked for, and affect how the report is run.  The most important property is "Type", and a close second is "Renderer".

# Terminology

## Datum

The core data for the report, sent either in a `POST` request or via the call to Tidings.

## Report Definition

The definition for a report, including at minimum a JSON file, a JS file and at least one templated text file for each Renderer.

## Report Description

The content in a JSON file describing a report.  This tells tidings what assets to download, what templates to process and what rasterizers to run.

## Report Script

A javascript file that you can define functions in to inject functionality between phases of the Tidings report generation process.

## Report Run Manifest

A json file that is created and updated as a report is generating.  Reports can take a long time to complete, this file can be continually updated to reflect that.

## Type

The type of report being rendered.  Type is a business context, so this could be a "Equipment Received" report or a "Expense Tally" report.  The strings must be folder names for where the Report Definition is.

## Renderer

The render method for reports.  The default is `html`, and the engine looks for a folder named `html` in the Report Definition folder.  You could create a `pdf` version of the same report, or get very exotic and create a `xls` report.  These are not limited to formats, though -- you could easily generate a `html-summary`, `html` and `html-extended` to use the same data for two views of the same report.


# Rasterizers

Tidings comes bundled with a number of rasterizers.  After the report has gathered and calculated any intermediate data, assets can be generated.  This includes images, pdfs, videos, audio, whatever you like.  Each rasterizer plugin requires an OS installation of some kind, and an NPM installation to work.  This is to prevent the NPM dependencies for this reporting library from getting ridiculously large, while also not requiring six other modules to be loaded to work.

### PhantomPDF

PhantomJS is a headless WebKit scriptable with a JavaScript API. It has fast and native support for various web standards: DOM handling, CSS selector, JSON, Canvas, and SVG.

http://phantomjs.org/


### WKHTMLTOPDF

wkhtmltopdf and wkhtmltoimage are open source (LGPLv3) command line tools to render HTML into PDF and various image formats using the Qt WebKit rendering engine. These run entirely "headless" and do not require a display or display service.

http://wkhtmltopdf.org/

This library has a self-contained node module so you don't have to do anything in the OS.  To install just:

```
npm install wkhtmltopdf-selfcontained
```

However there is some trickiness, especially with Docker containers.  The library uses your *nix locale environment variable.  So if you are running from Cloud9, your environment needs to be changed from their custom C.UTF-8 to C.  This means you have to do this *in each terminal of cloud9 that you expect this renderer to work from*:

Check the available locale settings:
```
locale -a
```

Which will show in Cloud9:
```
  C
  C.UTF-8
  POSIX
```

Then set a locale with this (I would suggest putting it in your .bash_profile or such):

```
LC_ALL=C
```

### LaTeX

LaTeX is a high-quality typesetting system; it includes features designed for the production of technical and scientific documentation. LaTeX is the de facto standard for the communication and publication of scientific documents. LaTeX is available as free software.

https://www.latex-project.org/

Installation on Ubuntu:

```
sudo apt-get install texlive
```

Installation on OS/X:

```
https://tug.org/mactex/
```

Install the npm module (from the root of your application folder):

```
npm install latex-file
```

### GraphViz

Graphviz is open source graph visualization software. Graph visualization is a way of representing structural information as diagrams of abstract graphs and networks. It has important applications in networking, bioinformatics,  software engineering, database and web design, machine learning, and in visual interfaces for other technical domains. 

http://www.graphviz.org/

Installation on Ubuntu:

```
apt-get install graphviz
```

Install the npm module (from the root of your application folder):

```
apt-get install graphviz
```

### FFMPEG

A complete, cross-platform solution to record, convert and stream audio and video.

https://www.ffmpeg.org/

There is a prebuilt version of ffmpeg and ffprobe for NPM:

```
npm install @ffmpeg-installer/ffmpeg fluent-ffmpeg @ffprobe-installer/ffprobe
```

There appears to be a bug though, and you need to make the ffprobe binary executable:

```
chmod +x node_modules/@ffprobe-installer/ffprobe/node_modules/@ffprobe-installer/linux-x64/ffprobe   
```



## Renderer

## A very basic report Datum object looks like:

```
{
   "Name": "Joan of Arc"
}
```

## The same Datum requesting the `PDF` version of the `AccountsPaid` report (since the engine defaults to `html`):

```
{
   "Name": "Joan of Arc"
   "TidingsData": { "Type":"accountspaid", "Renderer":"pdf" }
}
```


## A Report Manifest object looks like:

```
{
    "Metadata": {
        "IDReportDescription": "0",
        "GUIDReportDescription": "0x560c0aa770c00000",
        "Type": "assetladen",
        "Title": "The Default Report",
        "Summary": "This is the summary for the default report.",
        "Renderer": "html",
        "DefaultFile": "index.html",
        "Version": 0,
        "Creator": "Unknown",
        "CreatingIDUser": 0,
        "CreateDate": false,
        "Updator": "",
        "UpdatingIDUser": 0,
        "UpdateDate": false,
        "LocationHash": "0x560c0aa770c00000",
        "RepresentedDateBegin": false,
        "RepresentedDateEnd": false,
        "Locations": {
            "Root": "/Retold/tidings/test/../stage/0x560c0aa770c00000/",
            "Asset": "/Retold/tidings/test/../stage/0x560c0aa770c00000/Assets/",
            "Stage": "/Retold/tidings/test/../stage/0x560c0aa770c00000/Stage/",
            "Scratch": "/Retold/tidings/test/../stage/0x560c0aa770c00000/Scratch/",
            "ReportDefinition": "/Retold/tidings/test/reports/assetladen/",
            "Common": "/Retold/tidings/test/reports/assetladen/common/"
        }
    },
    "Status": {
        "Rendered": true,
        "CompletionProgress": 100,
        "StartTime": 1478276849091,
        "EndTime": 1478276851003,
        "CompletionTime": 1912
    },
    "AssetCollectionList": [
        {
            "URL": "http://api.geonames.org/postalCodeLookupJSON?postalcode=98105&country=US&username=tidings",
            "File": "ZipCodes.json",
            "RequestStartTime": 1478276849099,
            "Path": "/Retold/tidings/test/../stage/0x560c0aa770c00000/Assets/",
            "Size": 205,
            "RequestEndTime": 1478276850533,
            "PersistCompletionTime": 1478276850535,
            "TotalDownloadTime": 1436
        },
        {
            "URL": "http://neverworkintheory.org/",
            "File": "NeverWorkInTheory.html",
            "RequestStartTime": 1478276850535,
            "Path": "/Retold/tidings/test/../stage/0x560c0aa770c00000/Assets/",
            "Size": 27238,
            "RequestEndTime": 1478276850941,
            "PersistCompletionTime": 1478276850942,
            "TotalDownloadTime": 407
        }
    ],
    "RasterizationList": [],
    "Errors": [],
    "Templates": [
        {
            "File": "index.html",
            "Path": "/Retold/tidings/test/reports/assetladen//html"
        }
    ],
    "Log": [
        "Fri, 30 Sep 2016 16:27:29 GMT: Creating folders at /Retold/tidings/test/../stage/0x560c0aa770c00000",
        "Fri, 30 Sep 2016 16:27:29 GMT: ...persisted the Report Datum",
        "Fri, 30 Sep 2016 16:27:29 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:29 GMT: Loaded definition: /Retold/tidings/test/reports/assetladen",
        "Fri, 30 Sep 2016 16:27:29 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:29 GMT: Loading the Report-Specific Behaviors",
        "Fri, 30 Sep 2016 16:27:29 GMT: Parsing the Report Definition for Renderer",
        "Fri, 30 Sep 2016 16:27:29 GMT: ...Adding template [object Object]",
        "Fri, 30 Sep 2016 16:27:29 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:29 GMT: Executing report pre-collect",
        "Fri, 30 Sep 2016 16:27:29 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:29 GMT: Collecting assets...",
        "Fri, 30 Sep 2016 16:27:30 GMT: --> Wrote asset: ZipCodes.json TO /Retold/tidings/test/../stage/0x560c0aa770c00000/Assets/",
        "Fri, 30 Sep 2016 16:27:30 GMT: --> Wrote asset: NeverWorkInTheory.html TO /Retold/tidings/test/../stage/0x560c0aa770c00000/Assets/",
        "Fri, 30 Sep 2016 16:27:30 GMT: ...Asset downloads complete.",
        "Fri, 30 Sep 2016 16:27:30 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:30 GMT: Executing calculate function...",
        "Fri, 30 Sep 2016 16:27:30 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:30 GMT: Processing templates...",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 0 => About",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 1 => Guidelines",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 2 => Archives",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 3 => Categories",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 4 => License",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 5 => Empirical Software Engineering Using R",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 6 => Test-Driven Development",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 7 => Revisiting the Anatomy and Physiology of the Grid",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 8 => FIDEX: Filtering Spreadsheet Data using Examples",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 9 => Apex: Automatic Programming Assignment Error Explanation",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 10 => Purposes, Concepts, Misfits, and a Redesign of Git",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 11 => Paradise Unplugged",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 12 => Five From ICER'16",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 13 => ACM Permits Authors to Post Open Access Copies of Their Own Work",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 14 => You Keep Using That Word...",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 15 => A Multi-Site Joint Replication of a Design Patterns Experiment Using Moderator Variables to Generalize Across Contexts",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 16 => The Role of Ethnographic Studies in Empirical Software Engineering",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 17 => Do Code Smells Hamper Novice Programming?",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 18 => Perspectives on Data Science for Software Engineering",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 19 => How Well Do Developers Understand Open Source Licenses?",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 20 => Suggestions",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 21 => An Interview with Andreas Stefik",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 22 => Polymorphism in Python",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 23 => Frequency Distribution of Error Message",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 24 => Parallelism in Open Source Projects",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 25 => ...more",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 26 => comments powered by Disqus.",
        "Fri, 30 Sep 2016 16:27:30 GMT: Rendering a link to the report, index 27 => Comments powered by Disqus",
        "Fri, 30 Sep 2016 16:27:30 GMT: --> Wrote stage data: index.html TO /Retold/tidings/test/../stage/0x560c0aa770c00000/Stage/",
        "Fri, 30 Sep 2016 16:27:30 GMT: ...Template processing complete.",
        "Fri, 30 Sep 2016 16:27:30 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:30 GMT: Running rasterizer...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...auto rasterization complete.",
        "Fri, 30 Sep 2016 16:27:31 GMT: This is really rasterizey...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:31 GMT: Executing post-render functions...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Default behavior.",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:31 GMT: Cleaning up temporary files...",
        "Fri, 30 Sep 2016 16:27:31 GMT: Deleted scratch file: Links.json",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa770c00000 type assetladen",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Report rendered.",
        "Fri, 30 Sep 2016 16:27:31 GMT: Rendering completed in 1912ms"
    ]
}
```

Notice that the report stores the datums as files alongside everything else.  This is so whatever toolchain is rendering the report can load the file however it wants without having to have interop with the reporting code.  As well we can store any run logging for easy debugging.  There is also a bunch of interesting information about the two files it downloaded (an HTML file and a JSON endpoint).

Interestingly, when a report has an issue executing a template the manifest will reflect the problem -- consider the following manifest:

```
{
    "Metadata": {
        "IDReportDescription": "0",
        "GUIDReportDescription": "0x560c0aa952000000",
        "Type": "badtemplate",
        "Title": "The Default Report",
        "Summary": "This is the summary for the default report.",
        "Renderer": "html",
        "DefaultFile": "index.html",
        "Version": 0,
        "Creator": "Unknown",
        "CreatingIDUser": 0,
        "CreateDate": false,
        "Updator": "",
        "UpdatingIDUser": 0,
        "UpdateDate": false,
        "LocationHash": "0x560c0aa952000000",
        "RepresentedDateBegin": false,
        "RepresentedDateEnd": false,
        "Locations": {
            "Root": "/Retold/tidings/test/../stage/0x560c0aa952000000/",
            "Asset": "/Retold/tidings/test/../stage/0x560c0aa952000000/Assets/",
            "Stage": "/Retold/tidings/test/../stage/0x560c0aa952000000/Stage/",
            "Scratch": "/Retold/tidings/test/../stage/0x560c0aa952000000/Scratch/",
            "ReportDefinition": "/Retold/tidings/test/reports/badtemplate/",
            "Common": "/Retold/tidings/test/reports/badtemplate/common/"
        }
    },
    "Status": {
        "Rendered": true,
        "CompletionProgress": 100,
        "StartTime": 1478276851016,
        "EndTime": 1478276851047,
        "CompletionTime": 31
    },
    "AssetCollectionList": [],
    "RasterizationList": [],
    "Errors": [
        {
            "Type": "Template Parsing Error",
            "Template": "index.html",
            "Location": "/Retold/tidings/test/reports/badtemplate//html",
            "Source": "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>THIS HAS AN OBVIOUSLY BAD UNDERSCORE TEMPLATE (immediately following this) <%= Datum.Name </title>\n  </head>\n  <body>\n<% Behaviors.manifestLog(Manifest, 'This is rad'); %>\n\t  <h1><%= Datum.Name %></h1>\n\t  <p>This is the default report.  For some datum.  By the way it has <%= Datum.Name.length %> bytes in the Name property.  And this report has GUID Manifest <%= Manifest.Metadata.GUIDReportDescription %>.</p>\n  </body>\n</html>",
            "GeneratedCode": "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\nwith(obj||{}){\n__p+='<!DOCTYPE html>\\n<html>\\n  <head>\\n    <meta charset=\"UTF-8\">\\n    <title>THIS HAS AN OBVIOUSLY BAD UNDERSCORE TEMPLATE (immediately following this) '+\n((__t=( Datum.Name </title>\n  </head>\n  <body>\n<% Behaviors.manifestLog(Manifest, 'This is rad'); ))==null?'':__t)+\n'\\n\t  <h1>'+\n((__t=( Datum.Name ))==null?'':__t)+\n'</h1>\\n\t  <p>This is the default report.  For some datum.  By the way it has '+\n((__t=( Datum.Name.length ))==null?'':__t)+\n' bytes in the Name property.  And this report has GUID Manifest '+\n((__t=( Manifest.Metadata.GUIDReportDescription ))==null?'':__t)+\n'.</p>\\n  </body>\\n</html>';\n}\nreturn __p;\n",
            "ValidationData": {
                "Enclosures": {
                    "Type": "Expression",
                    "Left": {},
                    "LeftCount": 5,
                    "Right": {},
                    "RightCount": 4
                },
                "CodePositions": {
                    "145": "Left",
                    "188": "Left",
                    "239": "Right",
                    "249": "Left",
                    "264": "Right",
                    "342": "Left",
                    "364": "Right",
                    "430": "Left",
                    "474": "Right"
                },
                "Warnings": [
                    "Enclosures out of balance!  This will almost definitely break your template.",
                    "Enclosure at character 145 (ending at 188) not properly balanced!",
                    "Code between 145 and 190: <%= Datum.Name </title>\n  </head>\n  <body>\n<%"
                ],
                "EnclosureBalance": -1
            }
        }
    ],
    "Templates": [
        {
            "File": "index.html",
            "Path": "/Retold/tidings/test/reports/badtemplate//html"
        }
    ],
    "Log": [
        "Fri, 30 Sep 2016 16:27:31 GMT: Creating folders at /Retold/tidings/test/../stage/0x560c0aa952000000",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Datum",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Loaded definition: /Retold/tidings/test/reports/badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Loading the Report-Specific Behaviors",
        "Fri, 30 Sep 2016 16:27:31 GMT: Parsing the Report Definition for Renderer",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Adding template [object Object]",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Executing report pre-collect",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Default behavior.",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Collecting assets...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Asset downloads complete.",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Executing calculate function...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Default behavior.",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Processing templates...",
        "Fri, 30 Sep 2016 16:27:31 GMT: Error parsing template: SyntaxError: Invalid regular expression: missing /",
        "Fri, 30 Sep 2016 16:27:31 GMT: --> Wrote stage data: index.html TO /Retold/tidings/test/../stage/0x560c0aa952000000/Stage/",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Template processing complete.",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Running rasterizer...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...auto rasterization complete.",
        "Fri, 30 Sep 2016 16:27:31 GMT: This is really rasterizey...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Executing post-render functions...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Default behavior.",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: Cleaning up temporary files...",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...persisted the Report Manifest for 0x560c0aa952000000 type badtemplate",
        "Fri, 30 Sep 2016 16:27:31 GMT: ...Report rendered.",
        "Fri, 30 Sep 2016 16:27:31 GMT: Rendering completed in 31ms"
    ]
}
```

Or more specifically, check out this section:

```
    "Errors": [
        {
            "Type": "Template Parsing Error",
            "Template": "index.html",
            "Location": "/Retold/tidings/test/reports/badtemplate//html",
            "Source": "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>THIS HAS AN OBVIOUSLY BAD UNDERSCORE TEMPLATE (immediately following this) <%= Datum.Name </title>\n  </head>\n  <body>\n<% Behaviors.manifestLog(Manifest, 'This is rad'); %>\n\t  <h1><%= Datum.Name %></h1>\n\t  <p>This is the default report.  For some datum.  By the way it has <%= Datum.Name.length %> bytes in the Name property.  And this report has GUID Manifest <%= Manifest.Metadata.GUIDReportDescription %>.</p>\n  </body>\n</html>",
            "GeneratedCode": "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\nwith(obj||{}){\n__p+='<!DOCTYPE html>\\n<html>\\n  <head>\\n    <meta charset=\"UTF-8\">\\n    <title>THIS HAS AN OBVIOUSLY BAD UNDERSCORE TEMPLATE (immediately following this) '+\n((__t=( Datum.Name </title>\n  </head>\n  <body>\n<% Behaviors.manifestLog(Manifest, 'This is rad'); ))==null?'':__t)+\n'\\n\t  <h1>'+\n((__t=( Datum.Name ))==null?'':__t)+\n'</h1>\\n\t  <p>This is the default report.  For some datum.  By the way it has '+\n((__t=( Datum.Name.length ))==null?'':__t)+\n' bytes in the Name property.  And this report has GUID Manifest '+\n((__t=( Manifest.Metadata.GUIDReportDescription ))==null?'':__t)+\n'.</p>\\n  </body>\\n</html>';\n}\nreturn __p;\n",
            "ValidationData": {
                "Enclosures": {
                    "Type": "Expression",
                    "Left": {},
                    "LeftCount": 5,
                    "Right": {},
                    "RightCount": 4
                },
                "CodePositions": {
                    "145": "Left",
                    "188": "Left",
                    "239": "Right",
                    "249": "Left",
                    "264": "Right",
                    "342": "Left",
                    "364": "Right",
                    "430": "Left",
                    "474": "Right"
                },
                "Warnings": [
                    "Enclosures out of balance!  This will almost definitely break your template.",
                    "Enclosure at character 145 (ending at 188) not properly balanced!",
                    "Code between 145 and 190: <%= Datum.Name </title>\n  </head>\n  <body>\n<%"
                ],
                "EnclosureBalance": -1
            }
        }
    ]
```

This is telling us the Underscore template does not have balanced brackets, and where it likely occurs.



