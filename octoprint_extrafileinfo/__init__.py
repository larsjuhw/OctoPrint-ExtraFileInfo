# coding=utf-8
from __future__ import absolute_import

import re

import octoprint.plugin
from jinja2 import FileSystemLoader, TemplateSyntaxError
from jinja2.environment import Template
from jinja2.sandbox import SandboxedEnvironment, SecurityError
from octoprint.filemanager.storage import LocalFileStorage

SETUP_SIMPLE = 'Simple'
SETUP_CUSTOM = 'Custom Jinja2 Template'
KEY_SIMPLE = 'simple'
KEY_CUSTOM = 'custom'

#TODO: add example template to settings
#TODO: test settings migration
#TODO: check if the path to the templates folder is correct for the filesystemloader, need to test with other installation
class ExtraFileInfoPlugin(
        octoprint.plugin.AssetPlugin,
        octoprint.plugin.EventHandlerPlugin,
        octoprint.plugin.TemplatePlugin,
        octoprint.plugin.SettingsPlugin,
        octoprint.plugin.SimpleApiPlugin,
        octoprint.plugin.StartupPlugin):
    
    migrate_to_version_4 = False
    def on_after_startup(self):
        self._storage: LocalFileStorage = self._file_manager._storage("local")
        self.environment_custom = SandboxedEnvironment(
            cache_size=2,
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True,
        )
        self.environment_simple = SandboxedEnvironment(
            cache_size=1,
            autoescape=True,
            loader=FileSystemLoader('octoprint_extrafileinfo/templates/'),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        if self._settings.get(['setup_type']) == SETUP_CUSTOM:
            self._load_custom_template()
        elif self._settings.get(['setup_type']) == SETUP_SIMPLE: 
            self._load_simple_template()

        if ExtraFileInfoPlugin.migrate_to_version_4:
            self._logger.info('Migrating settings to version 4: rendering info for all files.')
            self._render_all_file_info(self.default_template, KEY_SIMPLE, packed=True)            

    def get_settings_defaults(self):
        return dict(
            config=[dict(key="", label="", unit="", showInFilesList=True, showInStatesContainer=True)],
            filterEnabled=False,
            filter="",
            setup_type=SETUP_SIMPLE,
            custom_template=""
        )
    
    def get_api_commands(self):
        return {
            'force_render': []
        }

    def _load_custom_template(self):
        try:
            self.template = self.environment_custom.from_string(self._settings.get(['custom_template']))
            self._logger.info('Custom Jinja2 template loaded successfully.')
        except (SecurityError, TemplateSyntaxError) as e:
            self._logger.error(f'The custom jinja2 template is invalid. Error: {e.message}')

    def _load_simple_template(self):
        self._load_filter_pattern()
        self.default_template = self.environment_simple.get_template('extrafileinfo_additionalInfo.jinja2')
        self._logger.info('Loaded default template.')

    def _load_filter_pattern(self):
        filter_enabled = self._settings.get(['filterEnabled'])
        filter_chars = self._settings.get(['filter'])
        if not filter_enabled or not filter_chars:
            self.filter_pattern = None
        else:
            self.filter_pattern = re.compile(f'[{re.escape(filter_chars)}]')
        self._logger.debug(f'Loaded filter pattern: {self.filter_pattern}')

    def on_settings_save(self, data):
        # TODO: add success message to front end
        return_value = super().on_settings_save(data)

        # Load template again if settings changed or setup type changed
        if 'config' in data or 'filter' in data or 'filterEnabled' in data or ('setup_type' in data and data['setup_type'] == SETUP_SIMPLE):
            self._load_simple_template()

        # Re-render everything if the settings changed
        if 'config' in data or 'filter' in data or 'filterEnabled' in data:
            self._render_all_file_info(self.default_template, KEY_SIMPLE, packed=True)
        
        # Load custom template if it was changed or setup type changed
        if 'custom_template' in data or 'setup_type' in data and data['setup_type'] == SETUP_CUSTOM:
            self._load_custom_template()

        # Re-render everything if the custom template changed
        if 'custom_template' in data:
            self._render_all_file_info(self.template, KEY_CUSTOM, packed=False, br_replace=True)
            
        return return_value

    def get_assets(self):
        return {
            "js": ["js/extrafileinfo.js"],
            'css': ['css/extrafileinfo.css'],
        }

    def get_template_configs(self):
        return [
            dict(type="settings", template="extrafileinfo_settings.jinja2", custom_bindings=True)
        ]
    
    def on_event(self, event: str, payload: dict):
        if event == 'plugin_SlicerSettingsParser_file_analyzed':
            self._logger.debug(f'File analyzed: {payload["path"]}')
            active_template = self._settings.get(['setup_type'])

            if active_template == SETUP_SIMPLE:
                filter_enabled = self._settings.get(['filterEnabled'])
                self._render_file_info(payload['path'], self.default_template, KEY_SIMPLE, packed=True, filter=filter_enabled)
            elif active_template == SETUP_CUSTOM:
                self._render_file_info(payload['path'], self.template, KEY_CUSTOM, packed=False, br_replace=True)


    def _render_file_info(self, path: str, template: Template, key: str, packed: bool, filter=None, br_replace: bool=False):
        """Renders the default simple template for the given file and stores it in the file's metadata.
        Replaces all newlines with <br> if br_replace is True.
        Packs all slicer settings into a dict if packed is True."""
        path = self._storage.path_on_disk(path)
        slicer_settings = self._storage.get_additional_metadata(path, 'slicer_settings')


        # Apply filter if enabled
        if key == KEY_SIMPLE and filter is None:
            filter = self._settings.get(['filterEnabled'])
        if filter and key == KEY_SIMPLE:
                slicer_settings = {k: self.filter_pattern.sub('', v) for k, v in slicer_settings.items()}

        # Pack slicer settings into a dict if packed is True
        if packed:
            slicer_settings = {'_settings_': slicer_settings}


        if key == KEY_SIMPLE:
            slicer_settings['_config_'] = self._settings.get(['config'])

        file_rendered_template = template.render({**slicer_settings, '_location_': 'file'})
        print_rendered_template = template.render({**slicer_settings, '_location_': 'print'})

        if br_replace:
            file_rendered_template = file_rendered_template.replace('\n', '<br>')
            print_rendered_template = print_rendered_template.replace('\n', '<br>')

        self._storage.set_additional_metadata(path, f'extrafileinfo_render_{key}_file', file_rendered_template, overwrite=True)
        self._storage.set_additional_metadata(path, f'extrafileinfo_render_{key}_print', print_rendered_template, overwrite=True)

        self._logger.debug(f'Rendered template for {path}, output to extrafileinfo_render_{key}_print')

    def _render_all_file_info(self, template: Template, key: str, packed: bool, filter: bool=None, br_replace: bool=False):
        """Renders the file info for every gcode file in the storage"""
        def recurse(files):
            for file in files.values():
                if file['type'] == 'folder':
                    recurse(file['children'])
                elif file['typePath'][1] == 'gcode':
                    self._render_file_info(file['path'], template, key, packed, filter, br_replace)

        if filter is None:
            filter = self._settings.get(['filterEnabled'])
        files = self._storage.list_files()
        recurse(files)

    def on_api_command(self, command, _):
        import flask
        from octoprint.server import user_permission
        if not user_permission.can():
            return flask.make_response("Insufficient rights", 401)
        
        if command == 'force_render':
            setup_type = self._settings.get(['setup_type'])
            if setup_type == SETUP_SIMPLE:
                filter_enabled = self._settings.get(['filterEnabled'])
                self._render_all_file_info(self.default_template, KEY_SIMPLE, packed=True, filter=filter_enabled)
            elif setup_type == SETUP_CUSTOM:
                self._render_all_file_info(self.template, KEY_CUSTOM, packed=False, br_replace=True)
            
            return flask.make_response("OK", 200)
        
        return flask.make_response("Unknown command", 400)

    def get_settings_version(self):
        return 4
        
    def on_settings_migrate(self, target, current):
        self._logger.info('Migrating settings: {}=>{}'.format(current, target))
        cfg = self._settings.get(["config"])
        if cfg is None or (isinstance(cfg, list) and len(cfg) == 0):
            return

        if current is None and target > 1:
            while {'key': '', 'label': '', 'unit': ''} in cfg:
                cfg.remove({'key': '', 'label': '', 'unit': ''})

        if (current is None or current <= 2) and target >= 3:
            for i in range(len(cfg)):
                if 'showInStatesContainer' not in cfg[i]:
                    cfg[i]['showInStatesContainer'] = True
                    cfg[i]['showInFilesList'] = True

        self._settings.set(["config"], cfg)

        if current is not None and current <= 3 and target >= 4:
            ExtraFileInfoPlugin.migrate_to_version_4 = True

        return

    ##~~ Softwareupdate hook

    def get_update_information(self):
        return {
            "extrafileinfo": {
                "displayName": "ExtraFileInfo Plugin",
                "displayVersion": self._plugin_version,

                # version check: github repository
                "type": "github_release",
                "user": "larsjuhw",
                "repo": "OctoPrint-ExtraFileInfo",
                "current": self._plugin_version,
                "stable_branch": {
                    "name": "Stable",
                    "branch": "master",
                    "comittish": ["master"],
                }, "prerelease_branches": [
                    {
                        "name": "Release Candidate",
                        "branch": "rc",
                        "comittish": ["rc", "master"],
                    }
                ],
                # update method: pip
                "pip": "https://github.com/larsjuhw/OctoPrint-Extrafileinfo/archive/{target_version}.zip",
            }
        }


__plugin_name__ = "ExtraFileInfo"
__plugin_pythoncompat__ = ">=3,<4"


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = ExtraFileInfoPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
