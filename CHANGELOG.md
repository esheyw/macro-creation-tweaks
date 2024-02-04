## Version 1.0
- Initial Release

## Version 1.0.1
- Fix version string mismatch with foundry package admin (mistake you only make once? I doubt it)

## Version 1.0.2
- Remove debug warnings

## Version 1.0.3
- Fix hook updater to not double hooks on setting change.

## Version 1.1.0
- Add functionality to sort user-authored macros into folders (closes #1)
  - Defaults to off
  - With or without a root containing folder
  - User folders will always be named their user's name, and coloured their user's colour, and will default to manual sorting but not overwrite if changed to alphabetical
  - Root folder, if enabled, will use the name and colour in settings for creation, but won't overwrite any changes made after.
- Add per-setting reset-to-default buttons

## Version 1.1.1
- Mark root folder setting as requiresReload

## Version 1.1.2
- Add minimal error handling and reporting for authorless macros when attempting to sort existing macros