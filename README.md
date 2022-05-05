# OctoPrint-ExtraFileInfo
Adds slicer settings to the additional data tab of each file. Uses [Octoprint-SlicerSettingsParser-Python3](https://github.com/Rob4226/OctoPrint-SlicerSettingsParser-Python3) to get the data.

![img](https://user-images.githubusercontent.com/39745476/166110980-ca65be31-cba5-4fcd-aba4-c384fdc39366.png)

This plugin is still WIP, but I have not encountered any issues.

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/larsjuhw/OctoPrint-Extrafileinfo/archive/master.zip

Requires [Octoprint-SlicerSettingsParser](https://github.com/tjjfvi/OctoPrint-SlicerSettingsParser), **but you'll need the [Octoprint-SlicerSettingsParser-Python3](https://github.com/Rob4226/OctoPrint-SlicerSettingsParser-Python3) fork for Python 3 support.**


## Configuration


| **Setting**      	| **Description**                                                 	|
|------------------	|-----------------------------------------------------------------	|
| Key              	| The "key" of your slicer setting in SlicerSettingsParser        	|
| Label (optional) 	| A label that replaces the key in the file info view             	|
| Unit (optional)  	| The unit suffix that is appended after the value of the setting 	|

The Key, Label and Unit fields are directly injected into the view, without any sanitization. Therefore, the use of HTML tags (such as label=`<strong>Material` and unit=`</strong>`) is allowed.

Only the settings that are configured and found by SlicerSettingsParser in the file are shown.


## Note
If someone knows how to change the settings to a variable amount of entries, feel free to make a PR.
