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

## Version 1.2
- Requires Macro & Helper Library as a dependency, as I moved all the settings management code to a new class there
- Finish localizing all UI strings
- Module will now clean up after itself; if you set Macro Sorting to 'No', it will clean up all existing folders.
- Folders will only be created for non-GM users (assistants *do* get folders).
- Folders will be created if a user authors a macro when they previously had none.
- Folders will be deleted if a user's last macro is deleted.
- Authorless macros will continue to be simply unhandled; If you find yourself in a world that has macros without a valid author, please let me know, but I think it's rare enough that more work here would be ill-spent.