/*
 * View model for OctoPrint-Extrafileinfo
 *
 * Author: Lars Wolter
 * License: AGPLv3
 */
$(function() {
    function ExtrafileinfoViewModel(parameters) {
        var self = this;

        self.filesViewModel = parameters[0];
        self.settingsViewModel = parameters[1];

        self.filesViewModel.ExtraFileInfo_getInfo = function(data) {
            const slicerSettings = data.slicer_settings;
            var visibleKeys = self.settingsViewModel.settings.plugins.extrafileinfo.config();
            if (slicerSettings === undefined) {
                return "Reload for more info<br>";
            }
            let returnStr = "";
            for (let i = 0; i < visibleKeys.length; i++) {
                if (slicerSettings[visibleKeys[i].key()] === undefined) {
                    continue;
                }
                const label = visibleKeys[i].label() || visibleKeys[i].key();
                const value = slicerSettings[visibleKeys[i].key()];
                const unit = visibleKeys[i].unit();
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
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtrafileinfoViewModel,
        dependencies: [ 'filesViewModel', 'settingsViewModel' ],
        elements: [ /* ... */ ]
    });
});
