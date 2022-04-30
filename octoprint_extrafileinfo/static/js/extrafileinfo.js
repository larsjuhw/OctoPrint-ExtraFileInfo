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
        
        const visibleKeys = ["Layer Height", "Nozzle Diameter", "Material Diameter"];
        self.filesViewModel.ExtraFileInfo_getInfo = function(data) {
            const slicerSettings = data.slicer_settings;
            let returnStr = "";
            visibleKeys.forEach((element) => {
                if (slicerSettings[element] === undefined) {
                    return;
                }

                returnStr = returnStr + element + ": " + slicerSettings[element] + "<br>";
            });
            return returnStr;
        };

        // Hijack the getAdditionalData function and add the custom data
        let oldGetData = self.filesViewModel.getAdditionalData;
        self.filesViewModel.getAdditionalData = function(data) {
            return "" + oldGetData(data) + self.filesViewModel.ExtraFileInfo_getInfo(data);
        }
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: ExtrafileinfoViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ 'filesViewModel' ],
        // Elements to bind to, e.g. #settings_plugin_extrafileinfo, #tab_plugin_extrafileinfo, ...
        elements: [ /* ... */ ]
    });
});
