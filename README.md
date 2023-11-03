# OctoPrint-ExtraFileInfo
Adds slicer settings to the additional data tab of each file and/or the active print info. Extremely customizable using a user-input Jinja template. Uses [SlicerSettingsParser](https://github.com/larsjuhw/OctoPrint-SlicerSettingsParser) (installs automatically) to parse the slicer data from the gcode files.

Additional Data | Active Print Info
:-:|:-:
![img](https://user-images.githubusercontent.com/39745476/166110980-ca65be31-cba5-4fcd-aba4-c384fdc39366.png) | ![image](https://user-images.githubusercontent.com/39745476/173201083-3b36083e-39a1-4831-8375-840848b16b6b.png)

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/larsjuhw/OctoPrint-Extrafileinfo/archive/master.zip

Requires [Octoprint-SlicerSettingsParser](https://github.com/larsjuhw/OctoPrint-SlicerSettingsParser) which will install automatically


## Configuration

### SlicerSettingsParser
Please read [SlicerSettingsParser's documentation](https://github.com/larsjuhw/OctoPrint-SlicerSettingsParser#configuration) before continuing.

SlicerSettingsParser searches through your gcode files to find commented lines that contain the slicer settings. Some slicers automatically add these lines to your gcode files, but not all do it by default. The parser finds the key:value sets of these settings by matching each line with a regex. The default regex supports Slic3r and Simplify3D (and the Cura configuration below).

After installing, you need to configure SlicerSettingsParser to parse your gcode files and find the commented settings in them. Press the "Analyze all files" button on the settings page of SlicerSettingsParser to scan your old files. Note that my Raspberry Pi 4B 2GB can only handle around 4 MB/s, so this can take a while depending on your files and setup.

**If you use Cura, you need to add [this](https://gist.github.com/larsjuhw/3db286b71d9c91ca7c72d3fd3325af9f) to your start or end gcode.** More gcode variables that Cura supports can be found [on this page](http://files.fieldofview.com/cura/Replacement_Patterns.html). If you want to add these manually, make sure that you keep using the `; key = {variable}` style.


### ExtraFileInfo
The plugin offers two configuration methods: simple and custom setup. The simple setup only requires entering slicer setting keys, while the custom setup allows you to enter a Jinja template to customize the output entirely.

### Simple Setup

| **Setting**      	| **Description**                                                 	|
|------------------	|-----------------------------------------------------------------	|
| Key              	| The "key" of your slicer setting in SlicerSettingsParser        	|
| Label (optional) 	| A label that replaces the key in the file info view             	|
| Unit (optional)  	| The unit suffix that is appended after the value of the setting 	|

The Key, Label and Unit fields are directly injected into the view, without any sanitization. Therefore, the use of HTML tags (such as label=`<strong>Material</strong>`) is allowed. The slicer setting values are sanitized.

Only the settings that are configured and found by SlicerSettingsParser in the file are shown.

The plugin also has an option to filter out specific characters in the values of all settings. For example, if your gcode contains this:

`; filament_settings_id = "Prusament ASA"`

then you can filter out the quotation marks if you want.


### Custom Jinja Template
Using a Jinja template allow you to fit the slicer settings output to your own taste. You can use if-else statements, enter HTML tags, use filters and tests, and customize the layout entirely. The slicer settings can be accessed simply by using their key as a variable, e.g.: `{{ layer_height }}`. The variables are automatically HTML-escaped for safety.

**Do not blindly copy anyone's template from the internet. The templates can contain HTML tags and therefore arbitrary code.**

The following extra variables are accessible for further customization:
| Variable     | Value                                                                                                 |
|--------------|-------------------------------------------------------------------------------------------------------|
| `_location_` | `'file'` or `'print'`, depending on whether the render is for the file list or print status container |
| TBD          |                                                                                                       |

#### Example templates:


## Example

The gcode file that I upload contains the following lines:

```
; layer_height = 0.2
; adaptive_layer_height_enabled = False
; adhesion_type = skirt
```
The default settings of SlicerSettingsParser support this format. To display these values in the file info, I configure this plugin as such, while leaving the other settings empty:

![example1](https://user-images.githubusercontent.com/39745476/173201388-6e957c01-3399-42fb-bbf7-db6241f13897.png)

This gives the following result in the files menu:

![example2](https://user-images.githubusercontent.com/39745476/167319851-153a04f6-fa25-4d85-8c32-e2345b508635.png)


## Known Issues

* SlicerSettingsParser does not parse newly uploaded files when Cura Thumbnails/UltimakerFormatPackage is installed, [as described here](https://github.com/tjjfvi/OctoPrint-SlicerSettingsParser/issues/7). Use [Slicer Thumbnails](https://plugins.octoprint.org/plugins/prusaslicerthumbnails/#cura) instead to solve this.

## Note
Thanks to [EVSalomon](https://github.com/EVSalomon) for making the amount of entries variable
