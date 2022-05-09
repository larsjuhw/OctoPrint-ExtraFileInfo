# OctoPrint-ExtraFileInfo
Adds slicer settings to the additional data tab of each file. Uses [Octoprint-SlicerSettingsParser-Python3](https://github.com/Rob4226/OctoPrint-SlicerSettingsParser-Python3) to get the data.

![img](https://user-images.githubusercontent.com/39745476/166110980-ca65be31-cba5-4fcd-aba4-c384fdc39366.png)

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/larsjuhw/OctoPrint-Extrafileinfo/archive/master.zip

Requires [Octoprint-SlicerSettingsParser](https://github.com/tjjfvi/OctoPrint-SlicerSettingsParser), **but you'll need the [Octoprint-SlicerSettingsParser-Python3](https://github.com/Rob4226/OctoPrint-SlicerSettingsParser-Python3) fork for Python 3 support.**


## Configuration

### SlicerSettingsParser
After installing, you need to configure SlicerSettingsParser to parse your gcode files and find the commented settings in them. Press the "Analyze all files" button to scan your old files. Note: this can take a long time if you have very large files.

Using the default regex, Slic3r, Simplify3D and Cura are supported. However, if you use Cura you need to add [this](https://gist.github.com/tjjfvi/75210b2ed20ed194d6eab48bf70c4f12) to your start/end gcode. More gcode variables supported by Cura can be found [here](http://files.fieldofview.com/cura/Replacement_Patterns.html).

### ExtraFileInfo

| **Setting**      	| **Description**                                                 	|
|------------------	|-----------------------------------------------------------------	|
| Key              	| The "key" of your slicer setting in SlicerSettingsParser        	|
| Label (optional) 	| A label that replaces the key in the file info view             	|
| Unit (optional)  	| The unit suffix that is appended after the value of the setting 	|

The Key, Label and Unit fields are directly injected into the view, without any sanitization. Therefore, the use of HTML tags (such as label=`<strong>Material</strong>`) is allowed.

Only the settings that are configured and found by SlicerSettingsParser in the file are shown.


## Example

The gcode file that I upload contains the following lines:

```
; layer_height = 0.2
; adaptive_layer_height_enabled = False
; adhesion_type = skirt
```
The default settings of SlicerSettingsParser support this format. To display these values in the file info, I configure this plugin as such, while leaving the other settings empty:

![example1](https://user-images.githubusercontent.com/39745476/167319682-c213b3aa-f246-42a7-abbd-f5d5a8b4d76a.png)

This gives the following result in the files menu:

![example2](https://user-images.githubusercontent.com/39745476/167319851-153a04f6-fa25-4d85-8c32-e2345b508635.png)


## Known Issues

* SlicerSettingsParser does not parse newly uploaded files when Cura Thumbnails/UltimakerFormatPackage is installed, [as described here](https://github.com/tjjfvi/OctoPrint-SlicerSettingsParser/issues/7). Use [Slicer Thumbnails](https://plugins.octoprint.org/plugins/prusaslicerthumbnails/#cura) instead to solve this.

## Note
If someone knows how to change the settings to a variable amount of entries, feel free to make a PR.
