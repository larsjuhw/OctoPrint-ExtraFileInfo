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
        self.printerState = parameters[2];
        
        self.config = ko.observableArray();

        self.settingsViewModel.onStartupComplete = function () {
            // Show warning message if Cura Thumbnails is installed.
            if (self.settingsViewModel.settings.plugins.UltimakerFormatPackage === undefined) {
                $('#ufp_installed_warning').alert('close');
            }
        }

        self.filesViewModel.ExtraFileInfo_getInfo = function(data,html) {
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
                const showInFilesList = visibleKeys[i].showInFilesList();
                const showInStatesContainer = visibleKeys[i].showInStatesContainer();
                var value = slicerSettings[visibleKeys[i].key()];

                // Apply filter
                if (self.settingsViewModel.settings.plugins.extrafileinfo.filterEnabled()) {
                    value = value.replaceAll(filterRE, '');
                }
                if ( html ) {
                    if ( showInStatesContainer ) returnStr = returnStr + label + ": <strong>" + value + unit + "</strong><br>";
                } else {
                    if ( showInFilesList ) returnStr = returnStr + label + ": " + value + unit + "<br>";
                }
            };
            if ( returnStr != "" && html ) returnStr += "<br>";
            return returnStr;
        };

        // Hijack the getAdditionalData function and add the custom data
        let oldGetData = self.filesViewModel.getAdditionalData;
        self.filesViewModel.getAdditionalData = function(data) {
            let extraInfo = self.filesViewModel.ExtraFileInfo_getInfo(data, false);
            let returnStr = "" + oldGetData(data);
            if (extraInfo.length == 0) {
                return returnStr;
            }

            if (!returnStr.endsWith('<br>')) {
                returnStr += "<br>";
            }
            returnStr += "<hr style=\"margin:2px 0;\">";
            returnStr += extraInfo;
            return returnStr;
        }
        
        self.settingsViewModel.addParserRow = function() {
            self.settingsViewModel.settings.plugins.extrafileinfo.config.push({
                'key':ko.observable(''),
                'label':ko.observable(''),
                'unit':ko.observable(''),
                'showInFilesList': ko.observable(true),
                'showInStatesContainer': ko.observable(true)
            });
        }

        self.settingsViewModel.removeParserRow = function(row) {
            self.settingsViewModel.settings.plugins.extrafileinfo.config.remove(row);
        }

        self.settingsViewModel.onBeforeBinding = function() {
            self.config(self.settingsViewModel.settings.plugins.extrafileinfo.config());
        }

        self.onBeforeBinding = function() {
            var element = $("#state").find(".progress");
            element.before("<div id='extrafileinfo_string'>" +
                    "<hr /> <div data-bind='html: extrafileinfoHtml'></div>" +
                    "</div>");
        }

        self.extrafileinfoHtml = ko.pureComputed(function() {
            if (self.printerState.filename() === undefined) return "";
            if (self.filesViewModel.filesOnlyList().length == 0) return "";
            if (self.printerState.filepath() === undefined) return "";

            var list = self.filesViewModel.filesOnlyList();

            if ( list.length > 0 ) {
                let actualFile = list.find(elem => elem.path === self.printerState.filepath() );
                if ( actualFile !== undefined && actualFile.slicer_settings !== undefined ) {
                    return self.filesViewModel.ExtraFileInfo_getInfo(actualFile,true);
                }
            }
            return "";
        });
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtrafileinfoViewModel,
        dependencies: [ 'filesViewModel', 'settingsViewModel','printerStateViewModel' ],
        elements: ['#extrafileinfo_string' ]
    });
});
