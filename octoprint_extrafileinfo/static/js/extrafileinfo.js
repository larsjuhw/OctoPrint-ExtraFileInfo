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
        
        //TODO add this as a setting instead
        // Defined as [[key0, key1, ...], [unit1, unit2, ...]]
        const visibleKeys = [["Layer Height", "Nozzle Diameter", "Infill Density", "Material Name"], [" mm", " mm", "%", ""]];
        self.filesViewModel.ExtraFileInfo_getInfo = function(data) {
            const slicerSettings = data.slicer_settings;
            if (slicerSettings === undefined) {
                return "Reload for more info<br>";
            }
            let returnStr = "";
            for (let i = 0; i < visibleKeys[0].length; i++) {
                if (slicerSettings[visibleKeys[0][i]] === undefined) {
                    continue;
                }
                returnStr = returnStr + visibleKeys[0][i] + ": " + slicerSettings[visibleKeys[0][i]] + visibleKeys[1][i] + "<br>";
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
        dependencies: [ 'filesViewModel' ],
        elements: [ /* ... */ ]
    });
});
