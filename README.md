# OctoPrint-ExtraFileInfo
Adds slicer settings to the additional data tab of each file. Uses [Octoprint-SlicerSettingsParser](https://github.com/tjjfvi/OctoPrint-SlicerSettingsParser) to get the data.

![img](https://user-images.githubusercontent.com/39745476/166110980-ca65be31-cba5-4fcd-aba4-c384fdc39366.png)

This plugin is still WIP, but I have not encountered any issues.

## Configuration

I have not yet added a settings menu as I do not know how to. The settings you want to show are currently defined in [extrafileinfo.js](octoprint_extrafileinfo/static/js/extrafileinfo.js) as such:

```javascript
// Defined as [[key0, key1, ...], [unit1, unit2, ...]]
const visibleKeys = [["Layer Height", "Nozzle Diameter", "Infill Density", "Material Name"], [" mm", " mm", "%", ""]];
```

Only the settings that are configured and specified in the file are shown.

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/larsjuhw/OctoPrint-Extrafileinfo/archive/master.zip

Requires [Octoprint-SlicerSettingsParser](https://github.com/tjjfvi/OctoPrint-SlicerSettingsParser) or [Octoprint-SlicerSettingsParser-Python3](https://github.com/Rob4226/OctoPrint-SlicerSettingsParser-Python3) for Python 3 support.