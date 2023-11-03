/*
 * View model for OctoPrint-Extrafileinfo
 *
 * Author: Lars Wolter
 * License: AGPLv3
 */
$(function () {
    function ExtrafileinfoViewModel(parameters) {
        var self = this;
        var efi_editor = undefined;

        var setup = 'simple';

        self.rendering_info = ko.observable(false);
        self.show_error_alert = ko.observable(false);//TODO
        self.rendering_done = ko.observable(false);

        self.filesViewModel = parameters[0];
        self.settingsViewModel = parameters[1];
        self.printerState = parameters[2];
        
        // Select the correct template before binding, as settings are already loaded.
        self.filesViewModel.onBeforeBinding = function() {
            self.selectTemplate();
        };
        
        /**
         * Returns the additional information for the files list items.
         * @param {Object} data The data object for the current file.
         */
        self.filesViewModel.ExtraFileInfo_getExtraInfo = function(data) {
            return data[`extrafileinfo_render_${setup}_file`] || '';
        };

        /**
         * Sets the setup variable to the correct value.
         */
        self.selectTemplate = function() {
            const setupType = self.settingsViewModel.settings.plugins.extrafileinfo.setup_type;
            const mapping = {
                'Simple': 'simple',
                'Custom Jinja2 Template': 'custom'
            };
            setup = mapping[setupType()] || 'simple';
        };


        /**
         * Sends an API request to force a re-render of the files list.
         * Called by the "Force Update" button in the settings panel.
         */
        self.forceRender = function() {
            console.debug('[ExtraFileInfo] Sending force render request');
            self.rendering_info(true);
            self.show_error_alert(false);
            self.rendering_done(false);

            $.ajax({
                url: API_BASEURL + 'plugin/extrafileinfo',
                type: 'POST',
                data: JSON.stringify({ command: 'force_render' }),
                contentType: 'application/json; charset-UTF-8'
            }).done(function(data) {
                console.debug('[ExtraFileInfo] Force render successful');
                self.rendering_info(false);
                self.rendering_done(true);
                $('#FD_edit_menu').modal('hide');
            }).fail(function(data) {
                console.error('[ExtraFileInfo] Force render failed');
                self.rendering_info(false);
                self.show_error_alert(true);
            });
        };

        
        /**
         * Adds a row to the config list.
         */
        self.addParserRow = function() {
            self.settingsViewModel.settings.plugins.extrafileinfo.config.push({
                'key': ko.observable(''),
                'label': ko.observable(''),
                'unit': ko.observable(''),
                'showInFilesList': ko.observable(true),
                'showInStatesContainer': ko.observable(true)
            });
        };

        /**
         * Removes a row from the config list. 
         */
        self.removeParserRow = function(row) {
            self.settingsViewModel.settings.plugins.extrafileinfo.config.remove(row);
        };
        
        /**
         * 
         */
        self.onBeforeBinding = function() {
            // Show warning message if Cura Thumbnails is installed.
            if (self.settingsViewModel.settings.plugins.UltimakerFormatPackage === undefined) {
                $('#ufp_installed_warning').alert('close');
            }
        };

        $(document).ready(function() {
            // Inject the information div into files list template
            additionalInfo_div = '<div class="additionalInfo hide" data-bind="html: $root.getAdditionalData($data)"></div>';
            $('#files_template_machinecode').text(function() {
                return $(this).text().replace(additionalInfo_div, `${additionalInfo_div}<div class="additionalInfo hide" id="extrafileinfo-fm"><hr style="margin:2px 0;"><div data-bind="html: $root.ExtraFileInfo_getExtraInfo($data)"></div></div>`);
            });
            
            // Inject the information div into printer state
            $('#job_progressBar').parent().before(
                `<hr/><div data-bind="html: $root.ExtraFileInfo_getExtraInfo"></div>`
            )
        });

        /**
         * Initializes the ace editor in the settings panel.
         * TODO: Only load the editor and its .js files when necessary.
         */
        self.settingsViewModel.onStartupComplete = function() {
            ace.config.set("basePath", "plugin/extrafileinfo/static/js/lib/ace");
            efi_editor = ace.edit("extrafileinfo-editor");
            efi_editor.session.setMode("ace/mode/django");
            efi_editor.setOptions({
                hScrollBarAlwaysVisible: false,
                vScrollBarAlwaysVisible: false,
                autoScrollEditorIntoView: true,
                showPrintMargin: false,
            });
            efi_editor.renderer.setOptions({
                fontSize: '14px',
                fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Consolas", "Source Code Pro", "source-code-pro", monospace'
            });
            efi_editor.session.setValue(self.settingsViewModel.settings.plugins.extrafileinfo.custom_template());
        };

        self.settingsViewModel.onSettingsBeforeSave = function() {
            self.selectTemplate();
            // Save the custom template
            if (setup == 'custom') {
                self.settingsViewModel.settings.plugins.extrafileinfo.custom_template(efi_editor.getValue());
            }

            // Try to force a reload after a delay. This will not always work, but it doesn't matter.
            setTimeout(() => {
                console.debug('[ExtraFileInfo] Forcing reload of files list');
                self.filesViewModel.requestData({force: true})
            }, 1000);
        };

        /**
         * Computed observable for the additional information div in the printer state container.
         */
        self.printerState.ExtraFileInfo_getExtraInfo = ko.pureComputed(function() {
            let selectedFile = self.filesViewModel.listHelper.selectedItem();
            if ( selectedFile === undefined ) return '';

            rendered_info = selectedFile[`extrafileinfo_render_${setup}_print`];

            if ( rendered_info === undefined ) return '';

            return rendered_info;
        });
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtrafileinfoViewModel,
        dependencies: [ 'filesViewModel', 'settingsViewModel','printerStateViewModel' ],
        elements: [ '#settings_plugin_extrafileinfo' ]
    });
});
