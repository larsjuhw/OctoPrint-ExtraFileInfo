/*
 * View model for OctoPrint-Extrafileinfo
 *
 * Author: Lars Wolter
 * License: AGPLv3
 */
$(function () {
    function ExtrafileinfoViewModel(parameters) {
        var self = this;

        self.filesViewModel = parameters[0];
        self.settingsViewModel = parameters[1];
        
        self.config = ko.observableArray();

        self.settingsViewModel.onStartupComplete = function () {
            // Show warning message if Cura Thumbnails is installed.
            if (self.settingsViewModel.settings.plugins.UltimakerFormatPackage === undefined) {
                $('#ufp_installed_warning').alert('close');
            }
        }

        self.filesViewModel.ExtraFileInfo_getInfo = function(data) {
            const slicerSettings = data.slicer_settings;
            var visibleKeys = self.settingsViewModel.settings.plugins.extrafileinfo.config();
            if (slicerSettings === undefined) {
                return "Reload for more info<br>";
            }
            let returnStr = "";

            // Create filter regex if filter enabled
            let filterRE;
            if (self.settingsViewModel.settings.plugins.extrafileinfo.filterEnabled()) {
                const filter = self.settingsViewModel.settings.plugins.extrafileinfo.filter();
                filterRE = new RegExp('[' + filter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ']', 'g');
            }

            for (let i = 0; i < visibleKeys.length; i++) {
                if (slicerSettings[visibleKeys[i].key()] === undefined) {
                    continue;
                }
                const label = visibleKeys[i].label() || visibleKeys[i].key();
                const unit = visibleKeys[i].unit();
                var value = slicerSettings[visibleKeys[i].key()];

                // Apply filter
                if (self.settingsViewModel.settings.plugins.extrafileinfo.filterEnabled()) {
                    value = value.replaceAll(filterRE, '');
                }
                
                returnStr = returnStr + label + ": " + value + unit + "<br>";
            };
            return returnStr;
        };

        // Hijack the getAdditionalData function and add the custom data
        let oldGetData = self.filesViewModel.getAdditionalData;
        self.filesViewModel.getAdditionalData = function(data) {
            let returnStr = "" + oldGetData(data);
            if (!returnStr.endsWith('<br>')) {
                returnStr = returnStr + "<br>";
            }
            returnStr = returnStr + self.filesViewModel.ExtraFileInfo_getInfo(data);
            return returnStr;
        }
        
        self.settingsViewModel.addParserRow = function() {
            self.settingsViewModel.settings.plugins.extrafileinfo.config.push({
                'key':ko.observable(''),
                'label':ko.observable(''),
                'unit':ko.observable(''),
            });
        }

        self.settingsViewModel.removeParserRow = function(row) {
            self.settingsViewModel.settings.plugins.extrafileinfo.config.remove(row);
        }

        self.settingsViewModel.onBeforeBinding = function() {
            self.config(self.settingsViewModel.settings.plugins.extrafileinfo.config());
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtrafileinfoViewModel,
        dependencies: [ 'filesViewModel', 'settingsViewModel' ],
        elements: [ /* ... */ ]
    });
});
